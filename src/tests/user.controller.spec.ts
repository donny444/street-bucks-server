import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "../controllers/user.controller";
import { UserService } from "../services/user.service";
import { Response } from "express";
import { RegisterDto, EditUserDto } from "../dtos/user.dto";
import { $Enums } from "../../prisma/client";

describe("UserController", () => {
  let userController: UserController;

  const mockUserService = {
    InsertUser: jest.fn(),
    CheckUserExists: jest.fn(),
    InsertAttendance: jest.fn(),
    FindUserForm: jest.fn(),
    UpdateUser: jest.fn(),
    DeleteUser: jest.fn(),
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
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    userController = module.get<UserController>(UserController);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(userController).toBeDefined();
  });

  describe("RegisterUser", () => {
    const branchPayload = { branchId: 1 };
    const validUserData: RegisterDto = {
      email: "john@test.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
    };

    it("should register user successfully", async () => {
      mockUserService.CheckUserExists.mockResolvedValue(false);
      mockUserService.InsertUser.mockResolvedValue(undefined);

      const res = mockResponse();
      await userController.RegisterUser(branchPayload, validUserData, res);

      expect(mockUserService.InsertUser).toHaveBeenCalledWith({
        ...validUserData,
        branchId: BigInt(1),
      });
      expect(res.json).toHaveBeenCalledWith({
        message: "User registered to the system successfully.",
      });
    });
  });

  describe("AttendUser", () => {
    it("should toggle attendance successfully", async () => {
      mockUserService.CheckUserExists.mockResolvedValue(true);
      mockUserService.InsertAttendance.mockResolvedValue(undefined);

      const res = mockResponse();
      await userController.AttendUser("john@test.com", res);

      expect(mockUserService.InsertAttendance).toHaveBeenCalledWith({
        email: "john@test.com",
      });
      expect(res.json).toHaveBeenCalledWith({
        message: "User: john@test.com attendance status for today has been switched",
      });
    });
  });

  describe("GetUserForm", () => {
    it("should return user form successfully", async () => {
      const userForm = {
        email: "john@test.com",
        firstName: "John",
        lastName: "Doe",
        role: $Enums.Role.STAFF,
      };
      mockUserService.FindUserForm.mockResolvedValue(userForm);

      const res = mockResponse();
      await userController.GetUserForm("john@test.com", res);

      expect(mockUserService.FindUserForm).toHaveBeenCalledWith({
        email: "john@test.com",
      });
      expect(res.json).toHaveBeenCalledWith({
        message: "See the specific information of user: john@test.com",
        user_form: userForm,
      });
    });
  });

  describe("EditUser", () => {
    const editUserData: EditUserDto = {
      email: "john-new@test.com",
      firstName: "Jane",
      lastName: "Smith",
      password: "newpassword",
      role: $Enums.Role.STAFF,
      editor: { email: "manager@test.com", password: "secret" },
    };

    it("should update user info successfully", async () => {
      mockUserService.CheckUserExists.mockResolvedValue(true);
      mockUserService.UpdateUser.mockResolvedValue(undefined);

      const res = mockResponse();
      await userController.EditUser("john@test.com", editUserData, res);

      expect(res.json).toHaveBeenCalledWith({
        message: "Updated the information of the user: john@test.com",
      });
    });
  });

  describe("RemoveUser", () => {
    it("should remove user successfully", async () => {
      mockUserService.CheckUserExists.mockResolvedValue(true);
      mockUserService.DeleteUser.mockResolvedValue(undefined);

      const res = mockResponse();
      await userController.RemoveUser("john@test.com", res);

      expect(mockUserService.DeleteUser).toHaveBeenCalledWith({
        email: "john@test.com",
      });
      expect(res.json).toHaveBeenCalledWith({
        message: "Removed the user: john@test.com from the database",
      });
    });
  });
});
