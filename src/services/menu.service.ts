import { Injectable } from "@nestjs/common";
import { PrismaClient, Prisma, Category } from "../../prisma/client";
import { mkdir, writeFile } from "fs/promises";
import { dirname } from "path";

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

  async CheckMenuExists(name: string): Promise<boolean> {
    const menu = await this.prisma.menu.findUnique({
      where: { name },
      select: { name: true },
    });
    return menu !== null;
  }

  async InsertMenu(data: Prisma.MenuCreateInput) {
    return this.prisma.menu.create({
      data,
    });
  }

  async CreateMenuImage(
    fileContent: Express.Multer.File,
    fileName: string
  ): Promise<Buffer<ArrayBufferLike> | Error> {
    if (!fileContent || !fileName) {
      return Error(
        "File content and name are required to create a menu image."
      );
    }
    const filePath = `../../assets/menus/${fileName}`;

    await mkdir(dirname(filePath), { recursive: true });

    const buffer = Buffer.from(fileContent.buffer);

    await writeFile(filePath, buffer);
    return buffer;
  }
}
