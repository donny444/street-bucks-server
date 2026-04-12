export class EditAmountDto {
  menuId!: string;
  recipeId!: string;
  amount!: number;
}

export class MenuIngredientDto {
  recipeId!: string;
  amount!: number;
}
