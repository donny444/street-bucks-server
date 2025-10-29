import { Controller, Get, Param, Res } from "@nestjs/common";
import { Response } from "express";

import { MenuService } from "../services/menu.service";
// import MenuDto from "../dtos/menu.dto";

@Controller("menus")
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get("hot")
  async HotMenus(@Res() res: Response): Promise<Response> {
    try {
      const hotMenus = await this.menuService.GetHotMenus();

      return res.json({
        message: "Returns all available hot beverages",
        menus: hotMenus,
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
        menus: icedMenus,
      });
    } catch (err) {
      console.error("Error retrieving iced menus:", err);
      return res
        .status(500)
        .json({ error: "Failed to retrieve iced beverages." });
    }
  }

  @Get("cake")
  async CakeMenus(@Res() res: Response): Promise<Response> {
    try {
      const cakeMenus = await this.menuService.GetCakeMenus();

      return res.json({
        message: "Returns all available cake menus",
        menus: cakeMenus,
      });
    } catch (err) {
      console.error("Error retrieving cake menus:", err);
      return res.status(500).json({ error: "Failed to retrieve cake menus." });
    }
  }

  @Get(":id")
  async SpecificMenu(
    @Param("id") id: bigint,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const specificMenu = await this.menuService.GetSpecificMenu(id);
      if (!specificMenu) {
        return res.status(404).json({ error: "Menu not found." });
      }

      return res.json({
        message: `Returns the menu: ${id}`,
        menu: specificMenu,
      });
    } catch (err) {
      console.error("Error retrieving specific menu:", err);
      return res
        .status(500)
        .json({ error: "Failed to retrieve specific menu." });
    }
  }
}
