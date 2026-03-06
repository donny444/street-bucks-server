import { Injectable } from "@nestjs/common";
import { PrismaClient, Prisma, Category } from "../../prisma/client";

import { mkdir, writeFile } from "fs/promises";
import { dirname } from "path";

import { MenuInfoDto } from "src/dtos/menu.dto";

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaClient) {}

  private toError(tag: string, err: unknown): Error {
    return new Error(
      `${tag} error: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  async GetHotMenus(): Promise<MenuInfoDto[] | Error> {
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

  async GetIcedMenus(): Promise<MenuInfoDto[] | Error> {
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

  async GetBakeryMenus(): Promise<MenuInfoDto[] | Error> {
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

  async GetSpecificMenu(name: string): Promise<MenuInfoDto | null | Error> {
    try {
      try {
        const specificMenu = await this.prisma.menu.findUnique({
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
}
