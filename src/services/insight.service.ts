import { Injectable } from "@nestjs/common";
import { PrismaClient } from "../../prisma/client";

import {
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
    timestamps: { timestamp: bigint }[]
  ): { timestamp: number }[] {
    return timestamps.map((t) => ({
      timestamp: Number(t.timestamp),
    }));
  }

  async GetSalesToday(branchId: number): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startTimestamp = startOfDay.getTime();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const endTimestamp = endOfDay.getTime();

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
    // return this.serializeOrders(salesToday);
  }

  async GetSalesThisWeek(branchId: number): Promise<number> {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);
    const startTimestamp = startOfWeek.getTime();
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    const endTimestamp = endOfWeek.getTime();

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
  }

  async GetSalesThisMonth(branchId: number): Promise<number> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    const startTimestamp = startOfMonth.getTime();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    const endTimestamp = endOfMonth.getTime();

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
  }

  async GetTopMenusByQuantity(
    branchId: number
  ): Promise<TopMenusByQuantityDto[]> {
    const topSold = await this.prisma.entry.groupBy({
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

    const menus = await this.prisma.menu.findMany({
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
  }

  async GetTopMenusByRevenue(
    branchId: number
  ): Promise<TopMenusByRevenueDto[]> {
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
  }

  async GetSalesInWeek(branchId: number): Promise<{ timestamp: number }[]> {
    const now = new Date();
    const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    firstDayOfWeek.setHours(0, 0, 0, 0);
    const startTimestamp = firstDayOfWeek.getTime();
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);
    lastDayOfWeek.setHours(23, 59, 59, 999);
    const endTimestamp = lastDayOfWeek.getTime();

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
    // return this.serializeOrders(salesThisWeek);
  }

  async GetSalesInMonth(branchId: number): Promise<{ timestamp: number }[]> {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    firstDayOfMonth.setHours(0, 0, 0, 0);
    const startTimestamp = firstDayOfMonth.getTime();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    lastDayOfMonth.setHours(23, 59, 59, 999);
    const endTimestamp = lastDayOfMonth.getTime();

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
  }

  async GetSalesInYear(branchId: number): Promise<SaleByCategoryDto[]> {
    const now = new Date();
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
    firstDayOfYear.setHours(0, 0, 0, 0);
    const startTimestamp = firstDayOfYear.getTime();
    const lastDayOfYear = new Date(now.getFullYear(), 11, 31);
    lastDayOfYear.setHours(23, 59, 59, 999);
    const endTimestamp = lastDayOfYear.getTime();

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
  }
}
