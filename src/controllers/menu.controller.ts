import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Res,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { diskStorage } from "multer";
import { extname } from "path";

import { MenuService } from "../services/menu.service";
import { EditMenuDto } from "../dtos/menu.dto";

@Controller("menus")
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get("hot")
  async GetHotMenus(@Res() res: Response): Promise<Response> {
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
  async GetIcedMenus(@Res() res: Response): Promise<Response> {
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
  async GetBakeryMenus(@Res() res: Response): Promise<Response> {
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
  async GetSpecificMenu(
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

  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "../../assets/menus",
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `menu-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return callback(new Error("Only image files are allowed!"), false);
        }
        callback(null, true);
      },
    })
  )
  async AddMenu(
    @Body() addMenu: EditMenuDto,
    @UploadedFile() uploadedFile: Express.Multer.File,
    @Res() res: Response
  ): Promise<Response> {
    try {
      if (!addMenu || !addMenu.name || !addMenu.price || !addMenu.category) {
        return res.status(400).json({
          message: "Missing required menu information: name, price, category.",
        });
      }

      const menuExists = await this.menuService.CheckMenuExists(addMenu.name);
      if (menuExists) {
        return res.status(409).json({
          message: "Menu with the name provided already exists.",
        });
      }

      if (!uploadedFile) {
        return res
          .status(400)
          .json({ message: "Menu image file is required." });
      }

      const baseName = addMenu.name.trim().toLowerCase().replace(/\s+/g, "_");
      const extension = (
        extname(uploadedFile.originalname) ||
        extname(uploadedFile.filename) ||
        ""
      ).toLowerCase();
      const fileName = `${baseName}${extension}`;
      const imagePath = `assets/menus/${fileName}`;

      const newMenu = await this.menuService.InsertMenu({
        name: addMenu.name,
        price: addMenu.price,
        category: addMenu.category,
        imagePath,
      });
      if (newMenu instanceof Error) {
        console.error("Error occurred in `InsertMenu` service:", newMenu);
        return res.status(500).json({ message: newMenu.message });
      }

      const buffer = await this.menuService.CreateMenuImage(
        uploadedFile,
        fileName
      );
      if (buffer instanceof Error) {
        console.error("Error occurred in `CreateMenuImage` service:", buffer);
        return res.status(500).json({ message: buffer.message });
      }

      return res.status(201).json({
        message: "New menu has been added.",
      });
    } catch (err) {
      console.error("Error occurred in `AddMenu` controller:", err);
      return res.status(500).json({ message: "Failed to add a new menu." });
    }
  }
}
