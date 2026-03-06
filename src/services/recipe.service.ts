import { Injectable } from "@nestjs/common";
import { PrismaClient, Prisma } from "../../prisma/client";

import { mkdir, writeFile } from "fs/promises";
import { dirname } from "path";

@Injectable()
export class RecipeService {
  constructor(private prisma: PrismaClient) {}

  private toError(tag: string, err: unknown): Error {
    return new Error(
      `${tag} error: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  async CheckRecipeExists(name: string): Promise<boolean | Error> {
    try {
      try {
        const recipe = await this.prisma.recipe.findUnique({
          where: { name },
          select: { name: true },
        });

        return recipe !== null;
      } catch (err) {
        throw this.toError("Error checking if recipe exists:", err);
      }
    } catch (err) {
      return err instanceof Error ? err : new Error(String(err));
    }
  }

  async InsertRecipe(data: Prisma.RecipeCreateInput): Promise<void | Error> {
    try {
      try {
        await this.prisma.recipe.create({
          data: data,
        });
      } catch (err) {
        throw this.toError("Error inserting new recipe:", err);
      }
    } catch (err) {
      return err instanceof Error ? err : new Error(String(err));
    }
  }

  async UpdateRecipe(
    data: Prisma.RecipeUpdateInput,
    where: Prisma.RecipeWhereUniqueInput
  ): Promise<void | Error> {
    try {
      try {
        await this.prisma.recipe.update({
          data,
          where,
        });
      } catch (err) {
        throw this.toError("Error updating recipe:", err);
      }
    } catch (err) {
      return err instanceof Error ? err : new Error(String(err));
    }
  }

  async CreateRecipeImage(
    fileContent: Express.Multer.File,
    filePath: string
  ): Promise<void | Error> {
    try {
      try {
        await mkdir(dirname(filePath), { recursive: true });

        const buffer = Buffer.from(fileContent.buffer);

        await writeFile(filePath, buffer);
      } catch (err) {
        throw this.toError("Error creating recipe image:", err);
      }
    } catch (err) {
      return err instanceof Error ? err : new Error(String(err));
    }
  }
}
