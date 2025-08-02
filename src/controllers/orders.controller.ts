import { Controller, Get, Post, Param } from '@nestjs/common';
import { AppService } from '../app.service';

@Controller("orders")
export class OrdersController {
  constructor(private readonly appService: AppService) {}

  @Post()
  makeAnOrder(): string {
    return "Make an order with menu(s) in cart.";
  }

  @Get()
  getIcedMenus(): string {
    return "Get orders in current day.";
  }

  @Get(":id")
  getCakeMenus(@Param() params: any): string {
    return `Inspect the order: ${params.id}`;
  }
}