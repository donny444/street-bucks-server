import { Test, TestingModule } from "@nestjs/testing";
import { StockController } from "../controllers/stock.controller";
import { StockService } from "../services/stock.service";
import { Response } from "express";

describe("StockController", () => {
  let stockController: StockController;
  let stockService: StockService;

  const mockStockService = {
    UpdateQuantity: jest.fn(),
    GetStocksByBranch: jest.fn(),
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
      controllers: [StockController],
      providers: [
        {
          provide: StockService,
          useValue: mockStockService,
        },
      ],
    }).compile();

    stockController = module.get<StockController>(StockController);
    stockService = module.get<StockService>(StockService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(stockController).toBeDefined();
  });

  describe("EditQuantity", () => {
    const branchPayload = JSON.stringify({ branchId: 1 });
    const editQuantityData = { recipeId: BigInt(5), quantity: 100 };

    it("should update stock quantity successfully", async () => {
      mockStockService.UpdateQuantity.mockResolvedValue({
        branchId: BigInt(1),
        recipeId: BigInt(5),
        quantity: 100,
      });

      const res = mockResponse();
      await stockController.EditQuantity(branchPayload, editQuantityData, res);

      expect(mockStockService.UpdateQuantity).toHaveBeenCalledWith({
        data: { quantity: 100 },
        where: {
          branchId_recipeId: {
            branchId: BigInt(1),
            recipeId: BigInt(5),
          },
        },
      });
      expect(res.json).toHaveBeenCalledWith({
        message:
          "The quantity of the selected recipe has been updated for you branch.",
      });
    });

    it("should return 500 when UpdateQuantity returns Error", async () => {
      mockStockService.UpdateQuantity.mockResolvedValue(new Error("DB Error"));

      const res = mockResponse();
      await stockController.EditQuantity(branchPayload, editQuantityData, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to edit quantity of the recipe.",
      });
    });

    it("should return 500 on exception", async () => {
      mockStockService.UpdateQuantity.mockRejectedValue(new Error("DB Error"));

      const res = mockResponse();
      await stockController.EditQuantity(branchPayload, editQuantityData, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to edit quantity of a recipe.",
      });
    });
  });

  describe("GetBranchStocks", () => {
    const branchPayload = JSON.stringify({ branchId: 1 });

    it("should return branch stocks successfully", async () => {
      const mockStocks = [
        { recipeId: BigInt(1), quantity: 100 },
        { recipeId: BigInt(2), quantity: 50 },
      ];
      mockStockService.GetStocksByBranch.mockResolvedValue(mockStocks);

      const res = mockResponse();
      await stockController.GetBranchStocks(branchPayload, res);

      expect(mockStockService.GetStocksByBranch).toHaveBeenCalledWith({
        branchId: BigInt(1),
      });
      expect(res.json).toHaveBeenCalledWith({
        message: "Get stocks of the branch.",
        branch_stocks: mockStocks,
      });
    });

    it("should return 500 when GetStocksByBranch returns Error", async () => {
      mockStockService.GetStocksByBranch.mockResolvedValue(
        new Error("DB Error")
      );

      const res = mockResponse();
      await stockController.GetBranchStocks(branchPayload, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to get the stock information of the branch.",
      });
    });

    it("should return 500 on exception", async () => {
      mockStockService.GetStocksByBranch.mockRejectedValue(
        new Error("DB Error")
      );

      const res = mockResponse();
      await stockController.GetBranchStocks(branchPayload, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to get the stock information.",
      });
    });
  });
});
