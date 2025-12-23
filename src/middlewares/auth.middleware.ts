import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import * as bcrypt from "bcryptjs";
import { PrismaClient, $Enums } from "../../prisma/client";
import { EditUserDto, RemoveUserDto, AuthDto } from "../dtos/user.dto";

@Injectable()
export class AuthenticateUser implements NestMiddleware {
  constructor(private readonly prisma: PrismaClient) {}
  async use(
    req: Request<any, any, AuthDto>,
    res: Response,
    next: NextFunction
  ) {
    const { firstName, lastName, password } = req.body;

    if (!firstName || !lastName || !password) {
      return res.status(400).json({
        message: "First name, last name, and password are required.",
      });
    }

    try {
      const user = await this.prisma.user.findFirst({
        select: {
          password: true,
        },
        where: {
          firstName,
          lastName,
        },
      });

      const correctPassword =
        user && (await bcrypt.compare(password, user.password));
      if (!correctPassword) {
        return res.status(401).json({ message: "Invalid credentials." });
      }

      return next();
    } catch (error) {
      console.error("Error in `AuthenticateUser` middleware:", error);
      return res.status(500).json({ message: "Failed to authenticate user." });
    }
  }
}

export class AuthorizeUser implements NestMiddleware {
  constructor(private readonly prisma: PrismaClient) {}
  async use(
    req: Request<any, any, EditUserDto | RemoveUserDto>,
    res: Response,
    next: NextFunction
  ) {
    const { firstName, lastName, password } = req.body["auth"];

    if (!firstName || !lastName || !password) {
      return res.status(400).json({
        message: "First name, last name, and password are required.",
      });
    }

    try {
      const user = await this.prisma.user.findFirst({
        select: {
          role: true,
          password: true,
        },
        where: {
          firstName,
          lastName,
        },
      });

      const correctPassword =
        user && (await bcrypt.compare(password, user.password));
      if (!correctPassword) {
        return res.status(401).json({ message: "Invalid credentials." });
      }

      if (user.role !== $Enums.Role.MANAGER) {
        return res
          .status(401)
          .json({ message: "Only managers are authorized" });
      }

      return next();
    } catch (error) {
      console.error("Error in `AuthorizeUser` middleware:", error);
      return res.status(500).json({ message: "Failed to authorize user." });
    }
  }
}
