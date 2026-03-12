import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  Param,
  Res,
} from "@nestjs/common";
import { Response } from "express";

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
        return res.status(500).json({
          error:
            "Failed to parse branch payload from `branch-payload` request header.",
        });
      }

      const { branchId } = parsedBranchPayload;

      const order = await this.orderService.InsertOrder(cartItems, branchId);
      if (order instanceof Error) {
        console.error("Error occurred in `InsertOrder`:", order);
        return res.status(500).json({ error: order.message });
      }

      // Generate PDF receipt after successful order creation
      const orderDetails = await this.orderService.GetSpecificOrder({
        uuid: order.uuid,
        branchId: BigInt(branchId),
      });
      if (!orderDetails) {
        return res
          .status(500)
          .json({ error: "Failed to retrieve the order details." });
      }
      if (orderDetails instanceof Error) {
        console.error("Error occurred in `GetSpecificOrder`:", orderDetails);
        return res.status(500).json({ error: orderDetails.message });
      }

      if (orderDetails) {
        await this.orderService.GenerateReceipt({
          uuid: orderDetails.uuid,
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
      console.error("Error occurred in `MakeOrder`:", err);
      return res.status(500).json({ error: "Failed to make an order." });
    }
  }

  @Get()
  async GetTodayOrders(
    @Headers("Branch-Payload") branchPayload: string,
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

      const todayOrders = await this.orderService.GetTodayOrders(branchId);
      if (todayOrders instanceof Error) {
        console.error("Error occurred in `GetTodayOrders`:", todayOrders);
        return res.status(500).json({ error: todayOrders.message });
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
  async GetSpecificOrder(
    @Headers("Branch-Payload") branchPayload: string,
    @Param("uuid") uuid: string,
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

      const order = await this.orderService.GetSpecificOrder({
        uuid,
        branchId,
      });
      if (order instanceof Error) {
        console.error("Error occurred in `GetSpecificOrder`:", order);
        return res.status(500).json({ error: order.message });
      }

      return res.json({
        message: `Inspect the order: ${uuid}`,
        order,
      });
    } catch (err) {
      console.error("Error occurred in `GetSpecificOrder`:", err);
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
        return res.status(500).json({
          error:
            "Failed to parse branch payload from `branch-payload` request header.",
        });
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
      console.error("Error occurred in `GetReceipt`:", err);
      return res.status(500).json({ error: "Failed to fetch receipt." });
    }
  }
}
