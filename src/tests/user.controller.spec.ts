import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "../controllers/user.controller";
import { UserService } from "../services/user.service";
import { Response } from "express";
import { RegisterDto, EditUserDto } from "../dtos/user.dto";
import { $Enums } from "../../prisma/client";

describe("UserController", () => {
  let userController: UserController;
  let userService: UserService;

  const mockUserService = {
    InsertUser: jest.fn(),
    FindUser: jest.fn(),
    ToggleAttendance: jest.fn(),
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
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(userController).toBeDefined();
  });

  describe("RegisterUser", () => {
    const branchPayload = JSON.stringify({ branchId: 1 });
    const validUserData: RegisterDto = {
      email: "john@test.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
    };

    it("should register user successfully", async () => {
      mockUserService.FindUser.mockResolvedValue(null);
      mockUserService.InsertUser.mockResolvedValue({
        ...validUserData,
        id: 1,
        branchId: BigInt(1),
      });

      const res = mockResponse();
      await userController.RegisterUser(branchPayload, validUserData, res);

      expect(mockUserService.InsertUser).toHaveBeenCalledWith({
        email: "john@test.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
        branchId: BigInt(1),
      });
      expect(res.json).toHaveBeenCalledWith({
        message: "User registered to the system successfully.",
      });
    });

    it("should return 400 if required fields are missing", async () => {
      const invalidData = {
        email: "",
        password: "",
        firstName: "",
        lastName: "",
      } as any;

      const res = mockResponse();
      await userController.RegisterUser(branchPayload, invalidData, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Every user credential is required.",
      });
    });

    it("should return 400 for invalid email format", async () => {
      const invalidEmailData = { ...validUserData, email: "invalid-email" };

      const res = mockResponse();
      await userController.RegisterUser(branchPayload, invalidEmailData, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message:
          "The email provided is not in valid format to register a new user.",
      });
    });

    it("should return 409 if user already exists", async () => {
      mockUserService.FindUser.mockResolvedValue({
        email: validUserData.email,
      });

      const res = mockResponse();
      await userController.RegisterUser(branchPayload, validUserData, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: "User with the email provided already exists.",
      });
    });

    it("should return 500 when FindUser returns Error", async () => {
      mockUserService.FindUser.mockResolvedValue(new Error("DB Error"));

      const res = mockResponse();
      await userController.RegisterUser(branchPayload, validUserData, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to check existing user with the email.",
      });
    });

    it("should return 500 when InsertUser returns Error", async () => {
      mockUserService.FindUser.mockResolvedValue(null);
      mockUserService.InsertUser.mockResolvedValue(new Error("Insert failed"));

      const res = mockResponse();
      await userController.RegisterUser(branchPayload, validUserData, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to register the new user.",
      });
    });

    it("should return 500 on exception", async () => {
      mockUserService.FindUser.mockResolvedValue(null);
      mockUserService.InsertUser.mockRejectedValue(new Error("DB Error"));

      const res = mockResponse();
      await userController.RegisterUser(branchPayload, validUserData, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to register the new user.",
      });
    });
  });

  describe("AttendUser", () => {
    it("should toggle attendance successfully", async () => {
      mockUserService.FindUser.mockResolvedValue({ email: "john@test.com" });
      mockUserService.ToggleAttendance.mockResolvedValue({});

      const res = mockResponse();
      await userController.AttendUser("john@test.com", res);

      expect(mockUserService.ToggleAttendance).toHaveBeenCalledWith({
        email: "john@test.com",
      });
      expect(res.json).toHaveBeenCalledWith({
        message:
          "User: john@test.com attendance status for today has been switched",
      });
    });

    it("should return 400 for invalid email format", async () => {
      const res = mockResponse();
      await userController.AttendUser("invalid-email", res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message:
          "The email provided is not in valid format to record an attendance.",
      });
    });

    it("should return 404 if user not found", async () => {
      mockUserService.FindUser.mockResolvedValue(null);

      const res = mockResponse();
      await userController.AttendUser("nonexistent@test.com", res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "User not found with the provided email.",
      });
    });

    it("should return 500 when FindUser returns Error", async () => {
      mockUserService.FindUser.mockResolvedValue(new Error("DB Error"));

      const res = mockResponse();
      await userController.AttendUser("john@test.com", res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to check existing user with the email.",
      });
    });

    it("should return 500 on exception", async () => {
      mockUserService.FindUser.mockRejectedValue(new Error("DB Error"));

      const res = mockResponse();
      await userController.AttendUser("john@test.com", res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to check in user.",
      });
    });
  });

  describe("GetUserInfo", () => {
    it("should return user info successfully", async () => {
      const userInfo = { firstName: "John", lastName: "Doe", branchId: 1 };
      mockUserService.FindUser.mockResolvedValue(userInfo);

      const res = mockResponse();
      await userController.GetUserInfo("john@test.com", res);

      expect(mockUserService.FindUser).toHaveBeenCalledWith({
        email: "john@test.com",
      });
      expect(res.json).toHaveBeenCalledWith({
        message: "See the specific information of user: john@test.com",
        user_info: userInfo,
      });
    });

    it("should return 400 for invalid email format", async () => {
      const res = mockResponse();
      await userController.GetUserInfo("invalid-email", res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message:
          "The email provided is not in valid format to receive the information of the user.",
      });
    });

    it("should return 404 if user not found", async () => {
      mockUserService.FindUser.mockResolvedValue(null);

      const res = mockResponse();
      await userController.GetUserInfo("nonexistent@test.com", res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "User not found with the provided email.",
      });
    });

    it("should return 500 when FindUser returns Error", async () => {
      mockUserService.FindUser.mockResolvedValue(new Error("DB Error"));

      const res = mockResponse();
      await userController.GetUserInfo("john@test.com", res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to retrieve user information.",
      });
    });

    it("should return 500 on exception", async () => {
      mockUserService.FindUser.mockRejectedValue(new Error("DB Error"));

      const res = mockResponse();
      await userController.GetUserInfo("john@test.com", res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to retrieve user info.",
      });
    });
  });

  describe("EditUser", () => {
    const editUserData: EditUserDto = {
      email: "john@test.com",
      firstName: "Jane",
      lastName: "Smith",
      password: "newpassword",
      role: $Enums.Role.STAFF,
    };

    it("should update user info successfully", async () => {
      mockUserService.FindUser.mockResolvedValue({ email: "john@test.com" });
      mockUserService.UpdateUser.mockResolvedValue({ email: "john@test.com" });

      const res = mockResponse();
      await userController.EditUser("john@test.com", editUserData, res);

      expect(res.json).toHaveBeenCalledWith({
        message: "Updated the information of the user: john@test.com",
      });
    });

    it("should return 400 for invalid email format", async () => {
      const res = mockResponse();
      await userController.EditUser("invalid-email", editUserData, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "User email must be in valid pattern.",
      });
    });

    it("should return 400 if required fields are missing", async () => {
      const emptyData = { ...editUserData, firstName: "" };

      const res = mockResponse();
      await userController.EditUser("john@test.com", emptyData, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "All input fields are required.",
      });
    });

    it("should return 400 for invalid role", async () => {
      const invalidRoleData = { ...editUserData, role: "INVALID" as any };

      const res = mockResponse();
      await userController.EditUser("john@test.com", invalidRoleData, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "You either select the user role to be a staff or a manager.",
      });
    });

    it("should return 404 if user not found", async () => {
      mockUserService.FindUser.mockResolvedValue(null);

      const res = mockResponse();
      await userController.EditUser("nonexistent@test.com", editUserData, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should return 500 on error", async () => {
      mockUserService.FindUser.mockRejectedValue(new Error("DB Error"));

      const res = mockResponse();
      await userController.EditUser("john@test.com", editUserData, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to edit user info.",
      });
    });
  });

  describe("RemoveUser", () => {
    it("should remove user successfully", async () => {
      mockUserService.FindUser.mockResolvedValue({ email: "john@test.com" });
      mockUserService.DeleteUser.mockResolvedValue({});

      const res = mockResponse();
      await userController.RemoveUser("john@test.com", res);

      expect(mockUserService.DeleteUser).toHaveBeenCalledWith({
        email: "john@test.com",
      });
      expect(res.json).toHaveBeenCalledWith({
        message: "Removed the user: john@test.com from the database",
      });
    });

    it("should return 400 for invalid email format", async () => {
      const res = mockResponse();
      await userController.RemoveUser("invalid-email", res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 404 if user not found", async () => {
      mockUserService.FindUser.mockResolvedValue(null);

      const res = mockResponse();
      await userController.RemoveUser("nonexistent@test.com", res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
