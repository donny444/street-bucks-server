import { Injectable } from "@nestjs/common";
import { PrismaClient } from "../../prisma/client";

@Injectable()
export class InsightsService {
  constructor(private prisma: PrismaClient) {}

  async GetSalesToday() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startTimestamp = startOfDay.getTime();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const endTimestamp = endOfDay.getTime();

    const salesToday = await this.prisma.order.findMany({
      where: {
        timestamp: {
          gte: startTimestamp,
          lte: endTimestamp,
        },
      },
    });

    return salesToday;
  }

  async GetSalesThisWeek() {
    const now = new Date();
    const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    firstDayOfWeek.setHours(0, 0, 0, 0);
    const startTimestamp = firstDayOfWeek.getTime();
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);
    lastDayOfWeek.setHours(23, 59, 59, 999);
    const endTimestamp = lastDayOfWeek.getTime();

    const salesThisWeek = await this.prisma.order.findMany({
      where: {
        timestamp: {
          gte: startTimestamp,
          lte: endTimestamp,
        },
      },
    });

    return salesThisWeek;
  }

  async GetSalesThisMonth() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    firstDayOfMonth.setHours(0, 0, 0, 0);
    const startTimestamp = firstDayOfMonth.getTime();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    lastDayOfMonth.setHours(23, 59, 59, 999);
    const endTimestamp = lastDayOfMonth.getTime();

    const salesThisMonth = await this.prisma.order.findMany({
      where: {
        timestamp: {
          gte: startTimestamp,
          lte: endTimestamp,
        },
      },
    });

    return salesThisMonth;
  }
}
