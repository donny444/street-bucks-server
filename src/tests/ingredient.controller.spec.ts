import { Test, TestingModule } from "@nestjs/testing";
import { IngredientController } from "../controllers/ingredient.controller";
import { IngredientService } from "../services/ingredient.service";
import { Response } from "express";
import { EditAmountDto } from "../dtos/ingredient.dto";

describe("IngredientController", () => {
  let ingredientController: IngredientController;
  let ingredientService: IngredientService;

  const mockIngredientService = {
    UpdateAmounts: jest.fn(),
  };

  const mockResponse = () => {
    const res: Partial<Response> = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    return res as Response;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngredientController],
      providers: [
        {
          provide: IngredientService,
          useValue: mockIngredientService,
        },
      ],
    }).compile();

    ingredientController =
      module.get<IngredientController>(IngredientController);
    ingredientService = module.get<IngredientService>(IngredientService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(ingredientController).toBeDefined();
  });

  describe("EditAmounts", () => {
    const editAmountsData: EditAmountDto[] = [
      { menuId: "Hot Latte", recipeId: BigInt(10), amount: 50 },
      { menuId: "Iced Mocha", recipeId: BigInt(20), amount: 75 },
    ];

    it("should update ingredient amounts successfully", async () => {
      mockIngredientService.UpdateAmounts.mockResolvedValue({});

      const res = mockResponse();
      await ingredientController.EditAmounts(editAmountsData, res);

      expect(mockIngredientService.UpdateAmounts).toHaveBeenCalledWith({
        data: [{ amount: 50 }, { amount: 75 }],
        where: [
          { menuId_recipeId: { menuId: "Hot Latte", recipeId: BigInt(10) } },
          { menuId_recipeId: { menuId: "Iced Mocha", recipeId: BigInt(20) } },
        ],
      });
      expect(res.json).toHaveBeenCalledWith({
        message: "The amounts of ingredients has been updated.",
      });
    });

    it("should return 500 when UpdateAmounts returns Error", async () => {
      mockIngredientService.UpdateAmounts.mockResolvedValue(
        new Error("Transaction failed")
      );

      const res = mockResponse();
      await ingredientController.EditAmounts(editAmountsData, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to update amounts of ingredients.",
      });
    });

    it("should return 500 on unexpected exception", async () => {
      mockIngredientService.UpdateAmounts.mockRejectedValue(
        new Error("Unexpected error")
      );

      const res = mockResponse();
      await ingredientController.EditAmounts(editAmountsData, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to edit amounts of ingredients.",
      });
    });
  });
});
        new Error("Unexpected error")
      );

      const res = mockResponse();
      await ingredientController.EditIngredients(editIngredientsData, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to edit amount of ingredients.",
      });
    });

    it("should handle single ingredient update", async () => {
      const singleIngredient: EditIngredientDto[] = [
        { menuId: 1, recipeId: 10, amount: 100 },
      ];
      const updatedIngredient = [
        { menuId: BigInt(1), recipeId: BigInt(10), amount: 100 },
      ];
      mockIngredientService.UpdateAmount.mockResolvedValue(updatedIngredient);

      const res = mockResponse();
      await ingredientController.EditIngredients(singleIngredient, res);

      expect(mockIngredientService.UpdateAmount).toHaveBeenCalledWith({
        data: [{ amount: 100 }],
        where: [
          { menuId_recipeId: { menuId: BigInt(1), recipeId: BigInt(10) } },
        ],
      });
      expect(res.json).toHaveBeenCalledWith({
        message: "The amount of ingredients has been updated.",
      });
    });
  });
});
