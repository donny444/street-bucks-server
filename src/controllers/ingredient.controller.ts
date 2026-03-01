import { Body, Controller, Put, Res } from "@nestjs/common";
import { Response } from "express";

import { IngredientService } from "../services/ingredient.service";

import { EditAmountDto } from "../dtos/ingredient.dto";

@Controller("ingredients")
export class IngredientController {
  constructor(private readonly ingredientService: IngredientService) {}

  @Put()
  async EditAmounts(
    @Body() editAmounts: EditAmountDto[],
    @Res() res: Response
  ): Promise<Response> {
    try {
      const updatedIngredients = await this.ingredientService.UpdateAmounts({
        data: [
          ...editAmounts.map((i) => ({
            amount: i.amount,
          })),
        ],
        where: [
          ...editAmounts.map((i) => ({
            menuId_recipeId: {
              menuId: i.menuId,
              recipeId: i.recipeId,
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
          .json({ message: "Failed to edit amounts of ingredients." });
      }

      return res.json({
        message: "The amounts of ingredients has been updated.",
      });
    } catch (err) {
      console.error("Error occurred in `EditAmounts`:", err);
      return res
        .status(500)
        .json({ message: "Failed to edit amounts of ingredients." });
    }
  }
}
