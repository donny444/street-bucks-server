import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Post,
  Put,
  Param,
  Res,
} from "@nestjs/common";
import { Response } from "express";

import { UserService } from "../services/user.service";

import { RegisterDto, EditUserDto } from "../dtos/user.dto";
import { BranchPayloadDto } from "../dtos/branch.dto";
import { $Enums } from "../../prisma/client";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  @Post()
  @HttpCode(201)
  async RegisterUser(
    @Headers("Branch-Payload") branchPayload: string,
    @Body() userData: RegisterDto,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const parsedBranchPayload = JSON.parse(
        branchPayload || "{}"
      ) as BranchPayloadDto;
      if (!parsedBranchPayload) {
        return res
          .status(500)
          .json({ message: "Failed to register a new user." });
      }

      const { branchId } = parsedBranchPayload;

      const { email, password, firstName, lastName } = userData;

      if (!email || !firstName || !lastName || !password || !branchId) {
        return res.status(400).json({
          message: "Every user credential is required.",
        });
      }

      const validEmail = this.validateEmail(email);
      if (!validEmail) {
        return res.status(400).json({
          message:
            "The email provided is not in valid format to register a new user.",
        });
      }

      const existingUser = await this.userService.FindUser({ email });
      if (existingUser) {
        return res
          .status(409)
          .json({ message: "User with the email provided already exists." });
      }

      const newUser = await this.userService.InsertUser({
        email,
        password,
        firstName,
        lastName,
        branchId: BigInt(branchId),
      });
      if (!newUser || newUser instanceof Error) {
        return res
          .status(500)
          .json({ message: "Failed to register the new user." });
      }

      return res.json({
        message: "User registered to the system successfully.",
      });
    } catch (err) {
      console.error("Error registering user:", err);
      return res
        .status(500)
        .json({ error: "Failed to register the new user." });
    }
  }

  @Post(":email")
  @HttpCode(201)
  async AttendUser(
    @Param("email") email: string,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const validEmail = this.validateEmail(email);
      if (!validEmail) {
        return res.status(400).json({
          message:
            "The email provided is not in valid format to record an attendance.",
        });
      }

      const existingUser = await this.userService.FindUser({ email });
      if (!existingUser) {
        return res
          .status(404)
          .json({ message: "User not found with the provided email." });
      }

      await this.userService.ToggleAttendance({ email });

      return res.json({
        message: `User: ${email} attendance status for today has been switched`,
      });
    } catch (err) {
      console.error("Error checking in user:", err);
      return res.status(500).json({ error: "Failed to check in user." });
    }
  }

  @Get(":email")
  async GetUserInfo(
    @Param("email") email: string,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const validEmail = this.validateEmail(email);
      if (!validEmail) {
        return res.status(400).json({
          message:
            "The email provided is not in valid format to receive the information of the user.",
        });
      }

      const userInfo = await this.userService.FindUser({ email });
      if (!userInfo) {
        return res
          .status(404)
          .json({ message: "User not found with the provided email." });
      }

      return res.json({
        message: `See the specific information of user: ${email}`,
        userInfo,
      });
    } catch (err) {
      console.error("Error retrieving user info:", err);
      return res.status(500).json({ error: "Failed to retrieve user info." });
    }
  }

  @Put(":email")
  async EditUser(
    @Param("email") email: string,
    @Body() userData: EditUserDto,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const validEmail = this.validateEmail(email);
      if (!validEmail) {
        return res
          .status(400)
          .json({ message: "User email is required to edit a specific user." });
      }

      const { firstName, lastName, password, role } = userData;
      if (firstName === "" || lastName === "" || password === "") {
        return res.status(400).json({
          message:
            "firstname, lastname, and password must not be empty strings.",
        });
      }

      if (role) {
        const validRoles = [$Enums.Role.STAFF, $Enums.Role.MANAGER];
        if (!validRoles.includes(role)) {
          return res.status(400).json({
            message:
              "You either select the user role to be a staff or a manager.",
          });
        }
      }

      const existingUser = await this.userService.FindUser({ email });
      if (!existingUser) {
        return res.status(404).json({ message: "User not found." });
      }

      const newUserData = {
        email,
        firstName,
        lastName,
        password,
        role,
      };

      const updatedUser = await this.userService.UpdateUser({
        where: { email },
        data: newUserData,
      });
      if (!updatedUser) {
        return res
          .status(500)
          .json({ message: "Failed to update the user information." });
      }

      return res.json({
        message: `Updated the information of the user: ${email}`,
      });
    } catch (err) {
      console.error("Error editing user info:", err);
      return res.status(500).json({ error: "Failed to edit user info." });
    }
  }

  @Delete(":email")
  async RemoveUser(
    @Param("email") email: string,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const validEmail = this.validateEmail(email);
      if (!validEmail) {
        return res
          .status(400)
          .json({ message: "User email is required to remove specific user." });
      }

      const user = await this.userService.FindUser({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      await this.userService.DeleteUser({ email });

      return res.json({
        message: `Removed the user: ${email} from the database`,
      });
    } catch (err) {
      console.error("Error deleting user:", err);
      return res.status(500).json({ error: "Failed to delete user." });
    }
  }

  @Get("branch")
  async GetBranchUser(
    @Headers("Branch-Payload") branchPayload: string,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const parsedBranchPayload = JSON.parse(
        branchPayload || "{}"
      ) as BranchPayloadDto;
      if (!parsedBranchPayload) {
        return res
          .status(500)
          .json({ message: "Failed to fetch the users of the branch." });
      }

      const { branchId } = parsedBranchPayload;

      const branchUsers = await this.userService.GetUsersByBranch({
        branchId: BigInt(branchId),
      });

      return res.json({
        message: "Get users of the branch.",
        branch_users: branchUsers,
      });
    } catch (err) {
      console.error("Error fetching branch users:", err);
      return res
        .status(500)
        .json({ error: "Failed to fetch the users of the branch." });
    }
  }
}
