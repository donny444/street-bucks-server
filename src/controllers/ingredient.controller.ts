import { Body, Controller, Get, Param, Put, Res } from "@nestjs/common";
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
      const updatedAmounts = await this.ingredientService.UpdateAmounts({
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
      if (updatedAmounts instanceof Error) {
        console.error("Error occurred in `UpdateAmounts`:", updatedAmounts);
        return res
          .status(500)
          .json({ error: "Failed to update amounts of ingredients." });
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

  @Get(":name")
  async GetMenuIngredients(
    @Param("name") menuId: string,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const menuIngredients =
        await this.ingredientService.SelectMenuIngredients(menuId);
      if (menuIngredients instanceof Error) {
        console.error(
          "Error occurred in `GetMenuIngredients`:",
          menuIngredients
        );
        return res
          .status(500)
          .json({ error: "Failed to get ingredient list of the menu." });
      }
      if (menuIngredients === null) {
        return res.status(404).json({ error: "The menu has no ingredients." });
      }

      return res.json({
        message: "Ingredient list of the menu has been retrieved.",
        menu_ingredients: menuIngredients,
      });
    } catch (err) {
      console.error("Error occurred in `GetMenuIngredients`:", err);
      return res
        .status(500)
        .json({ error: "Failed to get ingredient list of the menu." });
    }
  }
}
