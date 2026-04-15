import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

import * as bcrypt from "bcryptjs";
import { verify as jwtVerify } from "jsonwebtoken";

import { PrismaClient, $Enums } from "../../prisma/client";

import { CredentialsDto, UserPayloadDto } from "../dtos/user.dto";

@Injectable()
export class AuthenticateUser implements NestMiddleware {
  constructor(private readonly prisma: PrismaClient) {}

  async use(req: Request<any, any, any>, res: Response, next: NextFunction) {
    const { email } = req.params as CredentialsDto;
    const { password } = req.body as CredentialsDto;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password of user are required.",
      });
    }

    try {
      const user = await this.prisma.user.findUnique({
        select: {
          password: true,
        },
        where: {
          email,
        },
      });
      if (!user) {
        return res
          .status(404)
          .json({ message: "User not found with the provided email." });
      }

      const correctPassword = await bcrypt.compare(password, user.password);
      if (!correctPassword) {
        return res
          .status(401)
          .json({ message: "Incorrect password for user." });
      }

      return next();
    } catch (err) {
      console.error("Error in `AuthenticateUser` middleware:", err);
      return res.status(500).json({ message: "Failed to authenticate user." });
    }
  }
}

@Injectable()
export class AuthorizeManager implements NestMiddleware {
  constructor(private readonly prisma: PrismaClient) {}

  async use(
    req: Request<any, any, { editor: CredentialsDto }>,
    res: Response,
    next: NextFunction
  ) {
    const { email, password } = req.body.editor;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password of editor are required.",
      });
    }

    try {
      const editor = await this.prisma.user.findUnique({
        select: {
          role: true,
          password: true,
        },
        where: {
          email,
        },
      });
      if (!editor) {
        return res
          .status(404)
          .json({ message: "Editor not found with the provided email." });
      }

      const correctPassword = await bcrypt.compare(password, editor.password);
      if (!correctPassword) {
        return res
          .status(401)
          .json({ message: "Incorrect password for editor." });
      }

      if (editor.role !== $Enums.Role.MANAGER) {
        return res
          .status(401)
          .json({ message: "Only managers are authorized" });
      }

      return next();
    } catch (error) {
      console.error("Error in `AuthorizeManager` middleware:", error);
      return res.status(500).json({ message: "Failed to authorize manager." });
    }
  }
}

@Injectable()
export class AuthorizeAdministrator implements NestMiddleware {
  constructor(private readonly prisma: PrismaClient) {}
  async use(req: Request<any, any, any>, res: Response, next: NextFunction) {
    const adminToken = req.headers["admin-token"] as string;

    if (!adminToken) {
      return res.status(401).json({
        message: "admin-token header is missing.",
      });
    }

    try {
      const jwtSecret = process.env.BRANCH_JWT_SECRET;
      if (!jwtSecret) {
        console.error("Missing JWT secret for branch authorization");
        return res.status(500).json({ error: "Failed to authorize branch." });
      }

      const decoded = jwtVerify(adminToken, jwtSecret) as UserPayloadDto;

      const administrator = await this.prisma.user.findUnique({
        select: {
          role: true,
        },
        where: {
          email: decoded.email,
        },
      });
      if (!administrator) {
        return res.status(404).json({
          message: "Administrator not found with the provided email.",
        });
      }

      if (administrator.role !== $Enums.Role.ADMINISTRATOR) {
        return res
          .status(401)
          .json({ message: "Only administrators are authorized" });
      }

      return next();
    } catch (err) {
      console.error("Error in `AuthorizeAdministrator` middleware:", err);
      if (err instanceof Error && err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Branch token has expired." });
      }
      return res
        .status(500)
        .json({ message: "Failed to authorize administrator." });
    }
  }
}
