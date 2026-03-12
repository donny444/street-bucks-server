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

  private toError(tag: string, err: unknown): Error {
    return new Error(
      `${tag} error: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  async FindBranch(
    where: Prisma.BranchWhereUniqueInput
  ): Promise<Branch | null | Error> {
    try {
      try {
        const branchInfo = await this.prisma.branch.findUnique({
          where,
        });

        return branchInfo;
      } catch (err) {
        throw this.toError("Error finding unique branch:", err);
      }
    } catch (err) {
      return err instanceof Error ? err : new Error(String(err));
    }
  }

  async InsertBranch(data: Prisma.BranchCreateInput): Promise<void | Error> {
    try {
      try {
        await this.prisma.branch.create({
          data,
        });
      } catch (err) {
        throw this.toError("Error inserting new branch:", err);
      }
    } catch (err) {
      return err instanceof Error ? err : new Error(String(err));
    }
  }

  async SelectBranches(): Promise<number[] | Error> {
    try {
      try {
        const branches = await this.prisma.branch.findMany({
          select: {
            id: true,
          },
        });

        return branches.map((b) => Number(b.id));
      } catch (err) {
        throw this.toError("Error selecting branches:", err);
      }
    } catch (err) {
      return err instanceof Error ? err : new Error(String(err));
    }
  }
}
