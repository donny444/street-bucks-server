import { Injectable } from "@nestjs/common";
import { PrismaClient } from "../../prisma/client";

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaClient) {}

  async GetHotMenus() {
    const hotMenus = await this.prisma.menu.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        fileName: true,
      },
      where: { type: "hot" },
    });

    return hotMenus;
  }

  async GetIcedMenus() {
    const icedMenus = await this.prisma.menu.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        fileName: true,
      },
      where: { type: "iced" },
    });

    return icedMenus;
  }

  async GetCakeMenus() {
    const cakeMenus = await this.prisma.menu.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        fileName: true,
      },
      where: { type: "cake" },
    });

    return cakeMenus;
  }

  async GetSpecificMenu(id: bigint) {
    const specificMenu = await this.prisma.menu.findUnique({
      where: { id: id },
      include: {
        MenuRecipe: false,
        OrderMenu: false,
      },
    });

    return specificMenu;
  }
}
