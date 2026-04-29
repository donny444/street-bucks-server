import { Test, TestingModule } from "@nestjs/testing";
import { MenuController } from "../controllers/menu.controller";
import { MenuService } from "../services/menu.service";
import { Response } from "express";

describe("MenuController", () => {
  let menuController: MenuController;

  const mockMenuService = {
    SelectHotMenus: jest.fn(),
    SelectIcedMenus: jest.fn(),
    SelectBakeryMenus: jest.fn(),
    FindSpecificMenu: jest.fn(),
    UpdateMenu: jest.fn(),
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
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(menuController).toBeDefined();
  });

  describe("GetHotMenus", () => {
    it("should return hot beverages successfully", async () => {
      const mockMenus = [{ name: "Hot Latte", price: 50, imagePath: "latte.png" }];
      mockMenuService.SelectHotMenus.mockResolvedValue(mockMenus);

      const res = mockResponse();
      await menuController.GetHotMenus(res);

      expect(mockMenuService.SelectHotMenus).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: "Returned all available hot beverages",
        menus: mockMenus,
      });
    });
  });

  describe("GetIcedMenus", () => {
    it("should return iced beverages successfully", async () => {
      const mockMenus = [{ name: "Iced Mocha", price: 60, imagePath: "mocha.png" }];
      mockMenuService.SelectIcedMenus.mockResolvedValue(mockMenus);

      const res = mockResponse();
      await menuController.GetIcedMenus(res);

      expect(mockMenuService.SelectIcedMenus).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: "Returned all available iced beverages",
        menus: mockMenus,
      });
    });
  });

  describe("GetBakeryMenus", () => {
    it("should return bakery menus successfully", async () => {
      const mockMenus = [{ name: "Croissant", price: 40, imagePath: "croissant.png" }];
      mockMenuService.SelectBakeryMenus.mockResolvedValue(mockMenus);

      const res = mockResponse();
      await menuController.GetBakeryMenus(res);

      expect(mockMenuService.SelectBakeryMenus).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: "Returned all available bakery menus",
        menus: mockMenus,
      });
    });
  });

  describe("GetSpecificMenu", () => {
    it("should return a specific menu successfully", async () => {
      const mockMenu = { name: "Hot Latte", price: 50, imagePath: "latte.png" };
      mockMenuService.FindSpecificMenu.mockResolvedValue(mockMenu);

      const res = mockResponse();
      await menuController.GetSpecificMenu(res, "Hot Latte");

      expect(mockMenuService.FindSpecificMenu).toHaveBeenCalledWith("Hot Latte");
      expect(res.json).toHaveBeenCalledWith({
        message: "Returned the menu: Hot Latte",
        menu: mockMenu,
      });
    });

    it("should return 404 when menu not found", async () => {
      mockMenuService.FindSpecificMenu.mockResolvedValue(null);

      const res = mockResponse();
      await menuController.GetSpecificMenu(res, "NonExistent");

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Menu name from the route parameter not found.",
      });
    });
  });

  describe("EditMenu", () => {
    const editMenuDto = {
      name: "Updated Latte",
      price: 55,
      category: "HOT",
      file: null,
      editor: { email: "admin@test.com", password: "pw" },
    } as any;

    it("should update menu successfully", async () => {
      mockMenuService.FindSpecificMenu.mockResolvedValue({
        name: "Hot Latte",
        price: 50,
        imagePath: "latte.png",
      });
      mockMenuService.UpdateMenu.mockResolvedValue(undefined);

      const res = mockResponse();
      await menuController.EditMenu("Hot Latte", editMenuDto, res);

      expect(mockMenuService.UpdateMenu).toHaveBeenCalledWith({
        data: editMenuDto,
        where: { name: "Hot Latte" },
      });
      expect(res.json).toHaveBeenCalledWith({
        message: "The menu has been updated successfully.",
      });
    });
  });
});
