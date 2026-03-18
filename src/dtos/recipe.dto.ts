import { Ingredient } from "prisma/client";

import { EditorDto } from "./user.dto";

export class AddRecipeDto {
  name!: string;
  unit!: string;
  file!: File;
  editor!: EditorDto;
}

export class EditRecipeDto {
  name!: string;
  unit!: string;
  editor!: EditorDto;
}

export class RecipeDependenciesDto {
  name!: string;
  ingredient!: Ingredient[];
}
