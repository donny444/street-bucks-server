import { EditorDto } from "./user.dto";

export class AddRecipeDto {
  name!: string;
  unit!: string;
  file!: File;
  editor!: EditorDto;
}
