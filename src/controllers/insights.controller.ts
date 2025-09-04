import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express";

import { AppService } from "../app.service";

@Controller("insights")
export class InsightsController {
  constructor(private readonly appService: AppService) {}

  @Get("sales-today")
  SalesToday(@Res() res: Response): Response {
    try {
      return res.json({ message: "See today's menu sales." });
    } catch (err) {
      console.error("Error retrieving today's sales:", err);
      return res
        .status(500)
        .json({ error: "Failed to retrieve today's sales." });
    }
  }

  @Get("sales-this-week")
  SalesThisWeek(@Res() res: Response): Response {
    try {
      return res.json({
        message: "See counts of sales for every day in this week.",
      });
    } catch (err) {
      console.error("Error retrieving this week's sales:", err);
      return res
        .status(500)
        .json({ error: "Failed to retrieve this week's sales." });
    }
  }

  @Get("sales-this-month")
  SalesThisMonth(@Res() res: Response): Response {
    try {
      return res.json({
        message: "See counts of sales for every day in this month.",
      });
    } catch (err) {
      console.error("Error retrieving this month's sales:", err);
      return res
        .status(500)
        .json({ error: "Failed to retrieve this month's sales." });
    }
  }
}
