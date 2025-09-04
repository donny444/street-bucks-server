import { Injectable } from "@nestjs/common";
import { PrismaClient } from "../../prisma/client";
import OrderItemDto from "../dtos/order_item.dto";

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaClient) {}

  async InsertOrder(orderItems: OrderItemDto[]) {
    const order = await this.prisma.$transaction(async (prisma) => {
      const menusPrice = await prisma.menu.findMany({
        select: { uuid: true, price: true },
        where: {
          uuid: { in: orderItems.map((item) => item.menuId) },
        },
      });
      const newOrder = await prisma.order.create({
        data: {
          timestamp: new Date().getTime(),
          totalPrice: orderItems.reduce((acc, item) => {
            const menu = menusPrice.find((menu) => menu.uuid === item.menuId);
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

  async GetSpecificOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { uuid: orderId },
      include: { OrderMenu: true },
    });

    return order;
  }
}
