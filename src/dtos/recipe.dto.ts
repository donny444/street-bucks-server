import { Ingredient } from "prisma/client";

import { CredentialsDto } from "./user.dto";

export class AddRecipeDto {
  name!: string;
  unit!: string;
  file!: File;
  editor!: CredentialsDto;
}

export class EditRecipeDto {
  name!: string;
  unit!: string;
  editor!: CredentialsDto;
}

export class RecipeDependenciesDto {
  name!: string;
  ingredient!: Ingredient[];
}
