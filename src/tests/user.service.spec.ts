import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "../services/user.service";
import { PrismaClient, $Enums } from "../../prisma/client";
import * as bcrypt from "bcryptjs";

jest.mock("bcryptjs");

describe("UserService", () => {
  let userService: UserService;

  const mockPrismaClient = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    attendance: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaClient,
          useValue: mockPrismaClient,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(userService).toBeDefined();
  });

  describe("InsertUser", () => {
    const userData = {
      email: "john@test.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
      branchId: BigInt(1),
    };

    it("should insert user successfully", async () => {
      jest.mocked(bcrypt.hash).mockResolvedValue("hashedpassword" as never);
      mockPrismaClient.user.create.mockResolvedValue({});

      const result = await userService.InsertUser(userData);

      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
      expect(mockPrismaClient.user.create).toHaveBeenCalledWith({
        data: {
          ...userData,
          password: "hashedpassword",
          branchId: BigInt(1),
          role: $Enums.Role.STAFF,
        },
      });
      expect(result).toBeUndefined();
    });
  });

  describe("CheckUserExists", () => {
    it("should return false when user not found", async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      const result = await userService.CheckUserExists("none@test.com");
      expect(result).toBe(false);
    });
  });

  describe("InsertAttendance", () => {
    it("should create attendance when not yet attended", async () => {
      mockPrismaClient.attendance.findFirst.mockResolvedValue(null);
      mockPrismaClient.attendance.create.mockResolvedValue({});

      const result = await userService.InsertAttendance({
        email: "john@test.com",
      });

      expect(mockPrismaClient.attendance.create).toHaveBeenCalledWith({
        data: { userId: "john@test.com" },
      });
      expect(result).toBeUndefined();
    });
  });

  describe("FindUser", () => {
    it("should return user credentials payload", async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue({
        email: "john@test.com",
        password: "hashed",
        role: $Enums.Role.STAFF,
      });

      const result = await userService.FindUser({ email: "john@test.com" });

      expect(result).toEqual({
        email: "john@test.com",
        password: "hashed",
        role: $Enums.Role.STAFF,
      });
    });
  });

  describe("DeleteUser", () => {
    it("should run transaction to delete user and attendances", async () => {
      mockPrismaClient.$transaction.mockImplementation(async (cb: any) => {
        const tx = {
          attendance: { deleteMany: jest.fn().mockResolvedValue({}) },
          user: { delete: jest.fn().mockResolvedValue({}) },
        };
        await cb(tx);
      });

      const result = await userService.DeleteUser({ email: "john@test.com" });
      expect(result).toBeUndefined();
    });
  });
});
