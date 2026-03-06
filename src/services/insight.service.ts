import { Injectable } from "@nestjs/common";
import { PrismaClient } from "../../prisma/client";

import {
  SalesCountDto,
  SalesInPeriodDto,
  SerializedSalesInPeriodDto,
  TopMenusByQuantityDto,
  TopMenusByRevenueDto,
  SaleByCategoryDto,
} from "../dtos/insight.dto";

@Injectable()
export class InsightService {
  constructor(private prisma: PrismaClient) {}

  // helper to convert bigint fields to JSON-safe values
  // private serializeOrders(orders: any[]) {
  //   return orders.map((o) => ({
  //     ...o,
  //     timestamp:
  //       typeof o.timestamp === "bigint" ? Number(o.timestamp) : o.timestamp,
  //   }));
  // }
  private serializeTimestamps(
    timestamps: SalesInPeriodDto[]
  ): SerializedSalesInPeriodDto[] {
    return timestamps.map((t) => ({
      timestamp: Number(t.timestamp),
    }));
  }

  private toError(tag: string, err: unknown): Error {
    return new Error(
      `${tag} error: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  async GetSalesToday(branchId: number): Promise<SalesCountDto | Error> {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const startTimestamp = startOfDay.getTime();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const endTimestamp = endOfDay.getTime();

      try {
        const salesToday = await this.prisma.order.count({
          where: {
            timestamp: {
              gte: startTimestamp,
              lte: endTimestamp,
            },
            branchId: BigInt(branchId),
          },
        });

        return salesToday;
      } catch (err) {
        throw this.toError("Failed to count today's sales", err);
      }
    } catch (err) {
      return err instanceof Error ? err : new Error(String(err));
    }

    // return this.serializeOrders(salesToday);
  }

  async GetSalesThisWeek(branchId: number): Promise<SalesCountDto | Error> {
    try {
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      startOfWeek.setHours(0, 0, 0, 0);
      const startTimestamp = startOfWeek.getTime();
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      const endTimestamp = endOfWeek.getTime();

      try {
        const salesThisWeek = await this.prisma.order.count({
          where: {
            timestamp: {
              gte: startTimestamp,
              lte: endTimestamp,
            },
            branchId: BigInt(branchId),
          },
        });

        return salesThisWeek;
      } catch (err) {
        throw this.toError("Failed to count this week's sales", err);
      }
    } catch (err) {
      return err instanceof Error ? err : new Error(String(err));
    }
  }

  async GetSalesThisMonth(branchId: number): Promise<SalesCountDto | Error> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      startOfMonth.setHours(0, 0, 0, 0);
      const startTimestamp = startOfMonth.getTime();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      const endTimestamp = endOfMonth.getTime();

      try {
        const salesThisMonth = await this.prisma.order.count({
          where: {
            timestamp: {
              gte: startTimestamp,
              lte: endTimestamp,
            },
            branchId: BigInt(branchId),
          },
        });

        return salesThisMonth;
      } catch (err) {
        throw this.toError("Failed to count this month's sales", err);
      }
    } catch (err) {
      return err instanceof Error ? err : new Error(String(err));
    }
  }

  async GetTopMenusByQuantity(
    branchId: number
  ): Promise<TopMenusByQuantityDto[] | Error> {
    try {
      try {
        return await this.prisma.$transaction(async (prisma) => {
          const topSold = await prisma.entry.groupBy({
            by: ["menuId"],
            _sum: { quantity: true },
            orderBy: [{ _sum: { quantity: "desc" } }],
            take: 5,
            where: {
              order: {
                branchId: BigInt(branchId),
              },
            },
          });

          const menus = await prisma.menu.findMany({
            where: { name: { in: topSold.map((item) => item.menuId) } },
            select: { name: true },
          });

          const topMenus = topSold
            .map((m) => ({
              menuName:
                menus.find((menu) => menu.name === m.menuId)?.name ?? "Unnamed",
              totalQuantity: m._sum.quantity ?? 0,
            }))
            .sort((a, b) => b.totalQuantity - a.totalQuantity)
            .slice(0, 5);

          return topMenus;
        });
      } catch (err) {
        throw this.toError("Failed to get top menus by quantity", err);
      }
    } catch (err) {
      return err instanceof Error ? err : new Error(String(err));
    }
  }

  async GetTopMenusByRevenue(
    branchId: number
  ): Promise<TopMenusByRevenueDto[] | Error> {
    try {
      try {
        // Fetch all entries for the branch with menu prices
        const entries = await this.prisma.entry.findMany({
          select: {
            menuId: true,
            quantity: true,
            menu: {
              select: {
                name: true,
                price: true,
              },
            },
          },
          where: {
            order: {
              branchId: BigInt(branchId),
            },
          },
        });

        // Calculate revenue per menu (price * quantity)
        const revenueMap = new Map<
          string,
          { menuName: string; totalRevenue: number }
        >();

        entries.forEach((e) => {
          const revenue = e.menu.price * e.quantity;
          const existing = revenueMap.get(e.menuId);
          if (existing) {
            existing.totalRevenue += revenue;
          } else {
            revenueMap.set(e.menuId, {
              menuName: e.menu.name,
              totalRevenue: revenue,
            });
          }
        });

        // Sort by revenue descending and take top 5
        const topMenus = Array.from(revenueMap.values())
          .sort((a, b) => b.totalRevenue - a.totalRevenue)
          .slice(0, 5);

        return topMenus;
      } catch (err) {
        throw this.toError("Failed to get top menus by revenue", err);
      }
    } catch (err) {
      return err instanceof Error ? err : new Error(String(err));
    }
  }

  async GetSalesInWeek(
    branchId: number
  ): Promise<SerializedSalesInPeriodDto[] | Error> {
    try {
      const now = new Date();
      const firstDayOfWeek = new Date(
        now.setDate(now.getDate() - now.getDay())
      );
      firstDayOfWeek.setHours(0, 0, 0, 0);
      const startTimestamp = firstDayOfWeek.getTime();
      const lastDayOfWeek = new Date(firstDayOfWeek);
      lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);
      lastDayOfWeek.setHours(23, 59, 59, 999);
      const endTimestamp = lastDayOfWeek.getTime();

      try {
        const salesInWeek = await this.prisma.order.findMany({
          select: { timestamp: true },
          where: {
            timestamp: {
              gte: startTimestamp,
              lte: endTimestamp,
            },
            branchId: BigInt(branchId),
          },
        });

        return this.serializeTimestamps(salesInWeek);
      } catch (err) {
        throw this.toError("Failed to get sales timestamps in week", err);
      }
    } catch (err) {
      return err instanceof Error ? err : new Error(String(err));
    }
  }

  async GetSalesInMonth(
    branchId: number
  ): Promise<SerializedSalesInPeriodDto[] | Error> {
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      firstDayOfMonth.setHours(0, 0, 0, 0);
      const startTimestamp = firstDayOfMonth.getTime();
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      lastDayOfMonth.setHours(23, 59, 59, 999);
      const endTimestamp = lastDayOfMonth.getTime();

      try {
        const salesInMonth = await this.prisma.order.findMany({
          select: { timestamp: true },
          where: {
            timestamp: {
              gte: startTimestamp,
              lte: endTimestamp,
            },
            branchId: BigInt(branchId),
          },
        });

        return this.serializeTimestamps(salesInMonth);
        // return this.serializeOrders(salesThisMonth);
      } catch (err) {
        throw this.toError("Failed to get sales timestamps in month", err);
      }
    } catch (err) {
      return err instanceof Error ? err : new Error(String(err));
    }
  }

  async GetSalesInYear(branchId: number): Promise<SaleByCategoryDto[] | Error> {
    try {
      const now = new Date();
      const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
      firstDayOfYear.setHours(0, 0, 0, 0);
      const startTimestamp = firstDayOfYear.getTime();
      const lastDayOfYear = new Date(now.getFullYear(), 11, 31);
      lastDayOfYear.setHours(23, 59, 59, 999);
      const endTimestamp = lastDayOfYear.getTime();

      try {
        const salesInYear = await this.prisma.entry.findMany({
          select: {
            order: {
              select: { timestamp: true },
            },
            menu: {
              select: { category: true },
            },
          },
          where: {
            order: {
              timestamp: {
                gte: startTimestamp,
                lte: endTimestamp,
              },
              branchId: BigInt(branchId),
            },
          },
        });

        // convert bigint timestamp to number and expose it at the top level
        const formattedSalesInYear = salesInYear.map((sale) => ({
          ...sale,
          order: {
            timestamp: Number(sale.order.timestamp),
          },
        }));

        return formattedSalesInYear;
      } catch (err) {
        throw this.toError("Failed to get sales in year by category", err);
      }
    } catch (err) {
      return err instanceof Error ? err : new Error(String(err));
    }
  }
}
