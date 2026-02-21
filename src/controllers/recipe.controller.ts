import {
  Body,
  Controller,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { diskStorage } from "multer";
import { extname } from "path";

import { RecipeService } from "../services/recipe.service";
import { AddRecipeDto } from "../dtos/recipe.dto";

@Controller("recipes")
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "../src/assets/recipes",
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `recipe-${uniqueSuffix}${ext}`);
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
  async AddRecipe(
    @Body() addRecipe: AddRecipeDto,
    @UploadedFile() uploadedFile: Express.Multer.File,
    @Res() res: Response
  ): Promise<Response> {
    try {
      if (!addRecipe || !addRecipe.name) {
        return res.status(400).json({
          message: "Missing required recipe information: name.",
        });
      }

      const recipeExists = await this.recipeService.CheckRecipeExists(
        addRecipe.name
      );
      if (recipeExists) {
        return res.status(409).json({
          message: `Recipe with the name provided already exists.`,
        });
      }

      if (!uploadedFile) {
        return res.status(400).json({
          message: "Recipe image file is required.",
        });
      }

      const baseName = addRecipe.name.trim().toLowerCase().replace(/\s+/g, "_");
      const extension = (
        extname(uploadedFile.originalname) ||
        extname(uploadedFile.filename) ||
        ""
      ).toLowerCase();
      const fileName = `${baseName}${extension}`;
      const filePath = `../assets/recipes/${fileName}`;

      // if (file.path !== renamedFilePath) {
      //   const { rename } = await import("fs/promises");
      //   await rename(file.path, renamedFilePath);
      //   file.path = renamedFilePath;
      //   file.filename = renamedFileName;
      // }

      // Normalize file path for different OS.
      // const imagePath = file.path.replace(/\\/g, "/");

      const newRecipe = await this.recipeService.InsertRecipe({
        name: addRecipe.name,
        unit: addRecipe.unit,
        imagePath: fileName,
      });
      if (newRecipe instanceof Error) {
        console.error("Error occurred in `InsertRecipe` service:", newRecipe);
        return res.status(500).json({ message: newRecipe.message });
      }

      const buffer = await this.recipeService.CreateRecipeImage(
        uploadedFile,
        filePath
      );
      if (buffer instanceof Error) {
        console.error("Error occurred in `CreateImage` service:", buffer);
        return res.status(500).json({ message: buffer.message });
      }

      return res.status(201).json({ message: "New recipe has been added." });
    } catch (err) {
      console.error("Error occurred in `AddRecipe` controller:", err);
      return res.status(500).json({ message: "Failed to add a new recipe." });
    }
  }
}
