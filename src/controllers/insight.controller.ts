import { Controller, Get, Headers, HttpCode, Res } from "@nestjs/common";
import { Response } from "express";

import { InsightService } from "../services/insight.service";

import { BranchPayloadDto } from "../dtos/branch.dto";

@Controller("insights")
export class InsightController {
  constructor(private readonly insightService: InsightService) {}

  @Get("sales-today")
  @HttpCode(200)
  async GetSalesToday(
    @Headers("branch-payload") branchPayload: string,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const parsedBranchPayload = JSON.parse(
        branchPayload || "{}"
      ) as BranchPayloadDto;
      if (!parsedBranchPayload) {
        return res.status(500).json({
          error:
            "Failed to parse branch payload from `branch-payload` request header.",
        });
      }

      const { branchId } = parsedBranchPayload;

      const salesToday = await this.insightService.GetSalesToday(branchId);

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

  @Get("sales-this-week")
  @HttpCode(200)
  async GetSalesThisWeek(
    @Headers("branch-payload") branchPayload: string,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const parsedBranchPayload = JSON.parse(
        branchPayload || "{}"
      ) as BranchPayloadDto;
      if (!parsedBranchPayload) {
        return res.status(500).json({
          error:
            "Failed to parse branch payload from `branch-payload` request header.",
        });
      }

      const { branchId } = parsedBranchPayload;

      const salesThisWeek =
        await this.insightService.GetSalesThisWeek(branchId);

      return res.json({
        message: "See this week's menu sales.",
        insight: salesThisWeek,
      });
    } catch (err) {
      console.error("Error retrieving this week's sales:", err);
      return res
        .status(500)
        .json({ error: "Failed to retrieve this week's sales." });
    }
  }

  @Get("sales-this-month")
  @HttpCode(200)
  async GetSalesThisMonth(
    @Headers("branch-payload") branchPayload: string,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const parsedBranchPayload = JSON.parse(
        branchPayload || "{}"
      ) as BranchPayloadDto;
      if (!parsedBranchPayload) {
        return res.status(500).json({
          error:
            "Failed to parse branch payload from `branch-payload` request header.",
        });
      }

      const { branchId } = parsedBranchPayload;

      const salesThisMonth =
        await this.insightService.GetSalesThisMonth(branchId);

      return res.json({
        message: "See this month's menu sales.",
        insight: salesThisMonth,
      });
    } catch (err) {
      console.error("Error retrieving this month's sales:", err);
      return res
        .status(500)
        .json({ error: "Failed to retrieve this month's sales." });
    }
  }

  @Get("top-menus-by-quantity")
  @HttpCode(200)
  async GetTopMenusByQuantity(
    @Headers("branch-payload") branchPayload: string,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const parsedBranchPayload = JSON.parse(
        branchPayload || "{}"
      ) as BranchPayloadDto;
      if (!parsedBranchPayload) {
        return res.status(500).json({
          error:
            "Failed to parse branch payload from `branch-payload` request header.",
        });
      }

      const { branchId } = parsedBranchPayload;

      const topMenusByQuantity =
        await this.insightService.GetTopMenusByQuantity(branchId);
      if (topMenusByQuantity.length < 1) {
        return res.json({
          message:
            "No menu sales data available, thus top menus can't be calculated.",
          insight: [],
        });
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
      console.error("Error retrieving top menus by quantity:", err);
      return res
        .status(500)
        .json({ error: "Failed to retrieve top menus by quantity." });
    }
  }

  @Get("top-menus-by-revenue")
  @HttpCode(200)
  async GetTopMenusByRevenue(
    @Headers("branch-payload") branchPayload: string,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const parsedBranchPayload = JSON.parse(
        branchPayload || "{}"
      ) as BranchPayloadDto;
      if (!parsedBranchPayload) {
        return res.status(500).json({
          error:
            "Failed to parse branch payload from `branch-payload` request header.",
        });
      }

      const { branchId } = parsedBranchPayload;

      const topMenusByRevenue =
        await this.insightService.GetTopMenusByRevenue(branchId);
      if (topMenusByRevenue.length < 1) {
        return res.json({
          message:
            "No menu sales data available, thus top menus can't be calculated.",
          insight: [],
        });
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
      console.error("Error retrieving top menus by revenue:", err);
      return res
        .status(500)
        .json({ error: "Failed to retrieve top menus by revenue." });
    }
  }

  @Get("sales-in-week")
  @HttpCode(200)
  async GetSalesInWeek(
    @Headers("branch-payload") branchPayload: string,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const parsedBranchPayload = JSON.parse(
        branchPayload || "{}"
      ) as BranchPayloadDto;
      if (!parsedBranchPayload) {
        return res.status(500).json({
          error:
            "Failed to parse branch payload from `branch-payload` request header.",
        });
      }

      const { branchId } = parsedBranchPayload;

      const salesInWeek = await this.insightService.GetSalesInWeek(branchId);

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

  @Get("sales-in-month")
  @HttpCode(200)
  async GetSalesInMonth(
    @Headers("branch-payload") branchPayload: string,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const parsedBranchPayload = JSON.parse(
        branchPayload || "{}"
      ) as BranchPayloadDto;
      if (!parsedBranchPayload) {
        return res.status(500).json({
          error:
            "Failed to parse branch payload from `branch-payload` request header.",
        });
      }

      const { branchId } = parsedBranchPayload;

      const salesInMonth = await this.insightService.GetSalesInMonth(branchId);

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

  @Get("sales-in-year")
  @HttpCode(200)
  async GetSalesInYear(
    @Headers("branch-payload") branchPayload: string,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const parsedBranchPayload = JSON.parse(
        branchPayload || "{}"
      ) as BranchPayloadDto;
      if (!parsedBranchPayload) {
        return res.status(500).json({
          error:
            "Failed to parse branch payload from `branch-payload` request header.",
        });
      }

      const { branchId } = parsedBranchPayload;

      const salesInYear = await this.insightService.GetSalesInYear(branchId);

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
      console.error("Error retrieving this year's sales:", err);
      return res
        .status(500)
        .json({ error: "Failed to retrieve this year's sales." });
    }
  }
}
