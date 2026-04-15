import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express";

import { InsightService } from "../services/insight.service";

import { BranchPayload } from "../decorators/branch.decorator";

import { BranchPayloadDto } from "../dtos/branch.dto";

@Controller("insights")
export class InsightController {
  constructor(private readonly insightService: InsightService) {}

  @Get("sales-today")
  async GetSalesToday(
    @BranchPayload() { branchId }: BranchPayloadDto,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const salesToday = await this.insightService.GetSalesToday(branchId);
      if (salesToday instanceof Error) {
        console.error("Error occurred in `GetSalesToday`:", salesToday);
        return res.status(500).json({ error: salesToday.message });
      }

      return res.json({
        message: "See today's menu sales.",
        insight: salesToday,
      });
    } catch (err) {
      console.error("Error occurred in `GetSalesToday`:", err);
      return res
        .status(500)
        .json({ error: "Failed to retrieve today's sales." });
    }
  }

  @Get("sales-this-week")
  async GetSalesThisWeek(
    @BranchPayload() { branchId }: BranchPayloadDto,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const salesThisWeek =
        await this.insightService.GetSalesThisWeek(branchId);
      if (salesThisWeek instanceof Error) {
        console.error("Error occurred in `GetSalesThisWeek`:", salesThisWeek);
        return res.status(500).json({ error: salesThisWeek.message });
      }

      return res.json({
        message: "See this week's menu sales.",
        insight: salesThisWeek,
      });
    } catch (err) {
      console.error("Error occurred in `GetSalesThisWeek`:", err);
      return res
        .status(500)
        .json({ error: "Failed to retrieve this week's sales." });
    }
  }

  @Get("sales-this-month")
  async GetSalesThisMonth(
    @BranchPayload() { branchId }: BranchPayloadDto,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const salesThisMonth =
        await this.insightService.GetSalesThisMonth(branchId);
      if (salesThisMonth instanceof Error) {
        console.error("Error occurred in `GetSalesThisMonth`:", salesThisMonth);
        return res.status(500).json({ error: salesThisMonth.message });
      }

      return res.json({
        message: "See this month's menu sales.",
        insight: salesThisMonth,
      });
    } catch (err) {
      console.error("Error occurred in `GetSalesThisMonth`:", err);
      return res
        .status(500)
        .json({ error: "Failed to retrieve this month's sales." });
    }
  }

  @Get("top-menus-by-quantity")
  async GetTopMenusByQuantity(
    @BranchPayload() { branchId }: BranchPayloadDto,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const topMenusByQuantity =
        await this.insightService.GetTopMenusByQuantity(branchId);
      if (topMenusByQuantity instanceof Error) {
        console.error(
          "Error occurred in `GetTopMenusByQuantity`:",
          topMenusByQuantity
        );
        return res.status(500).json({ error: topMenusByQuantity.message });
      }

      const labels = topMenusByQuantity.map((m) => m.menuName);
      const data = topMenusByQuantity.map((m) => m.totalQuantity);

      return res.json({
        message: "Retrieved top 5 sold menus by quantity.",
        insight: {
          labels,
          data,
        },
      });
    } catch (err) {
      console.error("Error occurred in `GetTopMenusByQuantity`:", err);
      return res
        .status(500)
        .json({ error: "Failed to retrieve top menus by quantity." });
    }
  }

  @Get("top-menus-by-revenue")
  async GetTopMenusByRevenue(
    @BranchPayload() { branchId }: BranchPayloadDto,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const topMenusByRevenue =
        await this.insightService.GetTopMenusByRevenue(branchId);
      if (topMenusByRevenue instanceof Error) {
        console.error(
          "Error occurred in `GetTopMenusByRevenue`:",
          topMenusByRevenue
        );
        return res.status(500).json({ error: topMenusByRevenue.message });
      }

      const labels = topMenusByRevenue.map((m) => m.menuName);
      const data = topMenusByRevenue.map((m) => m.totalRevenue);

      return res.json({
        message: "Retrieved top 5 sold menus by revenue.",
        insight: {
          labels,
          data,
        },
      });
    } catch (err) {
      console.error("Error occurred in `GetTopMenusByRevenue`:", err);
      return res
        .status(500)
        .json({ error: "Failed to retrieve top menus by revenue." });
    }
  }

  @Get("sales-in-week")
  async GetSalesInWeek(
    @BranchPayload() { branchId }: BranchPayloadDto,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const salesInWeek = await this.insightService.GetSalesInWeek(branchId);
      if (salesInWeek instanceof Error) {
        console.error("Error occurred in `GetSalesInWeek`:", salesInWeek);
        return res.status(500).json({ error: salesInWeek.message });
      }

      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setHours(0, 0, 0, 0);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

      const counts: Map<string, number> = new Map();

      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const dayAndMonth = `${date.getDate()}/${date.getMonth() + 1}`;
        counts.set(dayAndMonth, 0);
      }

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
      console.error("Error occurred in `GetSalesInWeek`:", err);
      return res
        .status(500)
        .json({ error: "Failed to retrieve sales in this week." });
    }
  }

  @Get("sales-in-month")
  async GetSalesInMonth(
    @BranchPayload() { branchId }: BranchPayloadDto,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const salesInMonth = await this.insightService.GetSalesInMonth(branchId);
      if (salesInMonth instanceof Error) {
        return res.status(500).json({ error: salesInMonth.message });
      }

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const daysInMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
      ).getDate();

      const countMap: Map<string, number> = new Map();

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(firstDayOfMonth);
        date.setDate(day);
        const dayAndMonth = `${date.getDate()}/${date.getMonth() + 1}`;
        countMap.set(dayAndMonth, 0);
      }

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
      console.error("Error occurred in `GetSalesInMonth`:", err);
      return res
        .status(500)
        .json({ error: "Failed to retrieve sales in this month." });
    }
  }

  @Get("sales-in-year")
  async GetSalesInYear(
    @BranchPayload() { branchId }: BranchPayloadDto,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const salesInYear = await this.insightService.GetSalesInYear(branchId);
      if (salesInYear instanceof Error) {
        return res.status(500).json({ error: salesInYear.message });
      }

      const countArr: number[] = new Array(12).fill(0) as number[];

      const salesMap: Map<string, number[]> = new Map([]);

      salesInYear.forEach((sale) => {
        const date = new Date(sale.order.timestamp);
        const month = date.getMonth(); // 0-11
        if (!salesMap.has(sale.menu.category)) {
          salesMap.set(sale.menu.category, countArr);
        }
        salesMap.get(sale.menu.category)![month]++;
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
      console.error("Error occurred in `GetSalesInYear`:", err);
      return res
        .status(500)
        .json({ error: "Failed to retrieve sales in this year." });
    }
  }
}
