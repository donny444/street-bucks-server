import { Test, TestingModule } from "@nestjs/testing";
import { IngredientController } from "../controllers/ingredient.controller";
import { IngredientService } from "../services/ingredient.service";
import { Response } from "express";
import { EditAmountDto } from "../dtos/ingredient.dto";

describe("IngredientController", () => {
  let ingredientController: IngredientController;

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
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(ingredientController).toBeDefined();
  });

  describe("EditAmounts", () => {
    const editAmountsData: EditAmountDto[] = [
      { menuId: "Hot Latte", recipeId: "coffee", amount: 50 },
      { menuId: "Iced Mocha", recipeId: "milk", amount: 75 },
    ];

    it("should update ingredient amounts successfully", async () => {
      mockIngredientService.UpdateAmounts.mockResolvedValue(undefined);

      const res = mockResponse();
      await ingredientController.EditAmounts(editAmountsData, res);

      expect(mockIngredientService.UpdateAmounts).toHaveBeenCalledWith({
        data: [{ amount: 50 }, { amount: 75 }],
        where: [
          { menuId_recipeId: { menuId: "Hot Latte", recipeId: "coffee" } },
          { menuId_recipeId: { menuId: "Iced Mocha", recipeId: "milk" } },
        ],
      });
      expect(res.json).toHaveBeenCalledWith({
        message: "The amounts of ingredients has been updated.",
      });
    });

    it("should return 500 when UpdateAmounts returns Error", async () => {
      mockIngredientService.UpdateAmounts.mockResolvedValue(
        new Error("Transaction failed"),
      );

      const res = mockResponse();
      await ingredientController.EditAmounts(editAmountsData, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to update amounts of ingredients.",
      });
    });
  });
});
