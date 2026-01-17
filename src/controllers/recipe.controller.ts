import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Express, Request, Response } from "express";

import { Recipe } from "../../prisma/client";

import { RecipeService } from "../services/recipe.service";

import { AddRecipeDto } from "../dtos/recipe.dto";

@Controller("recipes")
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Post()
  @HttpCode(201)
  @UseInterceptors(FileInterceptor("recipe_image"))
  async AddRecipe(
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: "image/png" }),
        ],
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      })
    )
    recipeImage: Express.Multer.File,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const { name } = req.body as AddRecipeDto;

      const newRecipe = await this.recipeService.InsertRecipe({
        name: name,
        imagePath: recipeImage.path,
      });
      if (newRecipe instanceof Error) {
        console.error("Error occurred in `AddRecipe` service:", newRecipe);
        return res.status(500).json({ message: newRecipe.message });
      }

      return res.json({ message: "New recipe added." });
    } catch (err) {
      console.error("Error occurred in `AddRecipe` controller:", err);
      return res.status(500).json({ message: "Failed to add a new recipe." });
    }
  }
}
