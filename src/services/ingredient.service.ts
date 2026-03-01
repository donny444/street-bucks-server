import { Injectable } from "@nestjs/common";
import { PrismaClient, Prisma, Ingredient } from "../../prisma/client";

@Injectable()
export class IngredientService {
  constructor(private prisma: PrismaClient) {}

  async UpdateAmounts(params: {
    data: Prisma.IngredientUpdateInput[];
    where: Prisma.IngredientWhereUniqueInput[];
  }): Promise<Ingredient[] | Error> {
    try {
      return await this.prisma.$transaction(async (p) => {
        const updatePromises = params.where.map((ing, ind) => {
          return p.ingredient.update({
            data: params.data[ind],
            where: ing,
          });
        });
        return Promise.all(updatePromises);
      });
    } catch (err) {
      console.error("The transaction to update ingredients failed:", err);
      return Error(err as string);
    }
  }
}
