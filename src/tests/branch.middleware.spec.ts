import { Request, Response } from "express";
import { verify as jwtVerify } from "jsonwebtoken";
import { PrismaClient } from "../../prisma/client";
import { AuthorizeBranch } from "../middlewares/branch.middleware";

jest.mock("jsonwebtoken");

describe("AuthorizeBranch middleware", () => {
  const mockPrisma = {
    branch: {
      findUnique: jest.fn(),
    },
  } as unknown as PrismaClient;

  const middleware = new AuthorizeBranch(mockPrisma);

  const mockResponse = () => {
    const res: Partial<Response> = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    return res as Response;
  };

  const createReq = (token?: string) =>
    ({
      headers: token ? { "branch-token": token } : {},
    }) as unknown as Request;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BRANCH_JWT_SECRET = "branch-secret";
  });

  afterEach(() => {
    delete process.env.BRANCH_JWT_SECRET;
  });

  it("should return 401 when branch-token header is missing", async () => {
    const req = createReq();
    const res = mockResponse();
    const next = jest.fn();

    await middleware.use(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "branch-token header is missing.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 500 when branch jwt secret is missing", async () => {
    delete process.env.BRANCH_JWT_SECRET;
    const req = createReq("token");
    const res = mockResponse();
    const next = jest.fn();

    await middleware.use(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to authorize branch.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 404 when branch does not exist", async () => {
    const req = createReq("token");
    const res = mockResponse();
    const next = jest.fn();

    jest.mocked(jwtVerify).mockReturnValue({ branchId: 5 } as never);
    (
      mockPrisma.branch.findUnique as jest.MockedFunction<
        typeof mockPrisma.branch.findUnique
      >
    ).mockResolvedValue(null);

    await middleware.use(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Branch not found with the provided token.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should attach payload and call next for valid token and branch", async () => {
    const req = createReq("token");
    const res = mockResponse();
    const next = jest.fn();

    const decoded = { branchId: 5 };
    jest.mocked(jwtVerify).mockReturnValue(decoded as never);
    (
      mockPrisma.branch.findUnique as jest.MockedFunction<
        typeof mockPrisma.branch.findUnique
      >
    ).mockResolvedValue({ id: 5n, password: "hashed" } as never);

    await middleware.use(req, res, next);

    expect(req.branchPayload).toEqual(decoded);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should return 401 when token is expired", async () => {
    const req = createReq("token");
    const res = mockResponse();
    const next = jest.fn();

    const err = new Error("expired");
    err.name = "TokenExpiredError";
    jest.mocked(jwtVerify).mockImplementation(() => {
      throw err;
    });

    await middleware.use(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Branch token has expired.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 500 when token verification fails unexpectedly", async () => {
    const req = createReq("token");
    const res = mockResponse();
    const next = jest.fn();

    jest.mocked(jwtVerify).mockImplementation(() => {
      throw new Error("invalid");
    });

    await middleware.use(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Failed to authorize branch.",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
