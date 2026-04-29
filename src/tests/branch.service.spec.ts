import { Test, TestingModule } from "@nestjs/testing";
import { BranchService } from "../services/branch.service";
import { PrismaClient } from "../../prisma/client";

describe("BranchService", () => {
  let branchService: BranchService;
  let prismaClient: PrismaClient;

  const mockPrismaClient = {
    branch: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BranchService,
        {
          provide: PrismaClient,
          useValue: mockPrismaClient,
        },
      ],
    }).compile();

    branchService = module.get<BranchService>(BranchService);
    prismaClient = module.get<PrismaClient>(PrismaClient);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(branchService).toBeDefined();
  });

  describe("FindBranch", () => {
    it("should find branch successfully", async () => {
      const mockBranch = { id: BigInt(1), password: "hashedpassword" };
      mockPrismaClient.branch.findUnique.mockResolvedValue(mockBranch);

      const result = await branchService.FindBranch({ id: BigInt(1) });

      expect(mockPrismaClient.branch.findUnique).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
      });
      expect(result).toEqual(mockBranch);
    });

    it("should return null when branch not found", async () => {
      mockPrismaClient.branch.findUnique.mockResolvedValue(null);

      const result = await branchService.FindBranch({ id: BigInt(999) });

      expect(result).toBeNull();
    });

    it("should return Error on database failure", async () => {
      mockPrismaClient.branch.findUnique.mockRejectedValue(new Error("DB Error"));

      const result = await branchService.FindBranch({ id: BigInt(1) });

      expect(result).toBeInstanceOf(Error);
    });
  });

  describe("InsertBranch", () => {
    it("should insert branch successfully", async () => {
      mockPrismaClient.branch.create.mockResolvedValue({
        id: BigInt(5),
        password: "hashedpassword",
      });

      const result = await branchService.InsertBranch({ password: "hashedpassword" });

      expect(mockPrismaClient.branch.create).toHaveBeenCalledWith({
        data: { password: "hashedpassword" },
      });
      expect(result).toBeUndefined();
    });

    it("should return Error on database failure", async () => {
      mockPrismaClient.branch.create.mockRejectedValue(new Error("DB Error"));

      const result = await branchService.InsertBranch({ password: "hashedpassword" });

      expect(result).toBeInstanceOf(Error);
    });
  });

  describe("SelectBranches", () => {
    it("should return all branch IDs", async () => {
      mockPrismaClient.branch.findMany.mockResolvedValue([
        { id: BigInt(1) },
        { id: BigInt(2) },
        { id: BigInt(3) },
      ]);

      const result = await branchService.SelectBranches();

      expect(mockPrismaClient.branch.findMany).toHaveBeenCalledWith({
        select: { id: true },
      });
      expect(result).toEqual([1, 2, 3]);
    });

    it("should return Error on database failure", async () => {
      mockPrismaClient.branch.findMany.mockRejectedValue(new Error("DB Error"));

      const result = await branchService.SelectBranches();

      expect(result).toBeInstanceOf(Error);
    });
  });
});
