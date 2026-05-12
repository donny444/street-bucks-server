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

import { RecipeService } from "../services/recipe.service";
import { AddRecipeDto, EditRecipeDto } from "../dtos/recipe.dto";

@Controller("recipes")
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Get()
  async GetRecipes(@Res() res: Response): Promise<Response> {
    try {
      const recipes = await this.recipeService.SelectRecipes();
      if (recipes instanceof Error) {
        console.error("Error occurred in `SelectRecipes`:", recipes);
        return res.status(500).json({ message: "Failed to retrieve recipes." });
      }
      if (recipes.length === 0) {
        return res
          .status(404)
          .json({ error: "No recipes found." });
      }

      return res.status(200).json({ recipes });
    } catch (err) {
      console.error("Error occurred in `GetRecipes` controller:", err);
      return res.status(500).json({ message: "Failed to get recipes." });
    }
  }

  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./assets/recipes",
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
      if (!addRecipe.name || !addRecipe.unit) {
        return res.status(400).json({
          message: "Missing required recipe information: name and unit.",
        });
      }

      const recipeExists = await this.recipeService.CheckRecipeExists(
        addRecipe.name
      );
      if (recipeExists instanceof Error) {
        console.error("Error occurred in `CheckRecipeExists`:", recipeExists);
        return res
          .status(500)
          .json({ error: "Failed to check recipe existence." });
      }
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
      const filePath = `../../assets/recipes/${fileName}`;

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
        console.error("Error occurred in `InsertRecipe`:", newRecipe);
        return res
          .status(500)
          .json({ message: "Failed to insert a new recipe" });
      }

      const buffer = await this.recipeService.CreateRecipeImage(
        uploadedFile,
        filePath
      );
      if (buffer instanceof Error) {
        console.error("Error occurred in `CreateRecipeImage`:", buffer);
        return res
          .status(500)
          .json({ message: "Failed to create the image of the recipe" });
      }

      return res.status(201).json({ message: "New recipe has been added." });
    } catch (err) {
      console.error("Error occurred in `AddRecipe` controller:", err);
      return res.status(500).json({ message: "Failed to add a new recipe." });
    }
  }

  @Put(":name")
  async EditRecipe(
    @Param("name") recipeName: string,
    @Body() editRecipe: EditRecipeDto,
    @Res() res: Response
  ): Promise<Response> {
    try {
      if (!editRecipe || !recipeName) {
        return res.status(400).json({
          message: "Missing required information for editing recipe.",
        });
      }

      const recipeExists = await this.recipeService.CheckRecipeExists(
        editRecipe.name
      );
      if (recipeExists instanceof Error) {
        console.error("Error occurred in `CheckRecipeExists`:", recipeExists);
        return res
          .status(500)
          .json({ error: "Failed to check recipe existence." });
      }
      if (recipeExists) {
        return res.status(409).json({
          message: `Recipe with the name provided already exists.`,
        });
      }

      const updatedRecipe = await this.recipeService.UpdateRecipe(
        {
          name: editRecipe.name,
          unit: editRecipe.unit,
        },
        { name: recipeName }
      );
      if (updatedRecipe instanceof Error) {
        console.error("Error occurred in `UpdateRecipe`:", updatedRecipe);
        return res
          .status(500)
          .json({ message: "Failed to update the recipe." });
      }

      return res.status(200).json({ message: "Recipe has been updated." });
    } catch (err) {
      console.error("Error occurred in `EditRecipe`:", err);
      return res.status(500).json({ message: "Failed to edit the recipe." });
    }
  }

  @Delete(":name")
  async RemoveRecipe(
    @Param("name") name: string,
    @Res() res: Response
  ): Promise<Response> {
    try {
      if (!name) {
        return res.status(400).json({
          message: "Recipe name is required for removal.",
        });
      }

      const recipe = await this.recipeService.FindRecipe(name);
      if (recipe instanceof Error) {
        console.error("Error occurred in `FindRecipe`:", recipe);
        return res
          .status(500)
          .json({ message: "Failed to find the recipe for deletion." });
      }
      if (!recipe) {
        return res.status(404).json({
          message: `Recipe with the name "${name}" not found.`,
        });
      }

      const recipeDependencies =
        await this.recipeService.FindRecipeDependencies({ name });
      if (recipeDependencies instanceof Error) {
        console.error(
          "Error occurred in `FindRecipeDependencies`:",
          recipeDependencies
        );
        return res
          .status(500)
          .json({ message: "Failed to check recipe dependencies." });
      }
      if (!recipeDependencies) {
        return res.status(404).json({
          message: `Recipe with the name "${name}" not found.`,
        });
      }
      if (recipeDependencies.ingredient.length > 0) {
        return res.status(403).json({
          message:
            "Cannot delete the recipe as it is used as an ingredient in existing menus.",
        });
      }

      const deletedRecipe = await this.recipeService.DeleteRecipe({ name });
      if (deletedRecipe instanceof Error) {
        console.error("Error occurred in `DeleteRecipe`:", deletedRecipe);
        return res
          .status(500)
          .json({ message: "Failed to delete the recipe." });
      }

      const deletedImage = await this.recipeService.DeleteRecipeImage(
        recipe.imagePath
      );
      if (deletedImage instanceof Error) {
        console.error("Error occurred in `DeleteRecipeImage`:", deletedImage);
        return res
          .status(500)
          .json({ message: "Failed to delete the recipe image." });
      }

      return res.json({ message: "The recipe has been removed." });
    } catch (err) {
      console.error("Error occurred in `RemoveRecipe`:", err);
      return res.status(500).json({ message: "Failed to remove the recipe." });
    }
  }
}
