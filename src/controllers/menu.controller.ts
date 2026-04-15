import {
  Body,
  Controller,
  Delete,
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
      if (hotMenus instanceof Error) {
        console.error("Error occurred in `GetHotMenus`:", hotMenus);
        return res
          .status(500)
          .json({ error: "Failed to retrieve hot beverages." });
      }

      return res.json({
        message: "Returned all available hot beverages",
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
      if (icedMenus instanceof Error) {
        console.error("Error occurred in `GetIcedMenus`:", icedMenus);
        return res
          .status(500)
          .json({ error: "Failed to retrieve iced beverages." });
      }

      return res.json({
        message: "Returned all available iced beverages",
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
      if (bakeryMenus instanceof Error) {
        console.error("Error occurred in `GetBakeryMenus`:", bakeryMenus);
        return res.status(500).json({ error: "Failed to retrieve bakery." });
      }

      return res.json({
        message: "Returned all available bakery menus",
        menus: bakeryMenus,
      });
    } catch (err) {
      console.error("Error retrieving bakery menus:", err);
      return res
        .status(500)
        .json({ error: "Failed to retrieve bakery menus." });
    }
  }

  @Get()
  async GetAllMenus(@Res() res: Response): Promise<Response> {
    try {
      const menus = await this.menuService.FindMenus();
      if (menus instanceof Error) {
        console.error("Error occurred in `FindMenus`:", menus);
        return res.status(500).json({ error: "Failed to retrieve menus." });
      }
      if (menus.length === 0) {
        return res.status(404).json({ error: "No menus found." });
      }

      return res.json({
        message: "Returned all available menus",
        menus,
      });
    } catch (err) {
      console.error("Error retrieving all menus:", err);
      return res.status(500).json({ error: "Failed to retrieve menus." });
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
          error: `Menu name from the route parameter not found.`,
        });
      }
      if (specificMenu instanceof Error) {
        console.error("Error occurred in `GetSpecificMenu`:", specificMenu);
        return res
          .status(500)
          .json({ error: "Failed to retrieve the specific menu." });
      }

      return res.json({
        message: `Returned the menu: ${name}`,
        menu: specificMenu,
      });
    } catch (err) {
      console.error("Error retrieving specific menu:", err);
      return res
        .status(500)
        .json({ error: "Failed to retrieve specific menu." });
    }
  }

  @Post("form/:name")
  async GetMenuForm(
    @Param("name") name: string,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const menuForm = await this.menuService.SelectMenuForm(name);
      if (!menuForm) {
        return res.status(404).json({
          error: `Menu name from the route parameter not found.`,
        });
      }
      if (menuForm instanceof Error) {
        console.error("Error occurred in `SelectMenuForm`:", menuForm);
        return res
          .status(500)
          .json({ error: "Failed to select the menu form." });
      }

      return res.json({
        message: `Returned the menu form for menu: ${name}`,
        menu_form: menuForm,
      });
    } catch (err) {
      console.error("Error retrieving menu form:", err);
      return res.status(500).json({ error: "Failed to retrieve menu form." });
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
          message: `Menu name from the route parameter not found.`,
        });
      }
      if (specificMenu instanceof Error) {
        console.error("Error occurred in `GetSpecificMenu`:", specificMenu);
        return res
          .status(500)
          .json({ message: "Failed to retrieve the specific menu." });
      }

      const updatedMenu = await this.menuService.UpdateMenu({
        data: editMenu,
        where: { name },
      });
      if (updatedMenu instanceof Error) {
        console.error("Error occurred in `UpdateMenu`:", updatedMenu);
        return res
          .status(500)
          .json({ message: "Failed to edit the menu information." });
      }

      return res.json({
        message: `The menu has been updated successfully.`,
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
      if (!addMenu.name || !addMenu.price || !addMenu.category) {
        return res.status(400).json({
          message: "Missing required menu information: name, price, category.",
        });
      }

      const menuExists = await this.menuService.CheckMenuExists(addMenu.name);
      if (menuExists instanceof Error) {
        console.error("Error occurred in `CheckMenuExists`:", menuExists);
        return res
          .status(500)
          .json({ message: "Failed to check menu existence." });
      }
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

  @Delete("remove/:name")
  async RemoveMenu(
    @Param("name") name: string,
    @Res() res: Response
  ): Promise<Response> {
    try {
      if (!name) {
        return res
          .status(400)
          .json({ message: "Menu name is required for removal." });
      }

      const specificMenu = await this.menuService.GetSpecificMenu(name);
      if (specificMenu instanceof Error) {
        console.error("Error occurred in `GetSpecificMenu`:", specificMenu);
        return res
          .status(500)
          .json({ message: "Failed to retrieve the specific menu." });
      }
      if (!specificMenu) {
        return res.status(404).json({
          message: `Menu name from the route parameter not found.`,
        });
      }

      const deletedMenu = await this.menuService.DeleteMenu({ name });
      if (deletedMenu instanceof Error) {
        console.error("Error occurred in `DeleteMenu`:", deletedMenu);
        return res.status(500).json({ message: "Failed to delete the menu." });
      }

      const deletedImage = await this.menuService.DeleteMenuImage(
        specificMenu.imagePath
      );
      if (deletedImage instanceof Error) {
        console.error("Error occurred in `DeleteMenuImage`:", deletedImage);
        return res
          .status(500)
          .json({ message: "Failed to delete the menu image." });
      }

      return res.json({ message: "The menu has been removed." });
    } catch (err) {
      console.error("Error occurred in `RemoveMenu`:", err);
      return res.status(500).json({ message: "Failed to remove the menu." });
    }
  }
}
