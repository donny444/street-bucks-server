import { Body, Controller, Get, Param, Put, Res } from "@nestjs/common";
import { Response } from "express";

import { MenuService } from "../services/menu.service";
import { EditMenuDto } from "../dtos/menu.dto";

@Controller("menus")
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  private convertMenuIdsToNumber(
    menus: { id: bigint; name: string; price: number; fileName: string }[]
  ): { id: number; name: string; price: number; fileName: string }[] {
    return menus.map(({ id, ...rest }) => {
      const num = Number(id);
      if (!Number.isSafeInteger(num)) {
        console.warn(
          `Menu id ${id.toString()} exceeds Number.MAX_SAFE_INTEGER; precision may be lost.`
        );
      }
      return { id: num, ...rest };
    });
  }

  private convertMenuIdToNumber(menu: {
    id: bigint;
    name: string;
    price: number;
    fileName: string;
  }): { id: number; name: string; price: number; fileName: string } {
    const num = Number(menu.id);
    if (!Number.isSafeInteger(num)) {
      console.warn(
        `Menu id ${menu.id.toString()} exceeds Number.MAX_SAFE_INTEGER; precision may be lost.`
      );
    }
    return {
      id: num,
      name: menu.name,
      price: menu.price,
      fileName: menu.fileName,
    };
  }

  @Get("hot")
  async HotMenus(@Res() res: Response): Promise<Response> {
    try {
      const hotMenus = await this.menuService.GetHotMenus();

      return res.json({
        message: "Returns all available hot beverages",
        menus: this.convertMenuIdsToNumber(hotMenus),
      });
    } catch (err) {
      console.error("Error retrieving hot menus:", err);
      return res
        .status(500)
        .json({ error: "Failed to retrieve hot beverages." });
    }
  }

  @Get("iced")
  async IcedMenus(@Res() res: Response): Promise<Response> {
    try {
      const icedMenus = await this.menuService.GetIcedMenus();

      return res.json({
        message: "Returns all available iced beverages",
        menus: this.convertMenuIdsToNumber(icedMenus),
      });
    } catch (err) {
      console.error("Error retrieving iced menus:", err);
      return res
        .status(500)
        .json({ error: "Failed to retrieve iced beverages." });
    }
  }

  @Get("bakery")
  async BakeryMenus(@Res() res: Response): Promise<Response> {
    try {
      const bakeryMenus = await this.menuService.GetBakeryMenus();

      return res.json({
        message: "Returns all available bakery menus",
        menus: this.convertMenuIdsToNumber(bakeryMenus),
      });
    } catch (err) {
      console.error("Error retrieving bakery menus:", err);
      return res
        .status(500)
        .json({ error: "Failed to retrieve bakery menus." });
    }
  }

  @Get(":id")
  async SpecificMenu(
    @Res() res: Response,
    @Param("id") id: bigint
  ): Promise<Response> {
    try {
      const specificMenu = await this.menuService.GetSpecificMenu(id);
      if (!specificMenu) {
        return res.status(404).json({
          error: `Menu id #${id} not found. Please review your :id route parameter`,
        });
      }

      return res.json({
        message: `Returns the menu: ${id}`,
        menu: this.convertMenuIdToNumber(specificMenu),
      });
    } catch (err) {
      console.error("Error retrieving specific menu:", err);
      return res
        .status(500)
        .json({ error: "Failed to retrieve specific menu." });
    }
  }

  @Put(":id")
  async EditMenu(
    @Param("id") id: bigint,
    @Body() editMenu: EditMenuDto,
    @Res() res: Response
  ): Promise<Response> {
    try {
      if (!editMenu) {
        return res
          .status(400)
          .json({ message: "No menu information provided for updating." });
      }

      const specificMenu = await this.menuService.GetSpecificMenu(id);
      if (!specificMenu) {
        return res.status(404).json({
          message: `Menu id #${id} not found. Please review your :id route parameter`,
        });
      }

      const updatedMenu = await this.menuService.UpdateMenu({
        data: editMenu,
        where: { id: id },
      });
      if (!updatedMenu) {
        return res
          .status(500)
          .json({ message: "Failed to edit the menu information." });
      }

      return res.json({
        message: `The menu id #${id} has been updated successfully.`,
      });
    } catch (err) {
      console.error("Error occurred in `EditMenu`:", err);
      return res
        .status(500)
        .json({ message: "Failed to edit the menu information." });
    }
  }
}
