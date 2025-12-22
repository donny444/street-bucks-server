import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Param,
  Req,
  Res,
} from "@nestjs/common";
import { Request, Response } from "express";

import { OrderService } from "../services/order.service";
import { OrderedMenuDto } from "../dtos/order.dto";

@Controller("orders")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(201)
  async MakeOrder(
    @Body() cartItems: OrderedMenuDto[],
    @Res() res: Response
  ): Promise<Response> {
    try {
      const order = await this.orderService.InsertOrder(cartItems);
      if (!order) {
        return res.status(400).json({ error: "Failed to make an order." });
      }

      return res.json({
        message: "Make an order with menu(s) in cart.",
        order_id: order.uuid,
      });
    } catch (err) {
      console.error("Error making an order:", err);
      return res.status(500).json({ error: "Failed to make an order." });
    }
  }

  @Get()
  async TodayOrders(
    @Req() req: Request,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const todayOrders = await this.orderService.GetTodayOrders();

      return res.json({
        message: "Get orders in current day.",
        today_orders: todayOrders,
      });
    } catch (err) {
      console.error("Error fetching orders:", err);
      return res.status(500).json({ error: "Failed to fetch orders." });
    }
  }

  @Get(":uuid")
  async SpecificOrder(
    @Param("uuid") uuid: string | undefined,
    @Res() res: Response
  ): Promise<Response> {
    try {
      if (!uuid) {
        return res.status(400).json({ error: "Order UUID is required." });
      }

      const order = await this.orderService.GetSpecificOrder({ uuid });
      if (!order) {
        return res.json({ message: "Order not found." });
      }

      return res.json({
        message: `Inspect the order: ${uuid}`,
        order,
      });
    } catch (err) {
      console.error("Error fetching specific order:", err);
      return res.status(500).json({ error: "Failed to fetch specific order." });
    }
  }
}
