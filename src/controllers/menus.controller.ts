import { Controller, Get, Param, Res } from "@nestjs/common";
import { Response } from "express";

import { AppService } from "../app.service";

@Controller("menus")
export class MenusController {
  constructor(private readonly appService: AppService) {}

  @Get("hot")
  HotMenus(@Res() res: Response): Response {
    try {
      return res.json({ message: "Returns all available hot beverages" });
    } catch (err) {
      console.error("Error retrieving hot menus:", err);
      return res
        .status(500)
        .json({ error: "Failed to retrieve hot beverages." });
    }
  }

  @Get("iced")
  IcedMenus(@Res() res: Response): Response {
    try {
      return res.json({ message: "Returns all available iced beverages" });
    } catch (err) {
      console.error("Error retrieving iced menus:", err);
      return res
        .status(500)
        .json({ error: "Failed to retrieve iced beverages." });
    }
  }

  @Get("cake")
  CakeMenus(@Res() res: Response): Response {
    try {
      return res.json({ message: "Returns all available cake menus" });
    } catch (err) {
      console.error("Error retrieving cake menus:", err);
      return res.status(500).json({ error: "Failed to retrieve cake menus." });
    }
  }

  @Get(":id")
  SpecificMenu(@Param("id") id: string, @Res() res: Response): Response {
    try {
      return res.json({ message: `Returns the menu: ${id}` });
    } catch (err) {
      console.error("Error retrieving specific menu:", err);
      return res
        .status(500)
        .json({ error: "Failed to retrieve specific menu." });
    }
  }
}
