import { Test, TestingModule } from "@nestjs/testing";
import { OrderController } from "../controllers/order.controller";
import { OrderService } from "../services/order.service";
import { Response, Request } from "express";

describe("OrderController", () => {
  let orderController: OrderController;
  let orderService: OrderService;

  const mockOrderService = {
    InsertOrder: jest.fn(),
    SelectTodayOrders: jest.fn(),
    FindOrderDetails: jest.fn(),
    GenerateReceipt: jest.fn(),
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
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    orderController = module.get<OrderController>(OrderController);
    orderService = module.get<OrderService>(OrderService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(orderController).toBeDefined();
  });

  describe("MakeOrder", () => {
    const branchPayload = { branchId: 1 };
    const cartItems = [
      { menuId: "Hot Latte", quantity: 2 },
      { menuId: "Iced Mocha", quantity: 1 },
    ];

    it("should create an order successfully", async () => {
      const mockOrder = {
        uuid: "order-uuid-123",
        timestamp: BigInt(Date.now()),
        totalPrice: 150,
      };
      const mockOrderDetails = {
        uuid: "order-uuid-123",
        timestamp: Date.now(),
        totalPrice: 150,
        entry: [{ quantity: 1, menu: { name: "Hot Latte", price: 50 } }],
      };
      mockOrderService.InsertOrder.mockResolvedValue(mockOrder);
      mockOrderService.FindOrderDetails.mockResolvedValue(mockOrderDetails);
      mockOrderService.GenerateReceipt.mockResolvedValue("receipt.pdf");

      const res = mockResponse();
      await orderController.MakeOrder(branchPayload, cartItems, res);

      expect(mockOrderService.InsertOrder).toHaveBeenCalledWith(cartItems, 1);
      expect(mockOrderService.FindOrderDetails).toHaveBeenCalledWith({
        uuid: "order-uuid-123",
        branchId: BigInt(1),
      });
      expect(res.json).toHaveBeenCalledWith({
        message: "The order has been made with menu(s) in cart.",
        order_id: "order-uuid-123",
      });
    });

    it("should return 500 when InsertOrder returns Error", async () => {
      mockOrderService.InsertOrder.mockResolvedValue(
        new Error("Insert failed"),
      );

      const res = mockResponse();
      await orderController.MakeOrder(branchPayload, cartItems, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Insert failed" });
    });

    it("should return 500 when order details retrieval fails", async () => {
      mockOrderService.InsertOrder.mockResolvedValue({
        uuid: "order-uuid-123",
        timestamp: BigInt(Date.now()),
      });
      mockOrderService.FindOrderDetails.mockResolvedValue(null);

      const res = mockResponse();
      await orderController.MakeOrder(branchPayload, cartItems, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to retrieve the order details.",
      });
    });

    it("should return 500 on exception", async () => {
      mockOrderService.InsertOrder.mockRejectedValue(new Error("DB Error"));

      const res = mockResponse();
      await orderController.MakeOrder(branchPayload, cartItems, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to make an order.",
      });
    });
  });

  describe("GetTodayOrders", () => {
    const branchPayload = { branchId: 1 };

    it("should return today's orders successfully", async () => {
      const mockOrders = [
        { uuid: "order-1", timestamp: 1234567890, totalPrice: 100 },
        { uuid: "order-2", timestamp: 1234567891, totalPrice: 150 },
      ];
      mockOrderService.SelectTodayOrders.mockResolvedValue(mockOrders);

      const res = mockResponse();
      await orderController.GetTodayOrders(branchPayload, res);

      expect(mockOrderService.SelectTodayOrders).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        message: "Get orders in current day.",
        today_orders: mockOrders,
      });
    });

    it("should return 500 when service returns Error", async () => {
      mockOrderService.SelectTodayOrders.mockResolvedValue(
        new Error("DB Error"),
      );

      const res = mockResponse();
      await orderController.GetTodayOrders(branchPayload, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "DB Error",
      });
    });

    it("should return 500 on exception", async () => {
      mockOrderService.SelectTodayOrders.mockRejectedValue(
        new Error("DB Error"),
      );

      const res = mockResponse();
      await orderController.GetTodayOrders(branchPayload, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch today orders.",
      });
    });
  });

  describe("GetOrderDetails", () => {
    const branchPayload = { branchId: 1 };

    it("should return a specific order successfully", async () => {
      const mockOrder = {
        uuid: "order-uuid-123",
        totalPrice: 150,
        Entry: [{ menuName: "Hot Latte", quantity: 2 }],
      };
      mockOrderService.FindOrderDetails.mockResolvedValue(mockOrder);

      const res = mockResponse();
      await orderController.GetOrderDetails(
        branchPayload,
        "order-uuid-123",
        res,
      );

      expect(mockOrderService.FindOrderDetails).toHaveBeenCalledWith({
        uuid: "order-uuid-123",
        branchId: 1,
      });
      expect(res.json).toHaveBeenCalledWith({
        message: "Inspect the order: order-uuid-123",
        order: mockOrder,
      });
    });

    it("should return 500 when service returns Error", async () => {
      mockOrderService.FindOrderDetails.mockResolvedValue(
        new Error("DB Error"),
      );

      const res = mockResponse();
      await orderController.GetOrderDetails(
        branchPayload,
        "order-uuid-123",
        res,
      );

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "DB Error",
      });
    });

    it("should return 500 on exception", async () => {
      mockOrderService.FindOrderDetails.mockRejectedValue(
        new Error("DB Error"),
      );

      const res = mockResponse();
      await orderController.GetOrderDetails(
        branchPayload,
        "order-uuid-123",
        res,
      );

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch specific order.",
      });
    });
  });
});
