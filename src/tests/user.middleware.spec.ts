import { Request, Response } from "express";
import * as bcrypt from "bcryptjs";
import { verify as jwtVerify } from "jsonwebtoken";
import { PrismaClient, $Enums } from "../../prisma/client";
import {
  AuthenticateUser,
  AuthorizeAdministrator,
  AuthorizeManager,
} from "../middlewares/user.middleware";

jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("User middlewares", () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
    },
  } as unknown as PrismaClient;

  const authenticateUser = new AuthenticateUser(mockPrisma);
  const authorizeManager = new AuthorizeManager(mockPrisma);
  const authorizeAdministrator = new AuthorizeAdministrator(mockPrisma);

  const mockResponse = () => {
    const res: Partial<Response> = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    return res as Response;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ADMIN_JWT_SECRET = "admin-secret";
  });

  afterEach(() => {
    delete process.env.ADMIN_JWT_SECRET;
  });

  describe("AuthenticateUser", () => {
    it("should return 400 for missing email or password", async () => {
      const req = {
        params: { email: "" },
        body: { password: "" },
      } as unknown as Request;
      const res = mockResponse();
      const next = jest.fn();

      await authenticateUser.use(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Email and password of user are required.",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 404 when user is not found", async () => {
      const req = {
        params: { email: "user@test.com" },
        body: { password: "secret" },
      } as unknown as Request;
      const res = mockResponse();
      const next = jest.fn();

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await authenticateUser.use(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "User not found with the provided email.",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 when password is incorrect", async () => {
      const req = {
        params: { email: "user@test.com" },
        body: { password: "wrong" },
      } as unknown as Request;
      const res = mockResponse();
      const next = jest.fn();

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        password: "hashed",
      });
      jest.mocked(bcrypt.compare).mockResolvedValueOnce(false as never);

      await authenticateUser.use(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Incorrect password for user.",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next for valid credentials", async () => {
      const req = {
        params: { email: "user@test.com" },
        body: { password: "correct" },
      } as unknown as Request;
      const res = mockResponse();
      const next = jest.fn();

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        password: "hashed",
      });
      jest.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);

      await authenticateUser.use(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it("should return 500 when authentication fails unexpectedly", async () => {
      const req = {
        params: { email: "user@test.com" },
        body: { password: "correct" },
      } as unknown as Request;
      const res = mockResponse();
      const next = jest.fn();

      (mockPrisma.user.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error("db"),
      );

      await authenticateUser.use(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to authenticate user.",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("AuthorizeManager", () => {
    it("should return 400 for missing editor email or password", async () => {
      const req = {
        body: { editor: { email: "", password: "" } },
      } as unknown as Request;
      const res = mockResponse();
      const next = jest.fn();

      await authorizeManager.use(req as Request<any, any, any>, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Email and password of editor are required.",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 404 when editor is not found", async () => {
      const req = {
        body: { editor: { email: "editor@test.com", password: "secret" } },
      } as unknown as Request;
      const res = mockResponse();
      const next = jest.fn();

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await authorizeManager.use(req as Request<any, any, any>, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Editor not found with the provided email.",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 when editor password is incorrect", async () => {
      const req = {
        body: { editor: { email: "editor@test.com", password: "wrong" } },
      } as unknown as Request;
      const res = mockResponse();
      const next = jest.fn();

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        password: "hashed",
        role: $Enums.Role.MANAGER,
      });
      jest.mocked(bcrypt.compare).mockResolvedValueOnce(false as never);

      await authorizeManager.use(req as Request<any, any, any>, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Incorrect password for editor.",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 when editor is not manager", async () => {
      const req = {
        body: { editor: { email: "staff@test.com", password: "secret" } },
      } as unknown as Request;
      const res = mockResponse();
      const next = jest.fn();

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        password: "hashed",
        role: $Enums.Role.STAFF,
      });
      jest.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);

      await authorizeManager.use(req as Request<any, any, any>, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Only managers are authorized",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next when editor is an authorized manager", async () => {
      const req = {
        body: { editor: { email: "manager@test.com", password: "secret" } },
      } as unknown as Request;
      const res = mockResponse();
      const next = jest.fn();

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        password: "hashed",
        role: $Enums.Role.MANAGER,
      });
      jest.mocked(bcrypt.compare).mockResolvedValueOnce(true as never);

      await authorizeManager.use(req as Request<any, any, any>, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it("should return 500 when manager authorization throws", async () => {
      const req = {
        body: { editor: { email: "manager@test.com", password: "secret" } },
      } as unknown as Request;
      const res = mockResponse();
      const next = jest.fn();

      (mockPrisma.user.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error("db"),
      );

      await authorizeManager.use(req as Request<any, any, any>, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to authorize manager.",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("AuthorizeAdministrator", () => {
    it("should return 401 when admin-token header is missing", async () => {
      const req = { headers: {} } as unknown as Request;
      const res = mockResponse();
      const next = jest.fn();

      await authorizeAdministrator.use(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "admin-token header is missing.",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 500 when admin jwt secret is missing", async () => {
      delete process.env.ADMIN_JWT_SECRET;
      const req = {
        headers: { "admin-token": "token" },
      } as unknown as Request;
      const res = mockResponse();
      const next = jest.fn();

      await authorizeAdministrator.use(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to authorize admin.",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 404 when administrator record is not found", async () => {
      const req = {
        headers: { "admin-token": "token" },
      } as unknown as Request;
      const res = mockResponse();
      const next = jest.fn();

      jest.mocked(jwtVerify).mockReturnValue({ email: "admin@test.com" } as never);
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      await authorizeAdministrator.use(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Administrator not found with the provided email.",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 when user is not administrator", async () => {
      const req = {
        headers: { "admin-token": "token" },
      } as unknown as Request;
      const res = mockResponse();
      const next = jest.fn();

      jest.mocked(jwtVerify).mockReturnValue({ email: "staff@test.com" } as never);
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        role: $Enums.Role.STAFF,
      });

      await authorizeAdministrator.use(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Only administrators are authorized",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next when valid administrator token is provided", async () => {
      const req = {
        headers: { "admin-token": "token" },
      } as unknown as Request;
      const res = mockResponse();
      const next = jest.fn();

      jest.mocked(jwtVerify).mockReturnValue({ email: "admin@test.com" } as never);
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        role: $Enums.Role.ADMINISTRATOR,
      });

      await authorizeAdministrator.use(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it("should return 401 when admin token has expired", async () => {
      const req = {
        headers: { "admin-token": "token" },
      } as unknown as Request;
      const res = mockResponse();
      const next = jest.fn();

      const err = new Error("expired");
      err.name = "TokenExpiredError";
      jest.mocked(jwtVerify).mockImplementation(() => {
        throw err;
      });

      await authorizeAdministrator.use(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Admin token has expired.",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 500 when token validation fails unexpectedly", async () => {
      const req = {
        headers: { "admin-token": "token" },
      } as unknown as Request;
      const res = mockResponse();
      const next = jest.fn();

      jest.mocked(jwtVerify).mockImplementation(() => {
        throw new Error("invalid");
      });

      await authorizeAdministrator.use(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to authorize administrator.",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
