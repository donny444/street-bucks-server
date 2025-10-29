import { Injectable } from "@nestjs/common";
import { PrismaClient } from "../../prisma/client";
import OrderItemDto from "../dtos/order_item.dto";

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaClient) {}

  async InsertOrder(orderItems: OrderItemDto[]) {
    const order = await this.prisma.$transaction(async (prisma) => {
      const menusPrice = await prisma.menu.findMany({
        select: { id: true, price: true },
        where: {
          id: { in: orderItems.map((item) => item.menuId) },
        },
      });
      const newOrder = await prisma.order.create({
        data: {
          timestamp: new Date().getTime(),
          totalPrice: orderItems.reduce((acc, item) => {
            const menu = menusPrice.find((menu) => menu.id === item.menuId);
            return acc + (menu ? menu.price * item.quantity : 0);
          }, 0),
        },
      });
      await prisma.orderMenu.createMany({
        data: orderItems.map((item) => ({
          orderId: newOrder.uuid,
          menuId: item.menuId,
          quantity: item.quantity,
        })),
      });
      return newOrder;
    });

    return order;
  }

  async GetTodayOrders() {
    const startOfDay = new Date().setHours(0, 0, 0, 0);
    const endOfDay = new Date().setHours(23, 59, 59, 999);

    const orders = await this.prisma.order.findMany({
      where: {
        timestamp: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        uuid: true,
        timestamp: true,
        totalPrice: true,
      },
    });

    return orders;
  }

  async GetSpecificOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { uuid: orderId },
      include: { OrderMenu: true },
    });

    return order;
  }
}
