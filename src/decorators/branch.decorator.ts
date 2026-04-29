import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { BranchPayloadDto } from "../dtos/branch.dto";

export const BranchPayload = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): BranchPayloadDto => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const branchPayload = request.branchPayload;

    if (!branchPayload) {
      throw new UnauthorizedException(
        "Branch authorization required. Ensure branch-token header is provided.",
      );
    }

    return branchPayload;
  },
);
