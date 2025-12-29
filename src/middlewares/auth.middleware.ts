import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import * as bcrypt from "bcryptjs";
import { PrismaClient, $Enums } from "../../prisma/client";
import { EditUserDto, RemoveUserDto, AuthDto } from "../dtos/user.dto";

@Injectable()
export class AuthenticateUser implements NestMiddleware {
  constructor(private readonly prisma: PrismaClient) {}

  async use(
    req: Request<{ email: string }, any, AuthDto>,
    res: Response,
    next: NextFunction
  ) {
    const { email } = req.params;
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password of staff are required.",
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
          .json({ message: "Incorrect password for staff." });
      }

      return next();
    } catch (err) {
      console.error("Error in `AuthenticateUser` middleware:", err);
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
      console.error("Error in `AuthorizeUser` middleware:", error);
      return res.status(500).json({ message: "Failed to authorize user." });
    }
  }
}
