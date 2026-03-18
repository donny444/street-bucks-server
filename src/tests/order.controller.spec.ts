import { Test, TestingModule } from "@nestjs/testing";
import { OrderController } from "../controllers/order.controller";
import { OrderService } from "../services/order.service";
import { Response, Request } from "express";

describe("OrderController", () => {
  let orderController: OrderController;
  let orderService: OrderService;

  const mockOrderService = {
    InsertOrder: jest.fn(),
    GetTodayOrders: jest.fn(),
    GetSpecificOrder: jest.fn(),
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
    const branchPayload = JSON.stringify({ branchId: 1 });
    const cartItems = [
      { menuName: "Hot Latte", quantity: 2 },
      { menuName: "Iced Mocha", quantity: 1 },
    ];

    it("should create an order and generate receipt successfully", async () => {
      const mockOrder = {
        uuid: "order-uuid-123",
        timestamp: BigInt(Date.now()),
        totalPrice: 150,
      };
      const mockReceipt = "Receipt content here...";
      mockOrderService.InsertOrder.mockResolvedValue(mockOrder);
      mockOrderService.GenerateReceipt.mockResolvedValue(mockReceipt);

      const res = mockResponse();
      await orderController.MakeOrder(branchPayload, cartItems, res);

      expect(mockOrderService.InsertOrder).toHaveBeenCalledWith(cartItems, 1);
      expect(mockOrderService.GenerateReceipt).toHaveBeenCalledWith(
        "order-uuid-123"
      );
      expect(res.json).toHaveBeenCalledWith({
        message: "The order has been made with menu(s) in cart.",
        order_id: "order-uuid-123",
        receipt: mockReceipt,
      });
    });

    it("should return 500 when InsertOrder returns Error", async () => {
      mockOrderService.InsertOrder.mockResolvedValue(new Error("Insert failed"));

      const res = mockResponse();
      await orderController.MakeOrder(branchPayload, cartItems, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to make an order.",
      });
    });

    it("should return 500 when order creation fails", async () => {
      mockOrderService.InsertOrder.mockResolvedValue(null);

      const res = mockResponse();
      await orderController.MakeOrder(branchPayload, cartItems, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to make an order.",
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
    const branchPayload = JSON.stringify({ branchId: 1 });

    it("should return today's orders successfully", async () => {
      const mockOrders = [
        { uuid: "order-1", timestamp: 1234567890, totalPrice: 100 },
        { uuid: "order-2", timestamp: 1234567891, totalPrice: 150 },
      ];
      mockOrderService.GetTodayOrders.mockResolvedValue(mockOrders);

      const res = mockResponse();
      await orderController.GetTodayOrders(branchPayload, res);

      expect(mockOrderService.GetTodayOrders).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        message: "Get orders in current day.",
        today_orders: mockOrders,
      });
    });

    it("should return 500 when service returns Error", async () => {
      mockOrderService.GetTodayOrders.mockResolvedValue(new Error("DB Error"));

      const res = mockResponse();
      await orderController.GetTodayOrders(branchPayload, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to retrieve today's orders.",
      });
    });

    it("should return 500 on exception", async () => {
      mockOrderService.GetTodayOrders.mockRejectedValue(new Error("DB Error"));

      const res = mockResponse();
      await orderController.GetTodayOrders(branchPayload, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to retrieve today's orders.",
      });
    });
  });

  describe("GetSpecificOrder", () => {
    const branchPayload = JSON.stringify({ branchId: 1 });

    it("should return a specific order successfully", async () => {
      const mockOrder = {
        uuid: "order-uuid-123",
        totalPrice: 150,
        Entry: [{ menuName: "Hot Latte", quantity: 2 }],
      };
      mockOrderService.GetSpecificOrder.mockResolvedValue(mockOrder);

      const res = mockResponse();
      await orderController.GetSpecificOrder(branchPayload, "order-uuid-123", res);

      expect(mockOrderService.GetSpecificOrder).toHaveBeenCalledWith({
        uuid: "order-uuid-123",
        branchId: BigInt(1),
      });
      expect(res.json).toHaveBeenCalledWith({
        message: "Inspect the order: order-uuid-123",
        order: mockOrder,
      });
    });

    it("should return 404 when order not found", async () => {
      mockOrderService.GetSpecificOrder.mockResolvedValue(null);

      const res = mockResponse();
      await orderController.GetSpecificOrder(branchPayload, "nonexistent-uuid", res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Order not found.",
      });
    });

    it("should return 400 when uuid is missing", async () => {
      const res = mockResponse();
      await orderController.GetSpecificOrder(branchPayload, undefined as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Order UUID is required.",
      });
    });

    it("should return 500 when service returns Error", async () => {
      mockOrderService.GetSpecificOrder.mockResolvedValue(
        new Error("DB Error")
      );

      const res = mockResponse();
      await orderController.GetSpecificOrder(branchPayload, "order-uuid-123", res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to retrieve the specific order.",
      });
    });

    it("should return 500 on exception", async () => {
      mockOrderService.GetSpecificOrder.mockRejectedValue(new Error("DB Error"));

      const res = mockResponse();
      await orderController.GetSpecificOrder(branchPayload, "order-uuid-123", res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to retrieve the specific order.",
      });
    });
  });
});
