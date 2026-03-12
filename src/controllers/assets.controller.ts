import { Controller, Get, Param, Res } from "@nestjs/common";
import { Response } from "express";
import { join } from "path";
import { existsSync } from "fs";

@Controller("assets")
export class AssetsController {
  private readonly assetsPath = join(__dirname, "..", "..", "assets");

  @Get("menus/:filename")
  GetMenuImage(
    @Param("filename") filename: string,
    @Res() res: Response
  ): void {
    try {
      // Sanitize filename to prevent directory traversal
      const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "");
      const filePath = join(this.assetsPath, "menus", sanitizedFilename);

      if (!existsSync(filePath)) {
        res.status(404).json({
          error: `Menu image '${sanitizedFilename}' not found.`,
        });
      }

      res.sendFile(filePath);
    } catch (err) {
      console.error("Error occurred in `GetMenuImage`:", err);
      res.status(500).json({
        error: "Failed to serve menu image.",
      });
    }
  }

  @Get("recipes/:filename")
  GetRecipeImage(
    @Param("filename") filename: string,
    @Res() res: Response
  ): void {
    try {
      const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "");
      const filePath = join(this.assetsPath, "recipes", sanitizedFilename);

      if (!existsSync(filePath)) {
        res.status(404).json({
          error: `Recipe '${sanitizedFilename}' not found.`,
        });
      }

      res.sendFile(filePath);
    } catch (err) {
      console.error("Error occurred in `GetRecipeImage`:", err);
      res.status(500).json({
        error: "Failed to serve recipe image.",
      });
    }
  }
}
