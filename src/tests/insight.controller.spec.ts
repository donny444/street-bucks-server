import { Test, TestingModule } from "@nestjs/testing";
import { InsightController } from "../controllers/insight.controller";
import { InsightService } from "../services/insight.service";
import { Response } from "express";

describe("InsightController", () => {
  let insightController: InsightController;
  let insightService: InsightService;

  const mockInsightService = {
    GetSalesToday: jest.fn(),
    GetSalesThisWeek: jest.fn(),
    GetSalesThisMonth: jest.fn(),
    GetTopMenusByQuantity: jest.fn(),
    GetTopMenusByRevenue: jest.fn(),
    GetSalesInWeek: jest.fn(),
    GetSalesInMonth: jest.fn(),
    GetSalesInYear: jest.fn(),
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
    const branchPayload = JSON.stringify({ branchId: 1 });

    it("should return today's sales count", async () => {
      mockInsightService.GetSalesToday.mockResolvedValue(15);

      const res = mockResponse();
      await insightController.GetSalesToday(branchPayload, res);

      expect(mockInsightService.GetSalesToday).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        message: "See today's menu sales.",
        insight: 15,
      });
    });

    it("should return 500 when service returns Error", async () => {
      mockInsightService.GetSalesToday.mockResolvedValue(new Error("DB Error"));

      const res = mockResponse();
      await insightController.GetSalesToday(branchPayload, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "DB Error",
      });
    });

    it("should return 500 on exception", async () => {
      mockInsightService.GetSalesToday.mockRejectedValue(new Error("DB Error"));

      const res = mockResponse();
      await insightController.GetSalesToday(branchPayload, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to retrieve today's sales.",
      });
    });
  });

  describe("GetSalesThisWeek", () => {
    const branchPayload = JSON.stringify({ branchId: 1 });

    it("should return this week's sales count", async () => {
      mockInsightService.GetSalesThisWeek.mockResolvedValue(75);

      const res = mockResponse();
      await insightController.GetSalesThisWeek(branchPayload, res);

      expect(mockInsightService.GetSalesThisWeek).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        message: "See this week's menu sales.",
        insight: 75,
      });
    });

    it("should return 500 when service returns Error", async () => {
      mockInsightService.GetSalesThisWeek.mockResolvedValue(
        new Error("DB Error")
      );

      const res = mockResponse();
      await insightController.GetSalesThisWeek(branchPayload, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it("should return 500 on exception", async () => {
      mockInsightService.GetSalesThisWeek.mockRejectedValue(
        new Error("DB Error")
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
    const branchPayload = JSON.stringify({ branchId: 1 });

    it("should return this month's sales count", async () => {
      mockInsightService.GetSalesThisMonth.mockResolvedValue(200);

      const res = mockResponse();
      await insightController.GetSalesThisMonth(branchPayload, res);

      expect(mockInsightService.GetSalesThisMonth).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        message: "See this month's menu sales.",
        insight: 200,
      });
    });

    it("should return 500 when service returns Error", async () => {
      mockInsightService.GetSalesThisMonth.mockResolvedValue(
        new Error("DB Error")
      );

      const res = mockResponse();
      await insightController.GetSalesThisMonth(branchPayload, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it("should return 500 on exception", async () => {
      mockInsightService.GetSalesThisMonth.mockRejectedValue(
        new Error("DB Error")
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
    const branchPayload = JSON.stringify({ branchId: 1 });

    it("should return top 5 menus by quantity successfully", async () => {
      const topMenus = [
        { menuName: "Latte", totalQuantity: 50 },
        { menuName: "Mocha", totalQuantity: 40 },
        { menuName: "Espresso", totalQuantity: 30 },
      ];
      mockInsightService.GetTopMenusByQuantity.mockResolvedValue(topMenus);

      const res = mockResponse();
      await insightController.GetTopMenusByQuantity(branchPayload, res);

      expect(mockInsightService.GetTopMenusByQuantity).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        message: "Retrieved top 5 sold menus by quantity.",
        insight: {
          labels: ["Latte", "Mocha", "Espresso"],
          data: [50, 40, 30],
        },
      });
    });

    it("should return 500 when service returns Error", async () => {
      mockInsightService.GetTopMenusByQuantity.mockResolvedValue(
        new Error("DB Error")
      );

      const res = mockResponse();
      await insightController.GetTopMenusByQuantity(branchPayload, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it("should return 500 on exception", async () => {
      mockInsightService.GetTopMenusByQuantity.mockRejectedValue(
        new Error("DB Error")
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
    const branchPayload = JSON.stringify({ branchId: 1 });

    it("should return top 5 menus by revenue successfully", async () => {
      const topMenus = [
        { menuName: "Latte", totalRevenue: 5000 },
        { menuName: "Mocha", totalRevenue: 4000 },
        { menuName: "Espresso", totalRevenue: 3000 },
      ];
      mockInsightService.GetTopMenusByRevenue.mockResolvedValue(topMenus);

      const res = mockResponse();
      await insightController.GetTopMenusByRevenue(branchPayload, res);

      expect(mockInsightService.GetTopMenusByRevenue).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        message: "Retrieved top 5 sold menus by revenue.",
        insight: {
          labels: ["Latte", "Mocha", "Espresso"],
          data: [5000, 4000, 3000],
        },
      });
    });

    it("should return 500 when service returns Error", async () => {
      mockInsightService.GetTopMenusByRevenue.mockResolvedValue(
        new Error("DB Error")
      );

      const res = mockResponse();
      await insightController.GetTopMenusByRevenue(branchPayload, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it("should return 500 on exception", async () => {
      mockInsightService.GetTopMenusByRevenue.mockRejectedValue(
        new Error("DB Error")
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
    const branchPayload = JSON.stringify({ branchId: 1 });

    it("should return weekly sales data", async () => {
      const now = Date.now();
      const salesData = [
        { timestamp: now },
        { timestamp: now - 86400000 },
      ];
      mockInsightService.GetSalesInWeek.mockResolvedValue(salesData);

      const res = mockResponse();
      await insightController.GetSalesInWeek(branchPayload, res);

      expect(mockInsightService.GetSalesInWeek).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalled();
      const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.message).toBe(
        "See counts of sales for every day in this week."
      );
      expect(jsonCall.insight).toHaveProperty("labels");
      expect(jsonCall.insight).toHaveProperty("data");
    });

    it("should return 500 when service returns Error", async () => {
      mockInsightService.GetSalesInWeek.mockResolvedValue(
        new Error("DB Error")
      );

      const res = mockResponse();
      await insightController.GetSalesInWeek(branchPayload, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it("should return 500 on exception", async () => {
      mockInsightService.GetSalesInWeek.mockRejectedValue(
        new Error("DB Error")
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
    const branchPayload = JSON.stringify({ branchId: 1 });

    it("should return monthly sales data", async () => {
      const now = Date.now();
      const salesData = [
        { timestamp: now },
        { timestamp: now - 86400000 },
      ];
      mockInsightService.GetSalesInMonth.mockResolvedValue(salesData);

      const res = mockResponse();
      await insightController.GetSalesInMonth(branchPayload, res);

      expect(mockInsightService.GetSalesInMonth).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalled();
      const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.message).toBe(
        "See counts of sales for every day in this month."
      );
      expect(jsonCall.insight).toHaveProperty("labels");
      expect(jsonCall.insight).toHaveProperty("data");
    });

    it("should return 500 when service returns Error", async () => {
      mockInsightService.GetSalesInMonth.mockResolvedValue(
        new Error("DB Error")
      );

      const res = mockResponse();
      await insightController.GetSalesInMonth(branchPayload, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it("should return 500 on exception", async () => {
      mockInsightService.GetSalesInMonth.mockRejectedValue(
        new Error("DB Error")
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
    const branchPayload = JSON.stringify({ branchId: 1 });

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
      mockInsightService.GetSalesInYear.mockResolvedValue(salesData);

      const res = mockResponse();
      await insightController.GetSalesInYear(branchPayload, res);

      expect(mockInsightService.GetSalesInYear).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalled();
      const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.message).toBe(
        "See counts of sales by category for this year."
      );
      expect(jsonCall.insight).toHaveProperty("labels");
      expect(jsonCall.insight).toHaveProperty("data");
    });

    it("should return 500 when service returns Error", async () => {
      mockInsightService.GetSalesInYear.mockResolvedValue(
        new Error("DB Error")
      );

      const res = mockResponse();
      await insightController.GetSalesInYear(branchPayload, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it("should return 500 on exception", async () => {
      mockInsightService.GetSalesInYear.mockRejectedValue(
        new Error("DB Error")
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
