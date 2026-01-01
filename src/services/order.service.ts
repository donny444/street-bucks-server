import { Injectable } from "@nestjs/common";
import { PrismaClient, Prisma } from "../../prisma/client";

import { OrderedMenuDto, MenuPriceDto, OrderDto } from "../dtos/order.dto";

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaClient) {}

  private accumulatePrice(
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

  private normalizeMenus(orderedMenus: OrderedMenuDto[]): OrderedMenuDto[] {
    return orderedMenus.map((item) => ({
      menuId: BigInt(item.menuId),
      quantity: item.quantity,
    }));
  }

  async InsertOrder(
    orderedMenus: OrderedMenuDto[],
    branchId: number
  ): Promise<OrderDto> {
    const normalizedMenus = this.normalizeMenus(orderedMenus);
    const extractedMenuIds = orderedMenus.map((item) => item.menuId);

    const order = await this.prisma.$transaction(async (prisma) => {
      const menuPrices = await prisma.menu.findMany({
        select: { id: true, price: true },
        where: {
          id: { in: extractedMenuIds },
        },
      });
      const accumulatedPrice = this.accumulatePrice(
        normalizedMenus,
        menuPrices
      );
      const newOrder = await prisma.order.create({
        data: {
          branchId: BigInt(branchId),
          timestamp: new Date().getTime(),
          totalPrice: accumulatedPrice,
        },
      });
      await prisma.orderMenu.createMany({
        data: normalizedMenus.map((normalizedMenu) => ({
          orderId: newOrder.uuid,
          menuId: normalizedMenu.menuId,
          quantity: normalizedMenu.quantity,
        })),
      });
      return newOrder;
    });

    return order;
  }

  async GetTodayOrders(branchId: number) {
    const startOfDay = new Date().setHours(0, 0, 0, 0);
    const endOfDay = new Date().setHours(23, 59, 59, 999);

    const orders = await this.prisma.order.findMany({
      where: {
        timestamp: {
          gte: startOfDay,
          lte: endOfDay,
        },
        branchId: BigInt(branchId),
      },
      select: {
        uuid: true,
        timestamp: true,
        totalPrice: true,
      },
    });

    const serializedOrders = orders.map((order) => ({
      uuid: order.uuid,
      timestamp: Number(order.timestamp),
      totalPrice: order.totalPrice,
    }));

    return serializedOrders;
  }

  async GetSpecificOrder(where: Prisma.OrderWhereUniqueInput) {
    const order = await this.prisma.order.findUnique({
      select: {
        uuid: true,
        totalPrice: true,
        OrderMenu: {
          select: {
            quantity: true,
            menu: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
      },
      where: where,
    });

    return order;
  }
}
