import { Recipe } from "../../prisma/client";

export class EditQuantityDto {
  recipeId!: string;
  quantity!: number;
}

export class recipeQuantityDto {
  recipe!: Recipe;
  quantity!: number;
}
