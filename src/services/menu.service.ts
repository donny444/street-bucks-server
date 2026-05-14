import { Injectable } from "@nestjs/common";
import { PrismaClient, Prisma, Category, Menu } from "../../prisma/client";

import { mkdir, writeFile, unlink } from "fs/promises";
import { dirname } from "path";

import { MenuFormDto, MenuInfoDto } from "src/dtos/menu.dto";

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaClient) {}

  private toError(tag: string, err: unknown): Error {
    return new Error(
      `${tag} error: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  async SelectHotMenus(): Promise<MenuInfoDto[] | Error> {
    try {
      try {
        const hotMenus = await this.prisma.menu.findMany({
          select: {
            name: true,
            price: true,
            imagePath: true,
          },
          where: { category: Category.HOT },
        });

        return hotMenus;
      } catch (err) {
        throw this.toError("Error fetching hot menus:", err);
      }
    } catch (err) {
      return err instanceof Error ? err : new Error(String(err));
    }
  }

  async SelectIcedMenus(): Promise<MenuInfoDto[] | Error> {
    try {
      try {
        const icedMenus = await this.prisma.menu.findMany({
          select: {
            name: true,
            price: true,
            imagePath: true,
          },
          where: { category: Category.ICED },
        });

        return icedMenus;
      } catch (err) {
        throw this.toError("Error fetching iced menus:", err);
      }
    } catch (err) {
      return err instanceof Error ? err : new Error(String(err));
    }
  }

  async SelectBakeryMenus(): Promise<MenuInfoDto[] | Error> {
    try {
      try {
        const bakeryMenus = await this.prisma.menu.findMany({
          select: {
            name: true,
            price: true,
            imagePath: true,
          },
          where: { category: Category.BAKERY },
        });

        return bakeryMenus;
      } catch (err) {
        throw this.toError("Error fetching bakery menus:", err);
      }
    } catch (err) {
      return err instanceof Error ? err : new Error(String(err));
    }
  }

  async SelectMenus(): Promise<Menu[] | Error> {
    try {
      try {
        const menus = await this.prisma.menu.findMany();

        return menus;
      } catch (err) {
        throw this.toError("Error fetching menus:", err);
      }
    } catch (err) {
      return err instanceof Error ? err : new Error(String(err));
    }
  }

  async FindSpecificMenu(name: string): Promise<MenuInfoDto | null | Error> {
    try {
      try {
        const specificMenu = await this.prisma.menu.findUnique({
          select: {
            name: true,
            price: true,
            imagePath: true,
          },
          where: { name },
        });

        return specificMenu;
      } catch (err) {
        throw this.toError("Error fetching specific menu:", err);
      }
    } catch (err) {
      return err instanceof Error ? err : new Error(String(err));
    }
  }

  async FindMenuForm(name: string): Promise<MenuFormDto | null | Error> {
    try {
      try {
        const menuForm = await this.prisma.menu.findUnique({
          select: {
            name: true,
            price: true,
            category: true,
            note: true,
            ingredient: {
              select: {
                recipeId: true,
                amount: true,
              }
            }
          },
          where: { name },
        });

        return menuForm;
      } catch (err) {
        throw this.toError("Error selecting menu form:", err);
      }
    } catch (err) {
      return err instanceof Error ? err : new Error(String(err));
    }
  }

  async UpdateMenu(params: {
    data: Prisma.MenuUncheckedUpdateInput;
    where: Prisma.MenuWhereUniqueInput;
  }): Promise<void | Error> {
    try {
      try {
        await this.prisma.menu.update({
          data: params.data,
          where: params.where,
        });
      } catch (err) {
        throw this.toError("Error updating menu:", err);
      }
    } catch (err) {
      return err instanceof Error ? err : new Error(String(err));
    }
  }

  async CheckMenuExists(name: string): Promise<boolean | Error> {
    try {
      try {
        const menu = await this.prisma.menu.findUnique({
          where: { name },
          select: { name: true },
        });

        return menu !== null;
      } catch (err) {
        throw this.toError("Error checking menu existence:", err);
      }
    } catch (err) {
      return err instanceof Error ? err : new Error(String(err));
    }
  }

  async InsertMenu(data: Prisma.MenuCreateInput): Promise<void | Error> {
    try {
      try {
        await this.prisma.menu.create({
          data,
        });
      } catch (err) {
        throw this.toError("Error inserting menu:", err);
      }
    } catch (err) {
      return err instanceof Error ? err : new Error(String(err));
    }
  }

  async CreateMenuImage(
    fileContent: Express.Multer.File,
    fileName: string
  ): Promise<void | Error> {
    try {
      try {
        const filePath = `../../assets/menus/${fileName}`;

        await mkdir(dirname(filePath), { recursive: true });

        const buffer = Buffer.from(fileContent.buffer);

        await writeFile(filePath, buffer);
      } catch (err) {
        throw this.toError("Error creating menu image:", err);
      }
    } catch (err) {
      return err instanceof Error ? err : new Error(String(err));
    }
  }

  async DeleteMenu(where: Prisma.MenuWhereUniqueInput): Promise<void | Error> {
    try {
      try {
        await this.prisma.$transaction(async (prisma) => {
          await prisma.ingredient.deleteMany({
            where: { menuId: where.name },
          });
          await prisma.menu.delete({
            where,
          });
        });
      } catch (err) {
        throw this.toError("Error deleting menu:", err);
      }
    } catch (err) {
      return err instanceof Error ? err : new Error(String(err));
    }
  }

  async DeleteMenuImage(fileName: string): Promise<void | Error> {
    try {
      const filePath = `../../assets/menus/${fileName}`;

      await unlink(filePath);
    } catch (err) {
      return err instanceof Error ? err : new Error(String(err));
    }
  }
}
