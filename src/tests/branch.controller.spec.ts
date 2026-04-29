import { Test, TestingModule } from "@nestjs/testing";
import { BranchController } from "../controllers/branch.controller";
import { BranchService } from "../services/branch.service";
import { Response } from "express";
import * as bcrypt from "bcryptjs";
import * as jsonwebtoken from "jsonwebtoken";

jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("BranchController", () => {
  let branchController: BranchController;
  let branchService: BranchService;

  const mockBranchService = {
    FindBranch: jest.fn(),
    InsertBranch: jest.fn(),
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
      controllers: [BranchController],
      providers: [
        {
          provide: BranchService,
          useValue: mockBranchService,
        },
      ],
    }).compile();

    branchController = module.get<BranchController>(BranchController);
    branchService = module.get<BranchService>(BranchService);

    jest.clearAllMocks();
    process.env.BRANCH_JWT_SECRET = "test-secret";
  });

  afterEach(() => {
    delete process.env.BRANCH_JWT_SECRET;
  });

  it("should be defined", () => {
    expect(branchController).toBeDefined();
  });

  describe("SignInBranch", () => {
    const signInData = { branchId: 1, password: "branchpassword" };

    it("should sign in branch successfully", async () => {
      const mockBranch = { id: BigInt(1), password: "hashedpassword" };
      mockBranchService.FindBranch.mockResolvedValue(mockBranch);
      jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
      jest
        .mocked(jsonwebtoken.sign)
        .mockReturnValue("mock-jwt-token" as never);

      const res = mockResponse();
      await branchController.SignInBranch(signInData, res);

      expect(mockBranchService.FindBranch).toHaveBeenCalledWith({ id: 1 });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "branchpassword",
        "hashedpassword"
      );
      expect(res.json).toHaveBeenCalledWith({
        message: "Branch signed in successfully.",
        token: "mock-jwt-token",
      });
    });

    it("should return 400 if branchId or password missing", async () => {
      const res = mockResponse();
      await branchController.SignInBranch({ branchId: 1, password: "" }, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Branch ID and password are required.",
      });
    });

    it("should return 404 if branch not found", async () => {
      mockBranchService.FindBranch.mockResolvedValue(null);

      const res = mockResponse();
      await branchController.SignInBranch(signInData, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "No branch exists with the provided ID",
      });
    });

    it("should return 500 if FindBranch returns an error", async () => {
      mockBranchService.FindBranch.mockResolvedValue(new Error("DB Error"));

      const res = mockResponse();
      await branchController.SignInBranch(signInData, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "DB Error",
      });
    });

    it("should return 401 if password is incorrect", async () => {
      const mockBranch = { id: BigInt(1), password: "hashedpassword" };
      mockBranchService.FindBranch.mockResolvedValue(mockBranch);
      jest.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const res = mockResponse();
      await branchController.SignInBranch(signInData, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Incorrect password for the provided one.",
      });
    });

    it("should return 500 if JWT secret is missing", async () => {
      delete process.env.BRANCH_JWT_SECRET;
      const mockBranch = { id: BigInt(1), password: "hashedpassword" };
      mockBranchService.FindBranch.mockResolvedValue(mockBranch);
      jest.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const res = mockResponse();
      await branchController.SignInBranch(signInData, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error signing in a branch.",
      });
    });

    it("should return 500 on error", async () => {
      mockBranchService.FindBranch.mockRejectedValue(new Error("DB Error"));

      const res = mockResponse();
      await branchController.SignInBranch(signInData, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to sign in to a branch.",
      });
    });
  });

  describe("CreateBranch", () => {
    const createBranchData = { password: "newbranchpassword" };

    it("should create branch successfully", async () => {
      const mockNewBranch = { id: BigInt(5), password: "hashedpassword" };
      jest.mocked(bcrypt.hash).mockResolvedValue("hashedpassword" as never);
      mockBranchService.InsertBranch.mockResolvedValue(mockNewBranch);

      const res = mockResponse();
      await branchController.CreateBranch(createBranchData, res);

      expect(bcrypt.hash).toHaveBeenCalledWith("newbranchpassword", 10);
      expect(mockBranchService.InsertBranch).toHaveBeenCalledWith({
        password: "hashedpassword",
      });
      // Note: @HttpCode(201) decorator handles the status code, not res.status()
      expect(res.json).toHaveBeenCalledWith({
        message: "Branch created successfully.",
      });
    });

    it("should return 400 if password missing", async () => {
      const res = mockResponse();
      await branchController.CreateBranch({ password: "" }, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Password is required to create a branch.",
      });
    });

    it("should return 500 if InsertBranch returns an error", async () => {
      jest.mocked(bcrypt.hash).mockResolvedValue("hashedpassword" as never);
      mockBranchService.InsertBranch.mockResolvedValue(new Error("DB Error"));

      const res = mockResponse();
      await branchController.CreateBranch(createBranchData, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to create a new branch.",
      });
    });

    it("should return 500 on error", async () => {
      jest.mocked(bcrypt.hash).mockRejectedValue(new Error("Hash Error") as never);

      const res = mockResponse();
      await branchController.CreateBranch(createBranchData, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to create a new branch.",
      });
    });
  });
});
