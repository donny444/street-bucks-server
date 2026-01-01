import { Injectable } from "@nestjs/common";
import { PrismaClient, Prisma, MenuRecipe } from "../../prisma/client";

@Injectable()
export class IngredientService {
  constructor(private prisma: PrismaClient) {}

  async UpdateIngredients(params: {
    data: Prisma.MenuRecipeUpdateInput[];
    where: Prisma.MenuRecipeWhereUniqueInput[];
  }): Promise<MenuRecipe[]> {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        const updatePromises = params.where.map((where, index) => {
          return prisma.menuRecipe.update({
            where: where,
            data: params.data[index],
          });
        });
        return Promise.all(updatePromises);
      });
    } catch (err) {
      console.error("The transaction to update ingredients failed:", err);
      throw err;
    }
  }
}
