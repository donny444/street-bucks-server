import { Test, TestingModule } from "@nestjs/testing";
import { RecipeService } from "../services/recipe.service";
import { PrismaClient } from "../../prisma/client";

describe("RecipeService", () => {
  let recipeService: RecipeService;
  let prismaClient: PrismaClient;

  const mockPrismaClient = {
    recipe: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipeService,
        {
          provide: PrismaClient,
          useValue: mockPrismaClient,
        },
      ],
    }).compile();

    recipeService = module.get<RecipeService>(RecipeService);
    prismaClient = module.get<PrismaClient>(PrismaClient);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(recipeService).toBeDefined();
  });

  describe("CheckRecipeExists", () => {
    it("should return true when recipe exists", async () => {
      mockPrismaClient.recipe.findUnique.mockResolvedValue({ name: "coffee" });

      const result = await recipeService.CheckRecipeExists("coffee");

      expect(mockPrismaClient.recipe.findUnique).toHaveBeenCalledWith({
        where: { name: "coffee" },
        select: { name: true },
      });
      expect(result).toBe(true);
    });

    it("should return false when recipe does not exist", async () => {
      mockPrismaClient.recipe.findUnique.mockResolvedValue(null);

      const result = await recipeService.CheckRecipeExists("nonexistent");

      expect(result).toBe(false);
    });

    it("should return Error on database failure", async () => {
      mockPrismaClient.recipe.findUnique.mockRejectedValue(
        new Error("DB Error"),
      );

      const result = await recipeService.CheckRecipeExists("coffee");

      expect(result).toBeInstanceOf(Error);
    });
  });

  describe("InsertRecipe", () => {
    it("should insert recipe successfully", async () => {
      mockPrismaClient.recipe.create.mockResolvedValue({
        name: "coffee",
        imagePath: "coffee.png",
      });

      const result = await recipeService.InsertRecipe({
        name: "coffee",
        unit: "ml",
        imagePath: "coffee.png",
      });

      expect(mockPrismaClient.recipe.create).toHaveBeenCalledWith({
        data: { name: "coffee", unit: "ml", imagePath: "coffee.png" },
      });
      expect(result).toBeUndefined();
    });

    it("should return Error on database failure", async () => {
      mockPrismaClient.recipe.create.mockRejectedValue(new Error("DB Error"));

      const result = await recipeService.InsertRecipe({
        name: "coffee",
        unit: "ml",
        imagePath: "coffee.png",
      });

      expect(result).toBeInstanceOf(Error);
    });
  });
});
