import { Test, TestingModule } from "@nestjs/testing";
import { InsightService } from "../services/insight.service";
import { PrismaClient } from "../../prisma/client";

describe("InsightService", () => {
  let insightService: InsightService;
  let prismaClient: PrismaClient;

  const mockPrismaClient = {
    $transaction: jest.fn(),
    order: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    entry: {
      groupBy: jest.fn(),
      findMany: jest.fn(),
    },
    menu: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InsightService,
        {
          provide: PrismaClient,
          useValue: mockPrismaClient,
        },
      ],
    }).compile();

    insightService = module.get<InsightService>(InsightService);
    prismaClient = module.get<PrismaClient>(PrismaClient);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(insightService).toBeDefined();
  });

  describe("CountSalesToday", () => {
    it("should return today's sales count", async () => {
      mockPrismaClient.order.count.mockResolvedValue(15);

      const result = await insightService.CountSalesToday(1);

      expect(mockPrismaClient.order.count).toHaveBeenCalled();
      expect(result).toBe(15);
    });

    it("should return Error on database failure", async () => {
      mockPrismaClient.order.count.mockRejectedValue(new Error("DB Error"));

      const result = await insightService.CountSalesToday(1);

      expect(result).toBeInstanceOf(Error);
    });
  });

  describe("CountSalesThisWeek", () => {
    it("should return this week's sales count", async () => {
      mockPrismaClient.order.count.mockResolvedValue(50);

      const result = await insightService.CountSalesThisWeek(1);

      expect(mockPrismaClient.order.count).toHaveBeenCalled();
      expect(result).toBe(50);
    });

    it("should return Error on database failure", async () => {
      mockPrismaClient.order.count.mockRejectedValue(new Error("DB Error"));

      const result = await insightService.CountSalesThisWeek(1);

      expect(result).toBeInstanceOf(Error);
    });
  });

  describe("CountSalesThisMonth", () => {
    it("should return this month's sales count", async () => {
      mockPrismaClient.order.count.mockResolvedValue(200);

      const result = await insightService.CountSalesThisMonth(1);

      expect(mockPrismaClient.order.count).toHaveBeenCalled();
      expect(result).toBe(200);
    });

    it("should return Error on database failure", async () => {
      mockPrismaClient.order.count.mockRejectedValue(new Error("DB Error"));

      const result = await insightService.CountSalesThisMonth(1);

      expect(result).toBeInstanceOf(Error);
    });
  });

  describe("FindTopMenusByQuantity", () => {
    it("should return top 5 menus by quantity", async () => {
      const mockTopMenus = [
        { menuName: "Latte", totalQuantity: 50 },
        { menuName: "Mocha", totalQuantity: 40 },
      ];

      mockPrismaClient.$transaction.mockImplementation(async (callback) => {
        const mockPrismaTx = {
          entry: {
            groupBy: jest.fn().mockResolvedValue([
              { menuId: "Latte", _sum: { quantity: 50 } },
              { menuId: "Mocha", _sum: { quantity: 40 } },
            ]),
          },
          menu: {
            findMany: jest
              .fn()
              .mockResolvedValue([{ name: "Latte" }, { name: "Mocha" }]),
          },
        };
        return callback(mockPrismaTx);
      });

      const result = await insightService.FindTopMenusByQuantity(1);

      expect(mockPrismaClient.$transaction).toHaveBeenCalled();
      expect(result).toEqual(mockTopMenus);
    });

    it("should return Error on database failure", async () => {
      mockPrismaClient.$transaction.mockRejectedValue(new Error("DB Error"));

      const result = await insightService.FindTopMenusByQuantity(1);

      expect(result).toBeInstanceOf(Error);
    });
  });

  describe("SelectSalesInWeek", () => {
    it("should return sales data for the week", async () => {
      const mockSales = [
        { timestamp: BigInt(1704067200000) },
        { timestamp: BigInt(1704153600000) },
      ];
      mockPrismaClient.order.findMany.mockResolvedValue(mockSales);

      const result = await insightService.SelectSalesInWeek(1);

      expect(mockPrismaClient.order.findMany).toHaveBeenCalled();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should return Error on database failure", async () => {
      mockPrismaClient.order.findMany.mockRejectedValue(new Error("DB Error"));

      const result = await insightService.SelectSalesInWeek(1);

      expect(result).toBeInstanceOf(Error);
    });
  });

  describe("SelectSalesInMonth", () => {
    it("should return sales data for the month", async () => {
      const mockSales = [
        { timestamp: BigInt(1704067200000) },
        { timestamp: BigInt(1704153600000) },
      ];
      mockPrismaClient.order.findMany.mockResolvedValue(mockSales);

      const result = await insightService.SelectSalesInMonth(1);

      expect(mockPrismaClient.order.findMany).toHaveBeenCalled();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should return Error on database failure", async () => {
      mockPrismaClient.order.findMany.mockRejectedValue(new Error("DB Error"));

      const result = await insightService.SelectSalesInMonth(1);

      expect(result).toBeInstanceOf(Error);
    });
  });

  describe("SelectSalesInYear", () => {
    it("should return sales data by category for the year", async () => {
      const mockSales = [
        {
          order: { timestamp: BigInt(1704067200000) },
          menu: { category: "HOT" },
        },
        {
          order: { timestamp: BigInt(1704153600000) },
          menu: { category: "ICED" },
        },
      ];
      mockPrismaClient.entry.findMany.mockResolvedValue(mockSales);

      const result = await insightService.SelectSalesInYear(1);

      expect(mockPrismaClient.entry.findMany).toHaveBeenCalled();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should return Error on database failure", async () => {
      mockPrismaClient.entry.findMany.mockRejectedValue(new Error("DB Error"));

      const result = await insightService.SelectSalesInYear(1);

      expect(result).toBeInstanceOf(Error);
    });
  });
});
