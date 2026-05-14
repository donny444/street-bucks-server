import { MenuIngredientDto } from "./ingredient.dto";
import { CredentialsDto } from "./user.dto";
import { Category } from "../../prisma/client";

export class MenuInfoDto {
  name!: string;
  price!: number;
  imagePath!: string;
}

export class MenuFormDto {
  name!: string;
  price!: number;
  category!: Category;
  file?: File | null;
  ingredient!: MenuIngredientDto[];
  note?: string | null;
}