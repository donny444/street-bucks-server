import { Injectable } from "@nestjs/common";
import { PrismaClient, Prisma } from "../../prisma/client";

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

  async GetBakeryMenus() {
    const bakeryMenus = await this.prisma.menu.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        fileName: true,
      },
      where: { type: "bakery" },
    });

    return bakeryMenus;
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

  async UpdateMenu(params: {
    data: Prisma.MenuUncheckedUpdateInput;
    where: Prisma.MenuWhereUniqueInput;
  }): Promise<Prisma.Prisma__MenuClient<Prisma.MenuUncheckedUpdateInput>> {
    return this.prisma.menu.update({
      data: params.data,
      where: params.where,
    });
  }
}
