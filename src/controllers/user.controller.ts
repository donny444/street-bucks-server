import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Put,
  Param,
  Res,
} from "@nestjs/common";
import { Response } from "express";

import { UserService } from "../services/user.service";
import type { Prisma } from "../../prisma/client";

type UserIdentifier = Required<Pick<Prisma.UserWhereUniqueInput, "uuid">>;
type UserCreateRequest = Prisma.UserUncheckedCreateInput;
type UserUpdateRequest = Prisma.UserUncheckedUpdateInput & UserIdentifier;

@Controller("users")
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Post()
  async RegisterUser(
    @Body() userData: UserCreateRequest,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const { firstName, lastName, password, uuid } = userData;

      if (!firstName || !lastName || !password) {
        return res.status(400).json({
          message: "First name, last name, and password are required.",
        });
      }

      const existingUser = uuid
        ? await this.usersService.GetUser({ uuid })
        : null;
      if (existingUser) {
        return res.status(409).json({ message: "User already exists." });
      }

      await this.usersService.InsertUser(userData);

      return res.json({
        message: "User registered successfully.",
      });
    } catch (err) {
      console.error("Error registering user:", err);
      return res.status(500).json({ error: "Failed to register user." });
    }
  }

  @Post(":uuid")
  async CheckInUser(
    @Param("uuid") uuid: string,
    @Body("status") status: boolean,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const existingUser = await this.usersService.GetUser({ uuid });
      if (!existingUser) {
        return res.status(404).json({ message: "User not found." });
      }

      if (status) {
        await this.usersService.InsertAttendance({ uuid });
      } else {
        await this.usersService.RemoveAttendance({ uuid });
      }

      return res.json({
        message: `User: ${uuid} check status: ${status}`,
      });
    } catch (err) {
      console.error("Error checking in user:", err);
      return res.status(500).json({ error: "Failed to check in user." });
    }
  }

  @Get(":uuid")
  async UserInfo(
    @Param("uuid") uuid: string,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const user = await this.usersService.GetUser({ uuid });
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      return res.json({
        message: `See the specific information of user: ${uuid}`,
      });
    } catch (err) {
      console.error("Error retrieving user info:", err);
      return res.status(500).json({ error: "Failed to retrieve user info." });
    }
  }

  @Put()
  async EditUser(
    @Body() userData: UserUpdateRequest,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const { uuid, ...updateFields } = userData;
      const { firstName, lastName, password } = userData;

      if (!uuid || !firstName || !lastName || !password) {
        return res.status(400).json({
          message: "UUID, first name, last name, and password are required.",
        });
      }

      const existingUser = await this.usersService.GetUser({ uuid });
      if (!existingUser) {
        return res.status(404).json({ message: "User not found." });
      }

      await this.usersService.UpdateUser({
        where: { uuid },
        data: updateFields,
      });

      return res.json({
        message: `Manipulate the information of user: ${uuid}`,
      });
    } catch (err) {
      console.error("Error editing user info:", err);
      return res.status(500).json({ error: "Failed to edit user info." });
    }
  }

  @Delete(":uuid")
  @HttpCode(204)
  async RemoveUser(
    @Param("uuid") uuid: string,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const user = await this.usersService.GetUser({ uuid });
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      await this.usersService.DeleteUser({ uuid });

      return res.json({
        message: `Delete all information of user: ${uuid}`,
      });
    } catch (err) {
      console.error("Error deleting user:", err);
      return res.status(500).json({ error: "Failed to delete user." });
    }
  }
}
