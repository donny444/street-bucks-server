import { BranchPayloadDto } from "../dtos/branch.dto";

declare global {
  namespace Express {
    interface Request {
      branchPayload?: BranchPayloadDto;
    }
  }
}
