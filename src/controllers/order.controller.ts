import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Param,
  Res,
} from "@nestjs/common";
import { Response } from "express";

import { OrderService } from "../services/order.service";
import { BranchPayload } from "../decorators/branch.decorator";

import { OrderedMenuDto } from "../dtos/order.dto";
import { BranchPayloadDto } from "../dtos/branch.dto";

@Controller("orders")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(201)
  async MakeOrder(
    @BranchPayload() { branchId }: BranchPayloadDto,
    @Body() cartItems: OrderedMenuDto[],
    @Res() res: Response
  ): Promise<Response> {
    try {
      const order = await this.orderService.InsertOrder(cartItems, branchId);
      if (order instanceof Error) {
        console.error("Error occurred in `InsertOrder`:", order);
        return res.status(500).json({ error: order.message });
      }

      // Generate PDF receipt after successful order creation
      const orderDetails = await this.orderService.FindOrderDetails({
        uuid: order.uuid,
        branchId: BigInt(branchId),
      });
      if (!orderDetails) {
        return res
          .status(500)
          .json({ error: "Failed to retrieve the order details." });
      }
      if (orderDetails instanceof Error) {
        console.error("Error occurred in `FindOrderDetails`:", orderDetails);
        return res.status(500).json({ error: orderDetails.message });
      }

      if (orderDetails) {
        try {
          const receiptPath = await this.orderService.GenerateReceipt({
            uuid: orderDetails.uuid,
            timestamp: Number(order.timestamp),
            totalPrice: orderDetails.totalPrice,
            entries: orderDetails.entry.map((e) => ({
              menuName: e.menu.name,
              price: e.menu.price,
              quantity: e.quantity,
            })),
          });
          console.log("[MakeOrder] Receipt generated at:", receiptPath);
        } catch (receiptErr) {
          console.error("[MakeOrder] Failed to generate receipt:", receiptErr);
          // Continue with order creation even if receipt generation fails
        }
      }

      return res.json({
        message: "The order has been made with menu(s) in cart.",
        order_id: order.uuid,
      });
    } catch (err) {
      console.error("Error occurred in `MakeOrder`:", err);
      return res.status(500).json({ error: "Failed to make an order." });
    }
  }

  @Get()
  async GetTodayOrders(
    @BranchPayload() { branchId }: BranchPayloadDto,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const todayOrders = await this.orderService.SelectTodayOrders(branchId);
      if (todayOrders instanceof Error) {
        console.error("Error occurred in `SelectTodayOrders`:", todayOrders);
        return res.status(500).json({ error: todayOrders.message });
      }
      if (todayOrders.length === 0) {
        return res
          .status(404)
          .json({ error: "No orders in current day found." });
      }

      return res.json({
        message: "Get orders in current day.",
        today_orders: todayOrders,
      });
    } catch (err) {
      console.error("Error occurred in `GetTodayOrders`:", err);
      return res.status(500).json({ error: "Failed to fetch today orders." });
    }
  }

  @Get(":uuid")
  async GetOrderDetails(
    @BranchPayload() { branchId }: BranchPayloadDto,
    @Param("uuid") uuid: string,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const order = await this.orderService.FindOrderDetails({
        uuid,
        branchId,
      });
      if (order instanceof Error) {
        console.error("Error occurred in `FindOrderDetails`:", order);
        return res.status(500).json({ error: order.message });
      }
      if (!order) {
        return res.status(404).json({ error: "Order not found." });
      }

      return res.json({
        message: `Inspect the order: ${uuid}`,
        order,
      });
    } catch (err) {
      console.error("Error occurred in `GetOrderDetails`:", err);
      return res.status(500).json({ error: "Failed to fetch specific order." });
    }
  }

  @Get("find/:uuid")
  async GetOrderByUuid(
    @Param("uuid") uuid: string,
    @Res() res: Response
  ): Promise<Response> {
    try {
      if (!uuid) {
        return res.status(400).json({ error: "Order UUID is required." });
      }

      const foundOrder = await this.orderService.FindOrderByUuid(uuid);
      if (foundOrder instanceof Error) {
        console.error("Error occurred in `FindOrderByUuid`:", foundOrder);
        return res.status(500).json({ error: foundOrder.message });
      }
      if (!foundOrder) {
        return res.status(404).json({ error: "Order not found." });
      }

      return res.json({
        message: `Found order with UUID: ${uuid}`,
        found_order: {
          uuid: foundOrder.uuid,
          branchId: Number(foundOrder.branchId),
          timestamp: Number(foundOrder.timestamp),
          totalPrice: foundOrder.totalPrice,
        },
      });
    } catch (err) {
      console.error("Error occurred in `GetOrderByUuid`:", err);
      return res.status(500).json({ error: "Failed to fetch order by UUID." });
    }
  }

  @Get("receipt/:uuid")
  GetReceipt(
    @Param("uuid") uuid: string,
    @Res() res: Response
  ): Response | void {
    try {
      if (!uuid) {
        return res.status(400).json({ error: "Order UUID is required." });
      }

      const receiptPath = this.orderService.MakeReceiptPath(uuid);
      if (!receiptPath) {
        return res.status(404).json({ error: "Receipt not found." });
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="${uuid}.pdf"`);

      return res.sendFile(receiptPath);
    } catch (err) {
      console.error("Error occurred in `GetReceipt`:", err);
      return res.status(500).json({ error: "Failed to fetch receipt." });
    }
  }
}
