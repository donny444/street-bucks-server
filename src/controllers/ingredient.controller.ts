import { Body, Controller, Put, Res } from "@nestjs/common";
import { Response } from "express";

import { IngredientService } from "../services/ingredient.service";

import { EditIngredientDto } from "../dtos/ingredient.dto";

@Controller("ingredients")
export class IngredientController {
  constructor(private readonly ingredientService: IngredientService) {}

  @Put()
  async EditIngredients(
    @Body() editIngredients: EditIngredientDto[],
    @Res() res: Response
  ): Promise<Response> {
    try {
      const updatedIngredients = await this.ingredientService.UpdateAmount({
        data: [
          ...editIngredients.map((ingredient) => ({
            amount: ingredient.amount,
          })),
        ],
        where: [
          ...editIngredients.map((ingredient) => ({
            menuId_recipeId: {
              menuId: ingredient.menuId,
              recipeId: ingredient.recipeId,
            },
          })),
        ],
      });
      if (!updatedIngredients || updatedIngredients instanceof Error) {
        console.error(
          "Transaction in `UpdateIngredients` did not complete:",
          updatedIngredients
        );
        return res
          .status(500)
          .json({ message: "Failed to edit amount of ingredients." });
      }

      return res.json({
        message: "The amount of ingredients has been updated.",
      });
    } catch (err) {
      console.error("Error occurred in `EditIngredient`:", err);
      return res
        .status(500)
        .json({ message: "Failed to edit amount of ingredients." });
    }
  }
}
