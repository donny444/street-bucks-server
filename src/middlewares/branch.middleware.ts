import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { verify as jwtVerify } from "jsonwebtoken";
import { PrismaClient } from "../../prisma/client";
import { BranchPayloadDto } from "../dtos/branch.dto";

@Injectable()
export class AuthorizeBranch implements NestMiddleware {
  constructor(private readonly prisma: PrismaClient) {}

  async use(req: Request<any, any, any>, res: Response, next: NextFunction) {
    const branchToken = req.headers["branch-token"] as string;

    if (!branchToken) {
      return res
        .status(401)
        .json({ message: "branch-token header is missing." });
    }

    try {
      const jwtSecret = process.env.BRANCH_JWT_SECRET;
      if (!jwtSecret) {
        console.error("Missing JWT secret for branch authorization");
        return res.status(500).json({ error: "Failed to authorize branch." });
      }

      const decoded = jwtVerify(branchToken, jwtSecret) as BranchPayloadDto;

      const branch = await this.prisma.branch.findUnique({
        select: { id: true },
        where: { id: decoded.branchId },
      });
      if (!branch) {
        return res
          .status(404)
          .json({ message: "Branch not found with the provided token." });
      }

      req.branchPayload = decoded;

      return next();
    } catch (err) {
      console.error("Error in `AuthorizeBranch` middleware:", err);
      if (err instanceof Error && err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Branch token has expired." });
      }
      return res.status(500).json({ message: "Failed to authorize branch." });
    }
  }
}
