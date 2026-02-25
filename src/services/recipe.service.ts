import { Injectable } from "@nestjs/common";
import { PrismaClient, Prisma, Recipe } from "../../prisma/client";
import { mkdir, writeFile } from "fs/promises";
import { dirname } from "path";

@Injectable()
export class RecipeService {
  constructor(private prisma: PrismaClient) {}

  async CheckRecipeExists(name: string): Promise<boolean> {
    const recipe = await this.prisma.recipe.findUnique({
      where: { name },
      select: { name: true },
    });
    return recipe !== null;
  }

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

  async UpdateRecipe(
    data: Prisma.RecipeUpdateInput,
    where: Prisma.RecipeWhereUniqueInput
  ): Promise<Recipe | Error> {
    try {
      const updatedRecipe = await this.prisma.recipe.update({
        data,
        where,
      });

      return updatedRecipe;
    } catch (err) {
      console.error("Failed to update recipe:", err);
      return Error(err as string);
    }
  }

  async CreateRecipeImage(
    fileContent: Express.Multer.File,
    filePath: string
  ): Promise<Buffer<ArrayBufferLike> | Error> {
    try {
      if (!fileContent || !filePath) {
        return Error("File content and path are required to create an image.");
      }

      await mkdir(dirname(filePath), { recursive: true });

      let buffer: Buffer<ArrayBufferLike>;

      if (fileContent && fileContent.buffer instanceof Buffer) {
        buffer = Buffer.from(fileContent.buffer);
      } else if (fileContent && Array.isArray(fileContent.buffer)) {
        buffer = Buffer.from(fileContent.buffer);
      } else {
        return Error("Unsupported file content provided.");
      }

      await writeFile(filePath, buffer);
      return buffer;
    } catch (err) {
      console.error("Error occurred in `CreateRecipeImage` service:", err);
      return Error((err as Error).message ?? String(err));
    }
  }
}
