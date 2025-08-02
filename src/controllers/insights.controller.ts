import { Controller, Get } from '@nestjs/common';
import { AppService } from '../app.service';

@Controller("insights")
export class InsightsController {
  constructor(private readonly appService: AppService) {}

  @Get("sales-today")
  SalesToday(): string {
    return "See today's menu sales.";
  }

  @Get("sales-this-week")
  SalesThisWeek(): string {
    return "See counts of sales for every day in this week.";
  }

  @Get("sales-this-month")
  SalesThisMonth(): string {
    return "See counts of sales for every day in this month.";
  }

}