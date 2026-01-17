import { Injectable } from "@nestjs/common";
import { PrismaClient, Prisma, Ingredient } from "../../prisma/client";

@Injectable()
export class IngredientService {
  constructor(private prisma: PrismaClient) {}

  async UpdateAmount(params: {
    data: Prisma.IngredientUpdateInput[];
    where: Prisma.IngredientWhereUniqueInput[];
  }): Promise<Ingredient[] | Error> {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        const updatePromises = params.where.map((where, index) => {
          return prisma.ingredient.update({
            data: params.data[index],
            where: where,
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
