import { $Enums } from "../../prisma/client";

export class RegisterDto {
  email!: string;
  password!: string;
  firstName!: string;
  lastName!: string;
}

export class EditUserDto {
  email!: string;
  firstName!: string;
  lastName!: string;
  role!: typeof $Enums.Role.STAFF | typeof $Enums.Role.MANAGER;
  password!: string;
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

export class BranchUserDto {
  firstName!: string;
  lastName!: string;
  email!: string;
  role!: $Enums.Role;
  attended!: boolean;
}

export class EditorDto {
  email!: string;
  password!: string;
}
