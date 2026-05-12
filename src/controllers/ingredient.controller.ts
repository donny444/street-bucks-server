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
        await this.ingredientService.FindMenuIngredients(menuId);
      if (menuIngredients instanceof Error) {
        console.error(
          "Error occurred in `FindMenuIngredients`:",
          menuIngredients
        );
        return res
          .status(500)
          .json({ error: "Failed to select menu ingredients." });
      }
      if (menuIngredients === null) {
        return res.status(404).json({ error: "The menu has no ingredients." });
      }

      return res.json({
        message: "Menu ingredient has been retrieved.",
        menu_ingredients: menuIngredients,
      });
    } catch (err) {
      console.error("Error occurred in `GetMenuIngredients`:", err);
      return res.status(500).json({ error: "Failed to get menu ingredients." });
    }
  }

  @Get()
  async GetIngredientList(@Res() res: Response): Promise<Response> {
    try {
      const ingredientList =
        await this.ingredientService.SelectIngredientList();
      if (ingredientList instanceof Error) {
        console.error(
          "Error occurred in `SelectIngredientList`:",
          ingredientList
        );
        return res
          .status(500)
          .json({ error: "Failed to select ingredient list." });
      }
      if (ingredientList.length === 0) {
        return res
          .status(404)
          .json({ error: "No ingredients found." });
      }

      return res.json({
        message: "Ingredient list has been retrieved.",
        ingredient_list: ingredientList,
      });
    } catch (err) {
      console.error("Error occurred in `GetIngredientList`:", err);
      return res.status(500).json({ error: "Failed to get ingredient list." });
    }
  }
}
