import { Test, TestingModule } from "@nestjs/testing";
import { IngredientService } from "../services/ingredient.service";
import { PrismaClient } from "../../prisma/client";

describe("IngredientService", () => {
  let ingredientService: IngredientService;
  let prismaClient: PrismaClient;

  const mockPrismaClient = {
    $transaction: jest.fn(),
    ingredient: {
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngredientService,
        {
          provide: PrismaClient,
          useValue: mockPrismaClient,
        },
      ],
    }).compile();

    ingredientService = module.get<IngredientService>(IngredientService);
    prismaClient = module.get<PrismaClient>(PrismaClient);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(ingredientService).toBeDefined();
  });

  describe("UpdateAmounts", () => {
    const updateData = {
      data: [{ amount: 50 }, { amount: 75 }],
      where: [
        { menuId_recipeId: { menuId: "Latte", recipeId: "coffee" } },
        { menuId_recipeId: { menuId: "Latte", recipeId: "milk" } },
      ],
    };

    it("should update ingredient amounts successfully", async () => {
      mockPrismaClient.$transaction.mockImplementation(async (callback) => {
        const mockPrismaTx = {
          ingredient: {
            update: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(mockPrismaTx);
      });

      const result = await ingredientService.UpdateAmounts(updateData);

      expect(mockPrismaClient.$transaction).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it("should return Error when transaction fails", async () => {
      mockPrismaClient.$transaction.mockRejectedValue(new Error("Transaction failed"));

      const result = await ingredientService.UpdateAmounts(updateData);

      expect(result).toBeInstanceOf(Error);
    });

    it("should handle single ingredient update", async () => {
      const singleUpdate = {
        data: [{ amount: 100 }],
        where: [{ menuId_recipeId: { menuId: "Latte", recipeId: "coffee" } }],
      };

      mockPrismaClient.$transaction.mockImplementation(async (callback) => {
        const mockPrismaTx = {
          ingredient: {
            update: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(mockPrismaTx);
      });

      const result = await ingredientService.UpdateAmounts(singleUpdate);

      expect(mockPrismaClient.$transaction).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });
});
