import { Injectable } from "@nestjs/common";
import { PrismaClient, Prisma } from "../../prisma/client";

import { recipeQuantityDto } from "src/dtos/stock.dto";

@Injectable()
export class StockService {
  constructor(private prisma: PrismaClient) {}

  private toError(tag: string, err: unknown): Error {
    return new Error(
      `${tag} error: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  async UpdateQuantity(params: {
    data: Prisma.StockUncheckedUpdateInput;
    where: Prisma.StockWhereUniqueInput;
  }): Promise<void | Error> {
    try {
      try {
        await this.prisma.stock.update({
          data: params.data,
          where: params.where,
        });
      } catch (err) {
        throw this.toError("Error updating stock quantity:", err);
      }
    } catch (err) {
      return err instanceof Error ? err : new Error(String(err));
    }
  }

  async SelectStocksByBranch(
    where: Prisma.StockWhereInput,
  ): Promise<recipeQuantityDto[] | Error> {
    try {
      try {
        const recipeQuantities = this.prisma.stock.findMany({
          select: {
            recipe: {
              select: {
                name: true,
                unit: true,
                imagePath: true,
              },
            },
            quantity: true,
          },
          where,
        });

        return recipeQuantities;
      } catch (err) {
        throw this.toError("Error getting stocks by branch:", err);
      }
    } catch (err) {
      return err instanceof Error ? err : new Error(String(err));
    }
  }
}
