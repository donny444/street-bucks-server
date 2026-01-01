import { AuthDto } from "./user.dto";

export class MenuDto {
  id: number;
  name: string;
  price: number;
  fileName: string;
}

export class EditMenuDto {
  name: string;
  price: number;
  type: string;
  fileName: string;
  editor: AuthDto;
}
