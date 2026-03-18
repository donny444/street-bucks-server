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

export class FindUserDto {
  email!: string;
  password!: string;
  role!: string;
}

export class UserFormDto {
  email!: string;
  firstName!: string;
  lastName!: string;
  role!: $Enums.Role;
}

export class UserEntryDto {
  email!: string;
  firstName!: string;
  lastName!: string;
  role!: $Enums.Role;
  branchId!: bigint | number;
}

export class BranchUserDto {
  firstName!: string;
  lastName!: string;
  email!: string;
  role!: $Enums.Role;
  attendances?: {
    dateTime: Date;
  }[];
  attended?: boolean;
}

export class EditorDto {
  email!: string;
  password!: string;
}

export class UserCredentialsDto {
  email!: string;
  password!: string;
}
