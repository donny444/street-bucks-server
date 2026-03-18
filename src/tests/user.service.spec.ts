import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "../services/user.service";
import { PrismaClient, $Enums } from "../../prisma/client";
import * as bcrypt from "bcryptjs";

jest.mock("bcryptjs");

describe("UserService", () => {
  let userService: UserService;
  let prismaClient: PrismaClient;

  const mockPrismaClient = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    attendance: {
      findFirst: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
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
    prismaClient = module.get<PrismaClient>(PrismaClient);

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
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpassword");
      mockPrismaClient.user.create.mockResolvedValue({ ...userData, password: "hashedpassword" });

      const result = await userService.InsertUser(userData);

      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
      expect(mockPrismaClient.user.create).toHaveBeenCalledWith({
        data: {
          ...userData,
          password: "hashedpassword",
          role: $Enums.Role.STAFF,
        },
      });
      expect(result).toBeUndefined();
    });

    it("should return Error on database failure", async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpassword");
      mockPrismaClient.user.create.mockRejectedValue(new Error("DB Error"));

      const result = await userService.InsertUser(userData);

      expect(result).toBeInstanceOf(Error);
    });
  });

  describe("FindUser", () => {
    it("should return user info successfully", async () => {
      const mockUser = {
        firstName: "John",
        lastName: "Doe",
        branchId: BigInt(1),
      };
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);

      const result = await userService.FindUser({ email: "john@test.com" });

      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        select: { firstName: true, lastName: true, branchId: true },
        where: { email: "john@test.com" },
      });
      expect(result).toEqual({
        firstName: "John",
        lastName: "Doe",
        branchId: 1,
      });
    });

    it("should return null when user not found", async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      const result = await userService.FindUser({ email: "nonexistent@test.com" });

      expect(result).toBeNull();
    });

    it("should return Error on database failure", async () => {
      mockPrismaClient.user.findUnique.mockRejectedValue(new Error("DB Error"));

      const result = await userService.FindUser({ email: "john@test.com" });

      expect(result).toBeInstanceOf(Error);
    });
  });

  describe("ToggleAttendance", () => {
    it("should create attendance when none exists", async () => {
      mockPrismaClient.attendance.findFirst.mockResolvedValue(null);
      mockPrismaClient.attendance.create.mockResolvedValue({});

      const result = await userService.ToggleAttendance({ email: "john@test.com" });

      expect(mockPrismaClient.attendance.create).toHaveBeenCalledWith({
        data: { userId: "john@test.com" },
      });
      expect(result).toBeUndefined();
    });

    it("should delete attendance when it exists", async () => {
      mockPrismaClient.attendance.findFirst.mockResolvedValue({
        userId: "john@test.com",
        dateTime: new Date(),
      });
      mockPrismaClient.attendance.deleteMany.mockResolvedValue({ count: 1 });

      const result = await userService.ToggleAttendance({ email: "john@test.com" });

      expect(mockPrismaClient.attendance.deleteMany).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it("should return Error on database failure", async () => {
      mockPrismaClient.attendance.findFirst.mockRejectedValue(new Error("DB Error"));

      const result = await userService.ToggleAttendance({ email: "john@test.com" });

      expect(result).toBeInstanceOf(Error);
    });
  });

  describe("UpdateUser", () => {
    it("should update user successfully", async () => {
      const updateData = { firstName: "Jane" };
      mockPrismaClient.user.update.mockResolvedValue({
        email: "john@test.com",
        firstName: "Jane",
      });

      const result = await userService.UpdateUser({
        data: updateData,
        where: { email: "john@test.com" },
      });

      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        data: updateData,
        where: { email: "john@test.com" },
      });
      expect(result).toBeUndefined();
    });

    it("should return Error on database failure", async () => {
      mockPrismaClient.user.update.mockRejectedValue(new Error("DB Error"));

      const result = await userService.UpdateUser({
        data: { firstName: "Jane" },
        where: { email: "john@test.com" },
      });

      expect(result).toBeInstanceOf(Error);
    });
  });

  describe("DeleteUser", () => {
    it("should delete user successfully", async () => {
      mockPrismaClient.user.delete.mockResolvedValue({ email: "john@test.com" });

      const result = await userService.DeleteUser({ email: "john@test.com" });

      expect(mockPrismaClient.user.delete).toHaveBeenCalledWith({
        where: { email: "john@test.com" },
      });
      expect(result).toBeUndefined();
    });

    it("should return Error on database failure", async () => {
      mockPrismaClient.user.delete.mockRejectedValue(new Error("DB Error"));

      const result = await userService.DeleteUser({ email: "john@test.com" });

      expect(result).toBeInstanceOf(Error);
    });
  });
});
