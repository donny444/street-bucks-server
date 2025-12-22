import { Injectable } from "@nestjs/common";
import { PrismaClient } from "../../prisma/client";

import { TopMenusByQuantityDto, SaleByCategoryDto } from "../dtos/insight.dto";

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

  async GetSalesToday(): Promise<number> {
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
      },
    });

    return salesToday;
    // return this.serializeOrders(salesToday);
  }

  async GetTopMenus(): Promise<TopMenusByQuantityDto[]> {
    const topSold = await this.prisma.orderMenu.groupBy({
      by: ["menuId"],
      _sum: { quantity: true },
      orderBy: [{ _sum: { quantity: "desc" } }],
      take: 5,
    });

    const menus = await this.prisma.menu.findMany({
      where: { id: { in: topSold.map((item) => item.menuId) } },
      select: { id: true, name: true },
    });

    const topMenus = topSold
      .map((m) => ({
        menuName: menus.find((menu) => menu.id === m.menuId)?.name ?? "Unnamed",
        totalQuantity: m._sum.quantity ?? 0,
      }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5);

    return topMenus;
  }

  async GetSalesInWeek(): Promise<{ timestamp: number }[]> {
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
      },
    });

    return this.serializeTimestamps(salesInWeek);
    // return this.serializeOrders(salesThisWeek);
  }

  async GetSalesInMonth(): Promise<{ timestamp: number }[]> {
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
      },
    });

    return this.serializeTimestamps(salesInMonth);
    // return this.serializeOrders(salesThisMonth);
  }

  async GetSalesInYear(): Promise<SaleByCategoryDto[]> {
    const now = new Date();
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
    firstDayOfYear.setHours(0, 0, 0, 0);
    const startTimestamp = firstDayOfYear.getTime();
    const lastDayOfYear = new Date(now.getFullYear(), 11, 31);
    lastDayOfYear.setHours(23, 59, 59, 999);
    const endTimestamp = lastDayOfYear.getTime();

    const salesInYear = await this.prisma.orderMenu.findMany({
      select: {
        order: {
          select: { timestamp: true },
        },
        menu: {
          select: { type: true },
        },
      },
      where: {
        order: {
          timestamp: {
            gte: startTimestamp,
            lte: endTimestamp,
          },
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
