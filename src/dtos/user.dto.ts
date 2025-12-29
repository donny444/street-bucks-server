import { $Enums } from "../../prisma/client";

export type RegisterDto = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  branchId: number | bigint;
};

export type EditUserDto = {
  password: string;
  firstName: string;
  lastName: string;
  role: typeof $Enums.Role.STAFF | typeof $Enums.Role.MANAGER;
  editor: AuthDto;
};

export type RemoveUserDto = {
  editor: AuthDto;
};

export type UserInfoDto = {
  firstName: string;
  lastName: string;
  branchId: number | bigint;
};

export type AuthDto = {
  email: string;
  password: string;
};
