import { AuthDto } from "./user.dto";
import { Category } from "../prisma/client";

export class EditMenuDto {
  name!: string;
  price!: number;
  category!: Category;
  file!: File;
  editor!: AuthDto;
}
