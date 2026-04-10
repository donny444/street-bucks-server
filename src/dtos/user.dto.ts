import { $Enums } from "../../prisma/client";

export class RegisterDto {
  email!: string;
  password!: string;
  firstName!: string;
  lastName!: string;
}

export class AttendaceRecordDto {
  uuid!: string;
  userId!: string;
  dateTime!: Date;
}

export class EditUserDto {
  email!: string;
  firstName!: string;
  lastName!: string;
  role!: typeof $Enums.Role.STAFF | typeof $Enums.Role.MANAGER;
  password?: string;
  editor!: CredentialsDto;
}

export class RemoveUserDto {
  editor!: CredentialsDto;
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
  attendances!: {
    dateTime: Date;
  }[];
}

export class CredentialsDto {
  email!: string;
  password!: string;
}
