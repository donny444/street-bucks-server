import { Injectable } from "@nestjs/common";
import { PrismaClient, Prisma } from "../../prisma/client";

import OrderedMenuDto from "../dtos/ordered_menu.dto";
import MenuPriceDto from "../dtos/menu_price.dto";

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaClient) {}

  private serializeMenuIds(menuIds: (number | bigint)[]): number[] {
    return menuIds.map((menuId) => Number(menuId));
  }

  private accumalatePrice(
    orderedMenus: OrderedMenuDto[],
    menuPrices: MenuPriceDto[]
  ): number {
    return orderedMenus.reduce((acc, orderedMenu) => {
      const matchedMenu = menuPrices.find(
        (eachMenu) => eachMenu.id === orderedMenu.menuId
      );
      return acc + (matchedMenu ? matchedMenu.price * orderedMenu.quantity : 0);
    }, 0);
  }

  async InsertOrder(orderedMenus: OrderedMenuDto[]) {
    const serializedMenuIds = this.serializeMenuIds(
      orderedMenus.map((item) => item.menuId)
    );

    const order = await this.prisma.$transaction(async (prisma) => {
      const menuPrices = await prisma.menu.findMany({
        select: { id: true, price: true },
        where: {
          id: { in: serializedMenuIds },
        },
      });
      const accumulatedPrice = this.accumalatePrice(orderedMenus, menuPrices);
      const newOrder = await prisma.order.create({
        data: {
          timestamp: new Date().getTime(),
          totalPrice: accumulatedPrice,
        },
      });
      await prisma.orderMenu.createMany({
        data: orderedMenus.map((orderedMenu) => ({
          orderId: newOrder.uuid,
          menuId: orderedMenu.menuId,
          quantity: orderedMenu.quantity,
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
