export type SignInDto = {
  branchId: number;
  password: string;
};

export type SerializedBranchId = number;

export type BranchPayloadDto = {
  branchId: number;
};

export type CreateBranchDto = {
  password: string;
};
