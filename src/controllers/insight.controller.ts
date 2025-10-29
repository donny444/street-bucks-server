import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express";

import { InsightService } from "../services/insight.service";

@Controller("insights")
export class InsightController {
  constructor(private readonly insightService: InsightService) {}

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

  @Get("sales-this-week")
  async SalesThisWeek(@Res() res: Response): Promise<Response> {
    try {
      const salesThisWeek = await this.insightService.GetSalesThisWeek();

      return res.json({
        message: "See counts of sales for every day in this week.",
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
  async SalesThisMonth(@Res() res: Response): Promise<Response> {
    try {
      const salesThisMonth = await this.insightService.GetSalesThisMonth();

      return res.json({
        message: "See counts of sales for every day in this month.",
        insight: salesThisMonth,
      });
    } catch (err) {
      console.error("Error retrieving this month's sales:", err);
      return res
        .status(500)
        .json({ error: "Failed to retrieve this month's sales." });
    }
  }
}
