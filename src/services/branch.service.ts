import { Injectable } from "@nestjs/common";
import { PrismaClient, Prisma, Branch } from "../../prisma/client";

@Injectable()
export class BranchService {
  constructor(private prisma: PrismaClient) {}

  // serializeBranchId(branchInfo: BranchInfoDto): BranchInfoDto {
  //   return {
  //     ...branchInfo,
  //     id: Number(branchInfo.id),
  //   };
  // }

  async FindBranch(
    where: Prisma.BranchWhereUniqueInput
  ): Promise<Branch | null | Error> {
    try {
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

      return branchInfo;
    } catch (err) {
      console.error("Error finding branch:", err);
      return Error(err as string);
    }
  }

  async InsertBranch(data: Prisma.BranchCreateInput): Promise<Branch | Error> {
    try {
      const newBranch = await this.prisma.branch.create({
        data,
        select: {
          id: true,
          password: true,
        },
      });

      return newBranch;
    } catch (err) {
      console.error("Error inserting new branch:", err);
      return Error(err as string);
    }
  }
}
