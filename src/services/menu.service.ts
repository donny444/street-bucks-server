import { Injectable } from "@nestjs/common";
import { PrismaClient, Prisma, Category } from "../prisma/client";

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaClient) {}

  async GetHotMenus() {
    const hotMenus = await this.prisma.menu.findMany({
      select: {
        name: true,
        price: true,
        imagePath: true,
      },
      where: { category: Category.HOT },
    });

    return hotMenus;
  }

  async GetIcedMenus() {
    const icedMenus = await this.prisma.menu.findMany({
      select: {
        name: true,
        price: true,
        imagePath: true,
      },
      where: { category: Category.ICED },
    });

    return icedMenus;
  }

  async GetBakeryMenus() {
    const bakeryMenus = await this.prisma.menu.findMany({
      select: {
        name: true,
        price: true,
        imagePath: true,
      },
      where: { category: Category.BAKERY },
    });

    return bakeryMenus;
  }

  async GetSpecificMenu(name: string) {
    const specificMenu = await this.prisma.menu.findUnique({
      where: { name },
      include: {
        ingredient: false,
        entry: false,
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
