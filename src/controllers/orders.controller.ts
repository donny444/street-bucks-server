import { Controller, Get, Post, Param, Req, Res } from '@nestjs/common';
import { Request, Response, } from 'express';
import { AppService } from '../app.service';

@Controller("orders")
export class OrdersController {
  constructor(private readonly appService: AppService) {}

  @Post()
  makeAnOrder(@Req() req: Request, @Res() res: Response): Response {
    try {
      const orderId = 0;
      return res.json({
        message: "Make an order with menu(s) in cart.",
        order_id: orderId,
      });
    } catch (err) {
      console.error("Error making an order:", err);
      return res.json({ error: "Failed to make an order." });
    }
  }

  @Get()
  getTodayOrders(@Req() req: Request, @Res() res: Response): Response {
    try {
      const todayOrders = [];
      return res.json({
        message: "Get orders in current day.",
        today_orders: todayOrders,
      });
    } catch (err) {
      console.error("Error fetching orders:", err);
      return res.json({ error: "Failed to fetch orders." });
    }
  }

  @Get(":id")
  getSpecificOrder(@Param() params: any, @Res() res: Response): Response {
    try {
      const order = {};
      return res.json({
        message: `Inspect the order: ${params.id}`,
        order,
      });
    } catch (err) {
      console.error("Error fetching specific order:", err);
      return res.json({ error: "Failed to fetch specific order." });
    }
  }
}