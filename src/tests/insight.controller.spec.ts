import { Test, TestingModule } from "@nestjs/testing";
import { InsightController } from "../controllers/insight.controller";
import { InsightService } from "../services/insight.service";
import { Response } from "express";

describe("InsightController", () => {
  let insightController: InsightController;
  let insightService: InsightService;

  const mockInsightService = {
    CountSalesToday: jest.fn(),
    CountSalesThisWeek: jest.fn(),
    CountSalesThisMonth: jest.fn(),
    FindTopMenusByQuantity: jest.fn(),
    FindTopMenusByRevenue: jest.fn(),
    SelectSalesInWeek: jest.fn(),
    SelectSalesInMonth: jest.fn(),
    SelectSalesInYear: jest.fn(),
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
      controllers: [InsightController],
      providers: [
        {
          provide: InsightService,
          useValue: mockInsightService,
        },
      ],
    }).compile();

    insightController = module.get<InsightController>(InsightController);
    insightService = module.get<InsightService>(InsightService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(insightController).toBeDefined();
  });

  describe("GetSalesToday", () => {
    const branchPayload = { branchId: 1 };

    it("should return today's sales count", async () => {
      mockInsightService.CountSalesToday.mockResolvedValue(15);

      const res = mockResponse();
      await insightController.GetSalesToday(branchPayload, res);

      expect(mockInsightService.CountSalesToday).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        message: "See today's menu sales.",
        insight: 15,
      });
    });

    it("should return 500 when service returns Error", async () => {
      mockInsightService.CountSalesToday.mockResolvedValue(
        new Error("DB Error"),
      );

      const res = mockResponse();
      await insightController.GetSalesToday(branchPayload, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "DB Error",
      });
    });

    it("should return 500 on exception", async () => {
      mockInsightService.CountSalesToday.mockRejectedValue(
        new Error("DB Error"),
      );

      const res = mockResponse();
      await insightController.GetSalesToday(branchPayload, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to retrieve today's sales.",
      });
    });
  });

  describe("GetSalesThisWeek", () => {
    const branchPayload = { branchId: 1 };

    it("should return this week's sales count", async () => {
      mockInsightService.CountSalesThisWeek.mockResolvedValue(75);

      const res = mockResponse();
      await insightController.GetSalesThisWeek(branchPayload, res);

      expect(mockInsightService.CountSalesThisWeek).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        message: "See this week's menu sales.",
        insight: 75,
      });
    });

    it("should return 500 when service returns Error", async () => {
      mockInsightService.CountSalesThisWeek.mockResolvedValue(
        new Error("DB Error"),
      );

      const res = mockResponse();
      await insightController.GetSalesThisWeek(branchPayload, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it("should return 500 on exception", async () => {
      mockInsightService.CountSalesThisWeek.mockRejectedValue(
        new Error("DB Error"),
      );

      const res = mockResponse();
      await insightController.GetSalesThisWeek(branchPayload, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to retrieve this week's sales.",
      });
    });
  });

  describe("GetSalesThisMonth", () => {
    const branchPayload = { branchId: 1 };

    it("should return this month's sales count", async () => {
      mockInsightService.CountSalesThisMonth.mockResolvedValue(200);

      const res = mockResponse();
      await insightController.GetSalesThisMonth(branchPayload, res);

      expect(mockInsightService.CountSalesThisMonth).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        message: "See this month's menu sales.",
        insight: 200,
      });
    });

    it("should return 500 when service returns Error", async () => {
      mockInsightService.CountSalesThisMonth.mockResolvedValue(
        new Error("DB Error"),
      );

      const res = mockResponse();
      await insightController.GetSalesThisMonth(branchPayload, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it("should return 500 on exception", async () => {
      mockInsightService.CountSalesThisMonth.mockRejectedValue(
        new Error("DB Error"),
      );

      const res = mockResponse();
      await insightController.GetSalesThisMonth(branchPayload, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to retrieve this month's sales.",
      });
    });
  });

  describe("GetTopMenusByQuantity", () => {
    const branchPayload = { branchId: 1 };

    it("should return top 5 menus by quantity successfully", async () => {
      const topMenus = [
        { menuName: "Latte", totalQuantity: 50 },
        { menuName: "Mocha", totalQuantity: 40 },
        { menuName: "Espresso", totalQuantity: 30 },
      ];
      mockInsightService.FindTopMenusByQuantity.mockResolvedValue(topMenus);

      const res = mockResponse();
      await insightController.GetTopMenusByQuantity(branchPayload, res);

      expect(mockInsightService.FindTopMenusByQuantity).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        message: "Retrieved top 5 sold menus by quantity.",
        insight: {
          labels: ["Latte", "Mocha", "Espresso"],
          data: [50, 40, 30],
        },
      });
    });

    it("should return 500 when service returns Error", async () => {
      mockInsightService.FindTopMenusByQuantity.mockResolvedValue(
        new Error("DB Error"),
      );

      const res = mockResponse();
      await insightController.GetTopMenusByQuantity(branchPayload, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it("should return 500 on exception", async () => {
      mockInsightService.FindTopMenusByQuantity.mockRejectedValue(
        new Error("DB Error"),
      );

      const res = mockResponse();
      await insightController.GetTopMenusByQuantity(branchPayload, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to retrieve top menus by quantity.",
      });
    });
  });

  describe("GetTopMenusByRevenue", () => {
    const branchPayload = { branchId: 1 };

    it("should return top 5 menus by revenue successfully", async () => {
      const topMenus = [
        { menuName: "Latte", totalRevenue: 5000 },
        { menuName: "Mocha", totalRevenue: 4000 },
        { menuName: "Espresso", totalRevenue: 3000 },
      ];
      mockInsightService.FindTopMenusByRevenue.mockResolvedValue(topMenus);

      const res = mockResponse();
      await insightController.GetTopMenusByRevenue(branchPayload, res);

      expect(mockInsightService.FindTopMenusByRevenue).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        message: "Retrieved top 5 sold menus by revenue.",
        insight: {
          labels: ["Latte", "Mocha", "Espresso"],
          data: [5000, 4000, 3000],
        },
      });
    });

    it("should return 500 when service returns Error", async () => {
      mockInsightService.FindTopMenusByRevenue.mockResolvedValue(
        new Error("DB Error"),
      );

      const res = mockResponse();
      await insightController.GetTopMenusByRevenue(branchPayload, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it("should return 500 on exception", async () => {
      mockInsightService.FindTopMenusByRevenue.mockRejectedValue(
        new Error("DB Error"),
      );

      const res = mockResponse();
      await insightController.GetTopMenusByRevenue(branchPayload, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to retrieve top menus by revenue.",
      });
    });
  });

  describe("GetSalesInWeek", () => {
    const branchPayload = { branchId: 1 };

    it("should return weekly sales data", async () => {
      const now = Date.now();
      const salesData = [{ timestamp: now }, { timestamp: now - 86400000 }];
      mockInsightService.SelectSalesInWeek.mockResolvedValue(salesData);

      const res = mockResponse();
      await insightController.GetSalesInWeek(branchPayload, res);

      expect(mockInsightService.SelectSalesInWeek).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalled();
      const jsonCall = jest.mocked(res.json).mock.calls[0][0];
      expect(jsonCall.message).toBe(
        "See counts of sales for every day in this week.",
      );
      expect(jsonCall.insight).toHaveProperty("labels");
      expect(jsonCall.insight).toHaveProperty("data");
    });

    it("should return 500 when service returns Error", async () => {
      mockInsightService.SelectSalesInWeek.mockResolvedValue(
        new Error("DB Error"),
      );

      const res = mockResponse();
      await insightController.GetSalesInWeek(branchPayload, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it("should return 500 on exception", async () => {
      mockInsightService.SelectSalesInWeek.mockRejectedValue(
        new Error("DB Error"),
      );

      const res = mockResponse();
      await insightController.GetSalesInWeek(branchPayload, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to retrieve sales in this week.",
      });
    });
  });

  describe("GetSalesInMonth", () => {
    const branchPayload = { branchId: 1 };

    it("should return monthly sales data", async () => {
      const now = Date.now();
      const salesData = [{ timestamp: now }, { timestamp: now - 86400000 }];
      mockInsightService.SelectSalesInMonth.mockResolvedValue(salesData);

      const res = mockResponse();
      await insightController.GetSalesInMonth(branchPayload, res);

      expect(mockInsightService.SelectSalesInMonth).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalled();
      const jsonCall = jest.mocked(res.json).mock.calls[0][0];
      expect(jsonCall.message).toBe(
        "See counts of sales for every day in this month.",
      );
      expect(jsonCall.insight).toHaveProperty("labels");
      expect(jsonCall.insight).toHaveProperty("data");
    });

    it("should return 500 when service returns Error", async () => {
      mockInsightService.SelectSalesInMonth.mockResolvedValue(
        new Error("DB Error"),
      );

      const res = mockResponse();
      await insightController.GetSalesInMonth(branchPayload, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it("should return 500 on exception", async () => {
      mockInsightService.SelectSalesInMonth.mockRejectedValue(
        new Error("DB Error"),
      );

      const res = mockResponse();
      await insightController.GetSalesInMonth(branchPayload, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to retrieve sales in this month.",
      });
    });
  });

  describe("GetSalesInYear", () => {
    const branchPayload = { branchId: 1 };

    it("should return yearly sales data by category", async () => {
      const now = Date.now();
      const salesData = [
        {
          order: { timestamp: now },
          menu: { category: "HOT" },
        },
        {
          order: { timestamp: now - 86400000 },
          menu: { category: "ICED" },
        },
      ];
      mockInsightService.SelectSalesInYear.mockResolvedValue(salesData);

      const res = mockResponse();
      await insightController.GetSalesInYear(branchPayload, res);

      expect(mockInsightService.SelectSalesInYear).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalled();
      const jsonCall = jest.mocked(res.json).mock.calls[0][0];
      expect(jsonCall.message).toBe(
        "See counts of sales for every month in this year.",
      );
      expect(Array.isArray(jsonCall.insight)).toBe(true);
      expect(jsonCall.insight[0]).toHaveProperty("label");
      expect(jsonCall.insight[0]).toHaveProperty("data");
    });

    it("should return 500 when service returns Error", async () => {
      mockInsightService.SelectSalesInYear.mockResolvedValue(
        new Error("DB Error"),
      );

      const res = mockResponse();
      await insightController.GetSalesInYear(branchPayload, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it("should return 500 on exception", async () => {
      mockInsightService.SelectSalesInYear.mockRejectedValue(
        new Error("DB Error"),
      );

      const res = mockResponse();
      await insightController.GetSalesInYear(branchPayload, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to retrieve sales in this year.",
      });
    });
  });
});
