import { Injectable } from "@nestjs/common";
import { PrismaClient, Prisma, Recipe } from "../../prisma/client";

@Injectable()
export class RecipeService {
  constructor(private prisma: PrismaClient) {}

  async InsertRecipe(data: Prisma.RecipeCreateInput): Promise<Recipe | Error> {
    try {
      const newRecipe = await this.prisma.recipe.create({
        data: data,
      });
      return newRecipe;
    } catch (err) {
      console.error("Failed to insert new recipe:", err);
      return Error(err as string);
    }
  }
}
