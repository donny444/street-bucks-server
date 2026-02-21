import { Controller, Get, Param, Res, HttpStatus } from "@nestjs/common";
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
        res.status(HttpStatus.NOT_FOUND).json({
          error: `Menu image '${sanitizedFilename}' not found.`,
        });
        return;
      }

      res.sendFile(filePath);
    } catch (err) {
      console.error("Error serving menu image:", err);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: "Failed to serve menu image.",
      });
    }
  }

  @Get("recipes/:filename")
  GetRecipe(@Param("filename") filename: string, @Res() res: Response): void {
    try {
      const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "");
      const filePath = join(this.assetsPath, "recipes", sanitizedFilename);

      if (!existsSync(filePath)) {
        res.status(HttpStatus.NOT_FOUND).json({
          error: `Recipe '${sanitizedFilename}' not found.`,
        });
        return;
      }

      res.sendFile(filePath);
    } catch (err) {
      console.error("Error serving recipe:", err);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: "Failed to serve recipe.",
      });
    }
  }
}
