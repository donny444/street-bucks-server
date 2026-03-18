import { Test, TestingModule } from "@nestjs/testing";
import { OrderService } from "../services/order.service";
import { PrismaClient } from "../../prisma/client";

describe("OrderService", () => {
  let orderService: OrderService;
  let prismaClient: PrismaClient;

  const mockPrismaClient = {
    $transaction: jest.fn(),
    order: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    menu: {
      findMany: jest.fn(),
    },
    entry: {
      createMany: jest.fn(),
    },
    ingredient: {
      findMany: jest.fn(),
    },
    stock: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: PrismaClient,
          useValue: mockPrismaClient,
        },
      ],
    }).compile();

    orderService = module.get<OrderService>(OrderService);
    prismaClient = module.get<PrismaClient>(PrismaClient);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(orderService).toBeDefined();
  });

  describe("InsertOrder", () => {
    const orderedMenus = [
      { menuId: "Hot Latte", quantity: 2 },
      { menuId: "Iced Mocha", quantity: 1 },
    ];
    const branchId = 1;

    it("should create an order successfully", async () => {
      const mockOrder = {
        uuid: "order-uuid-123",
        timestamp: BigInt(Date.now()),
        totalPrice: 160,
        branchId: BigInt(1),
      };

      mockPrismaClient.$transaction.mockImplementation(async (callback) => {
        const mockPrismaTx = {
          menu: {
            findMany: jest.fn().mockResolvedValue([
              { name: "Hot Latte", price: 50 },
              { name: "Iced Mocha", price: 60 },
            ]),
          },
          ingredient: {
            findMany: jest.fn().mockResolvedValue([]),
          },
          stock: {
            findMany: jest.fn().mockResolvedValue([]),
          },
          order: {
            create: jest.fn().mockResolvedValue(mockOrder),
          },
          entry: {
            createMany: jest.fn().mockResolvedValue({ count: 2 }),
          },
        };
        return callback(mockPrismaTx);
      });

      const result = await orderService.InsertOrder(orderedMenus, branchId);

      expect(mockPrismaClient.$transaction).toHaveBeenCalled();
      expect(result).toEqual(mockOrder);
    });

    it("should return Error when transaction fails", async () => {
      mockPrismaClient.$transaction.mockRejectedValue(new Error("Transaction failed"));

      const result = await orderService.InsertOrder(orderedMenus, branchId);

      expect(result).toBeInstanceOf(Error);
    });

    it("should return Error when stock is insufficient", async () => {
      mockPrismaClient.$transaction.mockImplementation(async (callback) => {
        const mockPrismaTx = {
          menu: {
            findMany: jest.fn().mockResolvedValue([
              { name: "Hot Latte", price: 50 },
            ]),
          },
          ingredient: {
            findMany: jest.fn().mockResolvedValue([
              { menuId: "Hot Latte", recipeId: "coffee", amount: 10 },
            ]),
          },
          stock: {
            findMany: jest.fn().mockResolvedValue([
              { recipeId: "coffee", quantity: 5 },
            ]),
          },
        };
        return callback(mockPrismaTx);
      });

      const result = await orderService.InsertOrder(
        [{ menuId: "Hot Latte", quantity: 2 }],
        branchId
      );

      expect(result).toBeInstanceOf(Error);
    });
  });

  describe("GetTodayOrders", () => {
    it("should return today's orders successfully", async () => {
      const mockOrders = [
        { uuid: "order-1", timestamp: BigInt(Date.now()), totalPrice: 100 },
        { uuid: "order-2", timestamp: BigInt(Date.now()), totalPrice: 150 },
      ];
      mockPrismaClient.order.findMany.mockResolvedValue(mockOrders);

      const result = await orderService.GetTodayOrders(1);

      expect(mockPrismaClient.order.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it("should return Error on database failure", async () => {
      mockPrismaClient.order.findMany.mockRejectedValue(new Error("DB Error"));

      const result = await orderService.GetTodayOrders(1);

      expect(result).toBeInstanceOf(Error);
    });
  });

  describe("GetSpecificOrder", () => {
    it("should return a specific order successfully", async () => {
      const mockOrder = {
        uuid: "order-uuid-123",
        totalPrice: 150,
        Entry: [{ menuId: "Hot Latte", quantity: 2 }],
      };
      mockPrismaClient.order.findUnique.mockResolvedValue(mockOrder);

      const result = await orderService.GetSpecificOrder({
        uuid: "order-uuid-123",
        branchId: BigInt(1),
      });

      expect(mockPrismaClient.order.findUnique).toHaveBeenCalled();
      expect(result).toEqual(mockOrder);
    });

    it("should return null when order not found", async () => {
      mockPrismaClient.order.findUnique.mockResolvedValue(null);

      const result = await orderService.GetSpecificOrder({
        uuid: "nonexistent",
        branchId: BigInt(1),
      });

      expect(result).toBeNull();
    });

    it("should return Error on database failure", async () => {
      mockPrismaClient.order.findUnique.mockRejectedValue(new Error("DB Error"));

      const result = await orderService.GetSpecificOrder({
        uuid: "order-uuid-123",
        branchId: BigInt(1),
      });

      expect(result).toBeInstanceOf(Error);
    });
  });
});
