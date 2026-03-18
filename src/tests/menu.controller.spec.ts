import { Test, TestingModule } from "@nestjs/testing";
import { MenuController } from "../controllers/menu.controller";
import { MenuService } from "../services/menu.service";
import { Response } from "express";

describe("MenuController", () => {
  let menuController: MenuController;
  let menuService: MenuService;

  const mockMenuService = {
    GetHotMenus: jest.fn(),
    GetIcedMenus: jest.fn(),
    GetBakeryMenus: jest.fn(),
    GetSpecificMenu: jest.fn(),
    UpdateMenu: jest.fn(),
    AddMenu: jest.fn(),
  };

  const mockResponse = () => {
    const res: Partial<Response> = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    return res as Response;
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [MenuController],
      providers: [
        {
          provide: MenuService,
          useValue: mockMenuService,
        },
      ],
    }).compile();

    menuController = moduleRef.get<MenuController>(MenuController);
    menuService = moduleRef.get<MenuService>(MenuService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(menuController).toBeDefined();
  });

  describe("GetHotMenus", () => {
    it("should return hot beverages successfully", async () => {
      const mockMenus = [
        { name: "Hot Latte", price: 50, imagePath: "latte.png" },
      ];
      mockMenuService.GetHotMenus.mockResolvedValue(mockMenus);

      const res = mockResponse();
      await menuController.GetHotMenus(res);

      expect(mockMenuService.GetHotMenus).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: "Returns all available hot beverages",
        menus: mockMenus,
      });
    });

    it("should return 500 when service returns Error", async () => {
      mockMenuService.GetHotMenus.mockResolvedValue(new Error("DB Error"));

      const res = mockResponse();
      await menuController.GetHotMenus(res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to retrieve hot beverages.",
      });
    });

    it("should return 500 on exception", async () => {
      mockMenuService.GetHotMenus.mockRejectedValue(new Error("DB Error"));

      const res = mockResponse();
      await menuController.GetHotMenus(res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to retrieve hot beverages.",
      });
    });
  });

  describe("GetIcedMenus", () => {
    it("should return iced beverages successfully", async () => {
      const mockMenus = [
        { name: "Iced Mocha", price: 60, imagePath: "mocha.png" },
      ];
      mockMenuService.GetIcedMenus.mockResolvedValue(mockMenus);

      const res = mockResponse();
      await menuController.GetIcedMenus(res);

      expect(mockMenuService.GetIcedMenus).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: "Returns all available iced beverages",
        menus: mockMenus,
      });
    });

    it("should return 500 when service returns Error", async () => {
      mockMenuService.GetIcedMenus.mockResolvedValue(new Error("DB Error"));

      const res = mockResponse();
      await menuController.GetIcedMenus(res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to retrieve iced beverages.",
      });
    });
  });

  describe("GetBakeryMenus", () => {
    it("should return bakery menus successfully", async () => {
      const mockMenus = [
        { name: "Croissant", price: 40, imagePath: "croissant.png" },
      ];
      mockMenuService.GetBakeryMenus.mockResolvedValue(mockMenus);

      const res = mockResponse();
      await menuController.GetBakeryMenus(res);

      expect(mockMenuService.GetBakeryMenus).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: "Returns all available bakery menus",
        menus: mockMenus,
      });
    });

    it("should return 500 when service returns Error", async () => {
      mockMenuService.GetBakeryMenus.mockResolvedValue(new Error("DB Error"));

      const res = mockResponse();
      await menuController.GetBakeryMenus(res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to retrieve bakery.",
      });
    });
  });

  describe("GetSpecificMenu", () => {
    it("should return a specific menu successfully", async () => {
      const mockMenu = {
        name: "Hot Latte",
        price: 50,
        imagePath: "latte.png",
      };
      mockMenuService.GetSpecificMenu.mockResolvedValue(mockMenu);

      const res = mockResponse();
      await menuController.GetSpecificMenu(res, "Hot Latte");

      expect(mockMenuService.GetSpecificMenu).toHaveBeenCalledWith("Hot Latte");
      expect(res.json).toHaveBeenCalledWith({
        message: "Returns the menu: Hot Latte",
        menu: mockMenu,
      });
    });

    it("should return 404 when menu not found", async () => {
      mockMenuService.GetSpecificMenu.mockResolvedValue(null);

      const res = mockResponse();
      await menuController.GetSpecificMenu(res, "NonExistent");

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Menu: #NonExistent from the route parameter not found.",
      });
    });

    it("should return 500 when service returns Error", async () => {
      mockMenuService.GetSpecificMenu.mockResolvedValue(new Error("DB Error"));

      const res = mockResponse();
      await menuController.GetSpecificMenu(res, "Hot Latte");

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to retrieve the specific menu.",
      });
    });
  });

  describe("EditMenu", () => {
    const editMenuDto = {
      name: "Updated Latte",
      price: 55,
      category: "HOT",
    };

    it("should update menu successfully", async () => {
      const existingMenu = {
        name: "Hot Latte",
        price: 50,
        imagePath: "latte.png",
      };
      mockMenuService.GetSpecificMenu.mockResolvedValue(existingMenu);
      mockMenuService.UpdateMenu.mockResolvedValue({});

      const res = mockResponse();
      await menuController.EditMenu("Hot Latte", editMenuDto as any, res);

      expect(mockMenuService.UpdateMenu).toHaveBeenCalledWith({
        data: editMenuDto,
        where: { name: "Hot Latte" },
      });
      expect(res.json).toHaveBeenCalledWith({
        message: "The menu: #Hot Latte has been updated successfully.",
      });
    });

    it("should return 400 when no data provided", async () => {
      const res = mockResponse();
      await menuController.EditMenu("Hot Latte", null as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "No menu information provided for updating.",
      });
    });

    it("should return 404 when menu not found", async () => {
      mockMenuService.GetSpecificMenu.mockResolvedValue(null);

      const res = mockResponse();
      await menuController.EditMenu("NonExistent", editMenuDto as any, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Menu: #NonExistent from the route parameter not found.",
      });
    });

    it("should return 500 when UpdateMenu returns Error", async () => {
      mockMenuService.GetSpecificMenu.mockResolvedValue({});
      mockMenuService.UpdateMenu.mockResolvedValue(new Error("DB Error"));

      const res = mockResponse();
      await menuController.EditMenu("Hot Latte", editMenuDto as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to edit the menu information.",
      });
    });
  });
});
      mockMenuService.GetSpecificMenu.mockRejectedValue(new Error("DB Error"));

      const res = mockResponse();
      await menuController.EditMenu(BigInt(1), editMenuDto, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to edit the menu information.",
      });
    });
  });
});
