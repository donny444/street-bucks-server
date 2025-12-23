import { $Enums } from "../../prisma/client";

export type RegisterDto = {
  firstName: string;
  lastName: string;
  password: string;
  branchId: number | bigint;
};

export type EditUserDto = {
  firstName: string;
  lastName: string;
  password: string;
  role: typeof $Enums.Role.STAFF | typeof $Enums.Role.MANAGER;
  auth: AuthDto;
};

export type RemoveUserDto = {
  auth: AuthDto;
};

export type UserInfoDto = {
  firstName: string;
  lastName: string;
  branchId: number | bigint;
};

export type AuthDto = {
  firstName: string;
  lastName: string;
  password: string;
};
