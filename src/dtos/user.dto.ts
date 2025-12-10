export type RegisterDto = {
  firstName: string;
  lastName: string;
  password: string;
  branchId: number | bigint;
};

export type UserEditDto = {
  uuid: string;
  firstName: string;
  lastName: string;
  password: string;
  role: "STAFF" | "MANAGER";
};
