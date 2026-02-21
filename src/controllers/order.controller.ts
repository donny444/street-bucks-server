import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  Param,
  Req,
  Res,
} from "@nestjs/common";
import { Request, Response } from "express";

import { OrderService } from "../services/order.service";

import { OrderedMenuDto } from "../dtos/order.dto";
import { BranchPayloadDto } from "../dtos/branch.dto";

@Controller("orders")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(201)
  async MakeOrder(
    @Headers("Branch-Payload") branchPayload: string,
    @Body() cartItems: OrderedMenuDto[],
    @Res() res: Response
  ): Promise<Response> {
    try {
      const parsedBranchPayload = JSON.parse(
        branchPayload || "{}"
      ) as BranchPayloadDto;
      if (!parsedBranchPayload) {
        return res.status(500).json({ error: "Failed to make an order." });
      }

      const { branchId } = parsedBranchPayload;

      const order = await this.orderService.InsertOrder(cartItems, branchId);
      if (!order) {
        return res.status(500).json({ error: "Failed to make an order." });
      }
      if (order instanceof Error) {
        return res.status(400).json({ error: order.message });
      }

      // Generate PDF receipt after successful order creation
      const orderDetails = await this.orderService.GetSpecificOrder({
        uuid: order.uuid,
        branchId: BigInt(branchId),
      });

      if (orderDetails) {
        await this.orderService.GenerateReceipt({
          uuid: order.uuid,
          timestamp: Number(order.timestamp),
          totalPrice: orderDetails.totalPrice,
          entries: orderDetails.entry.map((e) => ({
            menuName: e.menu.name,
            price: e.menu.price,
            quantity: e.quantity,
          })),
        });
      }

      return res.json({
        message: "The order has been made with menu(s) in cart.",
        order_id: order.uuid,
      });
    } catch (err) {
      console.error("Error making an order:", err);
      return res.status(500).json({ error: "Failed to make an order." });
    }
  }

  @Get()
  async GetTodayOrders(
    @Headers("Branch-Payload") branchPayload: string,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const parsedBranchPayload = JSON.parse(
        branchPayload || "{}"
      ) as BranchPayloadDto;
      if (!parsedBranchPayload) {
        return res.status(500).json({ error: "Failed to fetch today orders." });
      }

      const { branchId } = parsedBranchPayload;

      const todayOrders = await this.orderService.GetTodayOrders(branchId);

      return res.json({
        message: "Get orders in current day.",
        today_orders: todayOrders,
      });
    } catch (err) {
      console.error("Error fetching orders:", err);
      return res.status(500).json({ error: "Failed to fetch today orders." });
    }
  }

  @Get(":uuid")
  async GetSpecificOrder(
    @Headers("Branch-Payload") branchPayload: string,
    @Param("uuid") uuid: string | undefined,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const parsedBranchPayload = JSON.parse(
        branchPayload || "{}"
      ) as BranchPayloadDto;
      if (!parsedBranchPayload) {
        return res
          .status(500)
          .json({ error: "Failed to fetch specific order." });
      }

      const { branchId } = parsedBranchPayload;

      if (!uuid) {
        return res.status(400).json({ error: "Order UUID is required." });
      }

      const order = await this.orderService.GetSpecificOrder({
        uuid,
        branchId,
      });
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

  @Get(":uuid/receipt")
  GetReceipt(
    @Headers("Branch-Payload") branchPayload: string,
    @Param("uuid") uuid: string,
    @Res() res: Response
  ): Response | void {
    try {
      const parsedBranchPayload = JSON.parse(
        branchPayload || "{}"
      ) as BranchPayloadDto;
      if (!parsedBranchPayload) {
        return res
          .status(500)
          .json({ error: "Failed to fetch specific order." });
      }

      if (!uuid) {
        return res.status(400).json({ error: "Order UUID is required." });
      }

      const receiptPath = this.orderService.GetReceiptPath(uuid);
      if (!receiptPath) {
        return res.status(404).json({ error: "Receipt not found." });
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="${uuid}.pdf"`);

      return res.sendFile(receiptPath);
    } catch (err) {
      console.error("Error fetching receipt:", err);
      return res.status(500).json({ error: "Failed to fetch receipt." });
    }
  }
}
