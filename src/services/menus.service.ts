import { Injectable } from "@nestjs/common";
import { PrismaClient } from "../../prisma/client";

@Injectable()
export class MenusService {
  constructor(private prisma: PrismaClient) {}

  async GetHotMenus() {
    const hotMenus = await this.prisma.menu.findMany({
      where: { type: "hot" },
    });

    return hotMenus;
  }

  async GetIcedMenus() {
    const icedMenus = await this.prisma.menu.findMany({
      where: { type: "iced" },
    });

    return icedMenus;
  }

  async GetCakeMenus() {
    const cakeMenus = await this.prisma.menu.findMany({
      where: { type: "cake" },
    });

    return cakeMenus;
  }

  async GetSpecificMenu(id: string) {
    const specificMenu = await this.prisma.menu.findUnique({
      where: { id },
    });

    return specificMenu;
  }
}
