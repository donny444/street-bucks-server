import { Injectable } from "@nestjs/common";
import { PrismaClient, Prisma } from "../../prisma/client";

@Injectable()
export class IngredientService {
  constructor(private prisma: PrismaClient) {}

  private toError(tag: string, err: unknown): Error {
    return new Error(
      `${tag} error: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  async UpdateAmounts(params: {
    data: Prisma.IngredientUpdateInput[];
    where: Prisma.IngredientWhereUniqueInput[];
  }): Promise<void | Error> {
    try {
      try {
        await this.prisma.$transaction(async (p) => {
          const updatePromises = params.where.map((ing, ind) => {
            return p.ingredient.update({
              data: params.data[ind],
              where: ing,
            });
          });
          return Promise.all(updatePromises);
        });
      } catch (err) {
        throw this.toError(
          "The transaction to update ingredients failed:",
          err
        );
      }
    } catch (err) {
      return err instanceof Error ? err : new Error(String(err));
    }
  }
}
