import { Controller, Get, HttpCode, Res } from "@nestjs/common";
import { Response } from "express";

import { InsightService } from "../services/insight.service";

@Controller("insights")
export class InsightController {
  constructor(private readonly insightService: InsightService) {}

  @HttpCode(200)
  @Get("sales-today")
  async SalesToday(@Res() res: Response): Promise<Response> {
    try {
      const salesToday = await this.insightService.GetSalesToday();

      return res.json({
        message: "See today's menu sales.",
        insight: salesToday,
      });
    } catch (err) {
      console.error("Error retrieving today's sales:", err);
      return res
        .status(500)
        .json({ error: "Failed to retrieve today's sales." });
    }
  }

  @HttpCode(200)
  @Get("top-menus")
  async TopMenus(@Res() res: Response): Promise<Response> {
    try {
      const topMenus = await this.insightService.GetTopMenus();
      if (topMenus.length < 1) {
        return res.json({
          message:
            "No menu sales data available, thus top menus can't be calculated.",
          insight: [],
        });
      }

      const labels = topMenus.map((m) => m.menuName);
      const data = topMenus.map((m) => m.totalQuantity);

      return res.json({
        message: "Retrieved top 5 sold menus.",
        insight: {
          labels,
          data,
        },
      });
    } catch (err) {
      console.error("Error retrieving top menus:", err);
      return res.status(500).json({ error: "Failed to retrieve top menus." });
    }
  }

  @HttpCode(200)
  @Get("sales-in-week")
  async SalesInWeek(@Res() res: Response): Promise<Response> {
    try {
      const salesInWeek = await this.insightService.GetSalesInWeek();

      const counts: Map<string, number> = new Map();

      salesInWeek.forEach((sale) => {
        const date = new Date(sale.timestamp);
        const dayAndMonth = `${date.getDate()}/${date.getMonth() + 1}`;
        counts.set(dayAndMonth, (counts.get(dayAndMonth) || 0) + 1);
      });

      const sortedCounts = new Map(
        Array.from(counts.entries()).sort((a, b) => {
          const [dayA, monthA] = a[0].split("/").map(Number);
          const [dayB, monthB] = b[0].split("/").map(Number);
          if (monthA === monthB) {
            return dayA - dayB;
          }
          return monthA - monthB;
        })
      );

      const labels = Array.from(sortedCounts.keys());
      const data = Array.from(sortedCounts.values());

      return res.json({
        message: "See counts of sales for every day in this week.",
        insight: { labels, data },
      });
    } catch (err) {
      console.error("Error retrieving this week's sales:", err);
      return res
        .status(500)
        .json({ error: "Failed to retrieve this week's sales." });
    }
  }

  @HttpCode(200)
  @Get("sales-in-month")
  async SalesInMonth(@Res() res: Response): Promise<Response> {
    try {
      const salesInMonth = await this.insightService.GetSalesInMonth();

      const countMap: Map<string, number> = new Map();

      salesInMonth.forEach((sale) => {
        const date = new Date(sale.timestamp);
        const dayAndMonth = `${date.getDate()}/${date.getMonth() + 1}`;
        countMap.set(dayAndMonth, (countMap.get(dayAndMonth) || 0) + 1);
      });

      const sortedCounts = new Map(
        Array.from(countMap.entries()).sort((a, b) => {
          const [dayA, monthA] = a[0].split("/").map(Number);
          const [dayB, monthB] = b[0].split("/").map(Number);
          if (monthA === monthB) {
            return dayA - dayB;
          }
          return monthA - monthB;
        })
      );

      const labels = Array.from(sortedCounts.keys());
      const data = Array.from(sortedCounts.values());

      return res.json({
        message: "See counts of sales for every day in this month.",
        insight: { labels, data },
      });
    } catch (err) {
      console.error("Error retrieving this month's sales:", err);
      return res
        .status(500)
        .json({ error: "Failed to retrieve this month's sales." });
    }
  }

  @HttpCode(200)
  @Get("sales-in-year")
  async SalesInYear(@Res() res: Response): Promise<Response> {
    try {
      const salesInYear = await this.insightService.GetSalesInYear();

      const countArr: number[] = new Array(12).fill(0) as number[];

      const salesMap: Map<string, number[]> = new Map([]);

      salesInYear.forEach((sale) => {
        const date = new Date(sale.order.timestamp as number);
        const month = date.getMonth(); // 0-11
        if (!salesMap.has(sale.menu.type)) {
          salesMap.set(sale.menu.type, countArr);
        }
        salesMap.get(sale.menu.type)![month]++;
      });

      const salesByType = Array.from(salesMap, ([label, data]) => ({
        label,
        data,
      }));

      return res.json({
        message: "See counts of sales for every month in this year.",
        insight: salesByType,
      });
    } catch (err) {
      console.error("Error retrieving this year's sales:", err);
      return res
        .status(500)
        .json({ error: "Failed to retrieve this year's sales." });
    }
  }
}
