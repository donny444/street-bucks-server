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
      const updatedIngredients = await this.ingredientService.UpdateIngredients(
        {
          where: [
            ...editIngredients.map((ingredient) => ({
              menuId_recipeId: {
                menuId: BigInt(ingredient.menuId),
                recipeId: BigInt(ingredient.recipeId),
              },
            })),
          ],
          data: [
            ...editIngredients.map((ingredient) => ({
              amount: ingredient.amount,
            })),
          ],
        }
      );

      if (updatedIngredients.length !== editIngredients.length) {
        throw new Error("Transaction in `UpdateIngredients` did not complete.");
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
