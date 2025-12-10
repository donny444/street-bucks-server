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

import { RegisterDto, UserEditDto } from "../dtos/user.dto";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(201)
  async RegisterUser(
    @Body() userData: RegisterDto,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const { firstName, lastName, password, branchId = 1 } = userData;

      if (!firstName || !lastName || !password || !branchId) {
        return res.status(400).json({
          message:
            "First name, last name, password, and branchId are required.",
        });
      }

      // const existingUser = uuid
      //   ? await this.userService.GetUser({ uuid })
      //   : null;
      // if (existingUser) {
      //   return res.status(409).json({ message: "User already exists." });
      // }

      await this.userService.InsertUser(userData);

      return res.json({
        message: "User registered to the system successfully.",
      });
    } catch (err) {
      console.error("Error registering user:", err);
      return res.status(500).json({ error: "Failed to register user." });
    }
  }

  @Post(":uuid")
  @HttpCode(201)
  async AttendUser(
    @Param("uuid") uuid: string,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const existingUser = await this.userService.GetUser({ uuid });
      if (!existingUser) {
        return res.status(404).json({ message: "User not found." });
      }

      await this.userService.ToggleAttendance({ uuid });

      return res.json({
        message: `User: ${uuid} attendance status for today has been switched`,
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
      const user = await this.userService.GetUser({ uuid });
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      return res.json({
        message: `See the specific information of user: ${uuid}`,
        user,
      });
    } catch (err) {
      console.error("Error retrieving user info:", err);
      return res.status(500).json({ error: "Failed to retrieve user info." });
    }
  }

  @Put()
  async EditUser(
    @Body() userData: UserEditDto,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const { uuid, ...updateFields } = userData;
      const { firstName, lastName, password } = userData;

      if (
        uuid === "" ||
        firstName === "" ||
        lastName === "" ||
        password === ""
      ) {
        return res.status(400).json({
          message:
            "UUID, first name, last name, and password must not be empty strings.",
        });
      }

      const existingUser = await this.userService.GetUser({ uuid });
      if (!existingUser) {
        return res.status(404).json({ message: "User not found." });
      }

      await this.userService.UpdateUser({
        where: { uuid },
        data: updateFields,
      });

      return res.json({
        message: `Updated the information of the user: ${uuid}`,
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
      const user = await this.userService.GetUser({ uuid });
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      await this.userService.DeleteUser({ uuid });

      return res.json({
        message: `Delete all information of the user: ${uuid}`,
      });
    } catch (err) {
      console.error("Error deleting user:", err);
      return res.status(500).json({ error: "Failed to delete user." });
    }
  }
}
