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
}

export class EditMenuDto {
  name!: string;
  price!: number;
  category!: Category;
  file!: File | null;
  editor!: CredentialsDto;
}
