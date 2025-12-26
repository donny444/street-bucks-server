import { Injectable } from "@nestjs/common";
import { PrismaClient, Prisma } from "../../prisma/client";

import { BranchInfoDto } from "../dtos/branch.dto";

@Injectable()
export class BranchService {
  constructor(private prisma: PrismaClient) {}

  serializeBranchId(branchInfo: BranchInfoDto): BranchInfoDto {
    return {
      ...branchInfo,
      id: Number(branchInfo.id),
    };
  }

  async FindBranch(
    where: Prisma.BranchWhereUniqueInput
  ): Promise<BranchInfoDto | null> {
    const branchInfo = await this.prisma.branch.findUnique({
      select: {
        id: true,
        password: true,
      },
      where,
    });
    if (!branchInfo) {
      return null;
    }

    const serializedBranchInfo = this.serializeBranchId(branchInfo);

    return serializedBranchInfo;
  }
}
