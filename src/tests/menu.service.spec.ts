import { Test, TestingModule } from "@nestjs/testing";
import { MenuService } from "../services/menu.service";
import { PrismaClient, Category } from "../../prisma/client";

describe("MenuService", () => {
  let menuService: MenuService;
  let prismaClient: PrismaClient;

  const mockPrismaClient = {
    menu: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuService,
        {
          provide: PrismaClient,
          useValue: mockPrismaClient,
        },
      ],
    }).compile();

    menuService = module.get<MenuService>(MenuService);
    prismaClient = module.get<PrismaClient>(PrismaClient);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(menuService).toBeDefined();
  });

  describe("SelectHotMenus", () => {
    it("should return hot menus successfully", async () => {
      const mockMenus = [
        { name: "Hot Latte", price: 50, imagePath: "latte.png" },
        { name: "Espresso", price: 45, imagePath: "espresso.png" },
      ];
      mockPrismaClient.menu.findMany.mockResolvedValue(mockMenus);

      const result = await menuService.SelectHotMenus();

      expect(mockPrismaClient.menu.findMany).toHaveBeenCalledWith({
        select: { name: true, price: true, imagePath: true },
        where: { category: Category.HOT },
      });
      expect(result).toEqual(mockMenus);
    });

    it("should return Error on database failure", async () => {
      mockPrismaClient.menu.findMany.mockRejectedValue(new Error("DB Error"));

      const result = await menuService.SelectHotMenus();

      expect(result).toBeInstanceOf(Error);
    });
  });

  describe("SelectIcedMenus", () => {
    it("should return iced menus successfully", async () => {
      const mockMenus = [
        { name: "Iced Mocha", price: 60, imagePath: "mocha.png" },
      ];
      mockPrismaClient.menu.findMany.mockResolvedValue(mockMenus);

      const result = await menuService.SelectIcedMenus();

      expect(mockPrismaClient.menu.findMany).toHaveBeenCalledWith({
        select: { name: true, price: true, imagePath: true },
        where: { category: Category.ICED },
      });
      expect(result).toEqual(mockMenus);
    });

    it("should return Error on database failure", async () => {
      mockPrismaClient.menu.findMany.mockRejectedValue(new Error("DB Error"));

      const result = await menuService.SelectIcedMenus();

      expect(result).toBeInstanceOf(Error);
    });
  });

  describe("SelectBakeryMenus", () => {
    it("should return bakery menus successfully", async () => {
      const mockMenus = [
        { name: "Croissant", price: 40, imagePath: "croissant.png" },
      ];
      mockPrismaClient.menu.findMany.mockResolvedValue(mockMenus);

      const result = await menuService.SelectBakeryMenus();

      expect(mockPrismaClient.menu.findMany).toHaveBeenCalledWith({
        select: { name: true, price: true, imagePath: true },
        where: { category: Category.BAKERY },
      });
      expect(result).toEqual(mockMenus);
    });

    it("should return Error on database failure", async () => {
      mockPrismaClient.menu.findMany.mockRejectedValue(new Error("DB Error"));

      const result = await menuService.SelectBakeryMenus();

      expect(result).toBeInstanceOf(Error);
    });
  });

  describe("FindSpecificMenu", () => {
    it("should return a specific menu successfully", async () => {
      const mockMenu = {
        name: "Hot Latte",
        price: 50,
        imagePath: "latte.png",
        category: Category.HOT,
      };
      mockPrismaClient.menu.findUnique.mockResolvedValue(mockMenu);

      const result = await menuService.FindSpecificMenu("Hot Latte");

      expect(mockPrismaClient.menu.findUnique).toHaveBeenCalledWith({
        select: { name: true, price: true, imagePath: true },
        where: { name: "Hot Latte" },
      });
      expect(result).toEqual(mockMenu);
    });

    it("should return null when menu not found", async () => {
      mockPrismaClient.menu.findUnique.mockResolvedValue(null);

      const result = await menuService.FindSpecificMenu("NonExistent");

      expect(result).toBeNull();
    });

    it("should return Error on database failure", async () => {
      mockPrismaClient.menu.findUnique.mockRejectedValue(new Error("DB Error"));

      const result = await menuService.FindSpecificMenu("Hot Latte");

      expect(result).toBeInstanceOf(Error);
    });
  });

  describe("UpdateMenu", () => {
    it("should update menu successfully", async () => {
      const updateData = { price: 55 };
      mockPrismaClient.menu.update.mockResolvedValue({});

      const result = await menuService.UpdateMenu({
        data: updateData,
        where: { name: "Hot Latte" },
      });

      expect(mockPrismaClient.menu.update).toHaveBeenCalledWith({
        data: updateData,
        where: { name: "Hot Latte" },
      });
      expect(result).toBeUndefined();
    });

    it("should return Error on database failure", async () => {
      mockPrismaClient.menu.update.mockRejectedValue(new Error("DB Error"));

      const result = await menuService.UpdateMenu({
        data: { price: 55 },
        where: { name: "Hot Latte" },
      });

      expect(result).toBeInstanceOf(Error);
    });
  });
});
