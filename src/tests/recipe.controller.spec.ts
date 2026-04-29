import { Test, TestingModule } from "@nestjs/testing";
import { RecipeController } from "../controllers/recipe.controller";
import { RecipeService } from "../services/recipe.service";
import { Response } from "express";
import { AddRecipeDto } from "../dtos/recipe.dto";

describe("RecipeController", () => {
  let recipeController: RecipeController;
  let recipeService: RecipeService;

  const mockRecipeService = {
    CheckRecipeExists: jest.fn(),
    InsertRecipe: jest.fn(),
    CreateRecipeImage: jest.fn(),
  };

  const mockResponse = () => {
    const res: Partial<Response> = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    return res as Response;
  };

  const mockFile = (
    overrides: Partial<Express.Multer.File> = {},
  ): Express.Multer.File => ({
    fieldname: "file",
    originalname: "recipe.png",
    encoding: "7bit",
    mimetype: "image/png",
    size: 1024,
    destination: "uploads/",
    filename: "recipe-12345.png",
    path: "uploads/recipe-12345.png",
    buffer: Buffer.from([]),
    stream: null as any,
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecipeController],
      providers: [
        {
          provide: RecipeService,
          useValue: mockRecipeService,
        },
      ],
    }).compile();

    recipeController = module.get<RecipeController>(RecipeController);
    recipeService = module.get<RecipeService>(RecipeService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(recipeController).toBeDefined();
  });

  describe("AddRecipe", () => {
    const addRecipeDto: AddRecipeDto = {
      name: "Espresso",
      unit: "ml",
      file: {} as File,
      editor: { email: "admin@test.com", password: "pw" },
    };

    it("should add a new recipe successfully", async () => {
      const file = mockFile();
      mockRecipeService.CheckRecipeExists.mockResolvedValue(false);
      mockRecipeService.InsertRecipe.mockResolvedValue(undefined);
      mockRecipeService.CreateRecipeImage.mockResolvedValue(undefined);

      const res = mockResponse();
      await recipeController.AddRecipe(addRecipeDto, file, res);

      expect(mockRecipeService.CheckRecipeExists).toHaveBeenCalledWith(
        "Espresso",
      );
      expect(mockRecipeService.InsertRecipe).toHaveBeenCalledWith({
        name: "Espresso",
        unit: "ml",
        imagePath: "espresso.png",
      });
      expect(mockRecipeService.CreateRecipeImage).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "New recipe has been added.",
      });
    });

    it("should return 400 when required fields are missing", async () => {
      const file = mockFile();
      const incompleteDto = { name: "", unit: "" } as AddRecipeDto;

      const res = mockResponse();
      await recipeController.AddRecipe(incompleteDto, file, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Missing required recipe information: name and unit.",
      });
    });

    it("should return 409 when recipe already exists", async () => {
      const file = mockFile();
      mockRecipeService.CheckRecipeExists.mockResolvedValue(true);

      const res = mockResponse();
      await recipeController.AddRecipe(addRecipeDto, file, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: "Recipe with the name provided already exists.",
      });
    });

    it("should return 400 when file is missing", async () => {
      mockRecipeService.CheckRecipeExists.mockResolvedValue(false);

      const res = mockResponse();
      await recipeController.AddRecipe(addRecipeDto, undefined as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Recipe image file is required.",
      });
    });

    it("should return 500 when CheckRecipeExists returns Error", async () => {
      const file = mockFile();
      mockRecipeService.CheckRecipeExists.mockResolvedValue(
        new Error("DB Error"),
      );

      const res = mockResponse();
      await recipeController.AddRecipe(addRecipeDto, file, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to check recipe existence.",
      });
    });

    it("should return 500 when InsertRecipe returns Error", async () => {
      const file = mockFile();
      mockRecipeService.CheckRecipeExists.mockResolvedValue(false);
      mockRecipeService.InsertRecipe.mockResolvedValue(
        new Error("Insert failed"),
      );

      const res = mockResponse();
      await recipeController.AddRecipe(addRecipeDto, file, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to insert a new recipe",
      });
    });

    it("should return 500 on unexpected exception", async () => {
      const file = mockFile();
      mockRecipeService.CheckRecipeExists.mockRejectedValue(
        new Error("Unexpected error"),
      );

      const res = mockResponse();
      await recipeController.AddRecipe(addRecipeDto, file, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to add a new recipe.",
      });
    });
  });
});
