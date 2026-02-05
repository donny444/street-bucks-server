import { Body, Controller, Get, Param, Put, Res } from "@nestjs/common";
import { Response } from "express";

import { MenuService } from "../services/menu.service";
import { EditMenuDto } from "../dtos/menu.dto";

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

  @Get("bakery")
  async BakeryMenus(@Res() res: Response): Promise<Response> {
    try {
      const bakeryMenus = await this.menuService.GetBakeryMenus();

      return res.json({
        message: "Returns all available bakery menus",
        menus: bakeryMenus,
      });
    } catch (err) {
      console.error("Error retrieving bakery menus:", err);
      return res
        .status(500)
        .json({ error: "Failed to retrieve bakery menus." });
    }
  }

  @Get(":name")
  async SpecificMenu(
    @Res() res: Response,
    @Param("name") name: string
  ): Promise<Response> {
    try {
      const specificMenu = await this.menuService.GetSpecificMenu(name);
      if (!specificMenu) {
        return res.status(404).json({
          error: `Menu: #${name} not found. Please the name of menu in route parameter`,
        });
      }

      return res.json({
        message: `Returns the menu: ${name}`,
        menu: specificMenu,
      });
    } catch (err) {
      console.error("Error retrieving specific menu:", err);
      return res
        .status(500)
        .json({ error: "Failed to retrieve specific menu." });
    }
  }

  @Put(":name")
  async EditMenu(
    @Param("name") name: string,
    @Body() editMenu: EditMenuDto,
    @Res() res: Response
  ): Promise<Response> {
    try {
      if (!editMenu) {
        return res
          .status(400)
          .json({ message: "No menu information provided for updating." });
      }

      const specificMenu = await this.menuService.GetSpecificMenu(name);
      if (!specificMenu) {
        return res.status(404).json({
          message: `Menu: #${name} not found. Please review the name of menu in route parameter`,
        });
      }

      const updatedMenu = await this.menuService.UpdateMenu({
        data: editMenu,
        where: { name },
      });
      if (!updatedMenu) {
        return res
          .status(500)
          .json({ message: "Failed to edit the menu information." });
      }

      return res.json({
        message: `The menu: #${name} has been updated successfully.`,
      });
    } catch (err) {
      console.error("Error occurred in `EditMenu`:", err);
      return res
        .status(500)
        .json({ message: "Failed to edit the menu information." });
    }
  }
}
