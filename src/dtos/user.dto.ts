import { $Enums } from "../../prisma/client";

export class RegisterDto {
  email!: string;
  password!: string;
  firstName!: string;
  lastName!: string;
}

export class EditUserDto {
  password!: string;
  firstName!: string;
  lastName!: string;
  role!: typeof $Enums.Role.STAFF | typeof $Enums.Role.MANAGER;
  editor!: EditorDto;
}

export class RemoveUserDto {
  editor!: EditorDto;
}

export class UserInfoDto {
  firstName!: string;
  lastName!: string;
  branchId!: number | bigint;
}

export class EditorDto {
  email!: string;
  password!: string;
}
