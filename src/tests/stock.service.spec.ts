import { Test, TestingModule } from "@nestjs/testing";
import { StockService } from "../services/stock.service";
import { PrismaClient } from "../../prisma/client";

describe("StockService", () => {
  let stockService: StockService;
  let prismaClient: PrismaClient;

  const mockPrismaClient = {
    stock: {
      update: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockService,
        {
          provide: PrismaClient,
          useValue: mockPrismaClient,
        },
      ],
    }).compile();

    stockService = module.get<StockService>(StockService);
    prismaClient = module.get<PrismaClient>(PrismaClient);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(stockService).toBeDefined();
  });

  describe("UpdateQuantity", () => {
    it("should update stock quantity successfully", async () => {
      mockPrismaClient.stock.update.mockResolvedValue({
        branchId: BigInt(1),
        recipeId: "coffee",
        quantity: 100,
      });

      const result = await stockService.UpdateQuantity({
        data: { quantity: 100 },
        where: {
          branchId_recipeId: {
            branchId: BigInt(1),
            recipeId: "coffee",
          },
        },
      });

      expect(mockPrismaClient.stock.update).toHaveBeenCalledWith({
        data: { quantity: 100 },
        where: {
          branchId_recipeId: {
            branchId: BigInt(1),
            recipeId: "coffee",
          },
        },
      });
      expect(result).toBeUndefined();
    });

    it("should return Error on database failure", async () => {
      mockPrismaClient.stock.update.mockRejectedValue(new Error("DB Error"));

      const result = await stockService.UpdateQuantity({
        data: { quantity: 100 },
        where: {
          branchId_recipeId: {
            branchId: BigInt(1),
            recipeId: "coffee",
          },
        },
      });

      expect(result).toBeInstanceOf(Error);
    });
  });

  describe("SelectStocksByBranch", () => {
    it("should return stocks for a branch", async () => {
      const mockStocks = [
        { recipeId: "coffee", quantity: 100 },
        { recipeId: "milk", quantity: 200 },
      ];
      mockPrismaClient.stock.findMany.mockResolvedValue(mockStocks);

      const result = await stockService.SelectStocksByBranch({
        branchId: BigInt(1),
      });

      expect(mockPrismaClient.stock.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockStocks);
    });

    it("should return Error on database failure", async () => {
      mockPrismaClient.stock.findMany.mockRejectedValue(new Error("DB Error"));

      await expect(
        stockService.SelectStocksByBranch({
          branchId: BigInt(1),
        }),
      ).rejects.toThrow("DB Error");
    });
  });
});
