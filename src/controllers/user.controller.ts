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

import { RegisterDto, EditUserDto, BranchUserDto } from "../dtos/user.dto";
import { BranchPayloadDto } from "../dtos/branch.dto";
import { $Enums } from "../../prisma/client";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  private validateEmail(email: string): boolean {
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
        return res.status(500).json({
          message:
            "Failed to parse branch payload from `branch-payload` request header.",
        });
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
      if (existingUser instanceof Error) {
        console.error("Error occurred in `FindUser`:", existingUser);
        return res
          .status(500)
          .json({ message: "Failed to check existing user with the email." });
      }
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
      if (newUser instanceof Error) {
        console.error("Error occurred in `InsertUser`:", newUser);
        return res
          .status(500)
          .json({ message: "Failed to register the new user." });
      }

      return res.json({
        message: "User registered to the system successfully.",
      });
    } catch (err) {
      console.error("Error occurred in `RegisterUser`:", err);
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
      if (existingUser instanceof Error) {
        console.error("Error occurred in `FindUser`:", existingUser);
        return res
          .status(500)
          .json({ message: "Failed to check existing user with the email." });
      }
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
      console.error("Error occurred in `AttendUser`:", err);
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
      if (userInfo instanceof Error) {
        console.error("Error occurred in `FindUser`:", userInfo);
        return res
          .status(500)
          .json({ message: "Failed to retrieve user information." });
      }
      if (!userInfo) {
        return res
          .status(404)
          .json({ message: "User not found with the provided email." });
      }

      return res.json({
        message: `See the specific information of user: ${email}`,
        user_info: userInfo,
      });
    } catch (err) {
      console.error("Error occurred in `GetUserInfo`:", err);
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
          .json({ message: "User email must be in valid pattern." });
      }

      const { firstName, lastName, role, password } = userData;
      const newEmail = userData.email;
      if (!newEmail || !firstName || !lastName || !role || !password) {
        return res.status(400).json({
          message: "All input fields are required.",
        });
      }

      const validNewEmail = this.validateEmail(newEmail);
      if (!validNewEmail) {
        return res.status(400).json({
          message: "New user email must be in valid pattern.",
        });
      }

      const validRoles = [$Enums.Role.STAFF, $Enums.Role.MANAGER];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          message:
            "You either select the user role to be a staff or a manager.",
        });
      }

      const existingUser = await this.userService.FindUser({ email });
      if (existingUser instanceof Error) {
        console.error("Error occurred in `FindUser`:", existingUser);
        return res
          .status(500)
          .json({ message: "Failed to check existing user with the email." });
      }
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
      if (updatedUser instanceof Error) {
        console.error("Error occurred in `UpdateUser`:", updatedUser);
        return res
          .status(500)
          .json({ message: "Failed to update the user information." });
      }

      return res.json({
        message: `Updated the information of the user: ${email}`,
      });
    } catch (err) {
      console.error("Error occurred in `EditUser`:", err);
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
      if (user instanceof Error) {
        console.error("Error occurred in `FindUser`:", user);
        return res
          .status(500)
          .json({ message: "Failed to check existing user with the email." });
      }
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      const deletedUser = await this.userService.DeleteUser({ email });
      if (deletedUser instanceof Error) {
        console.error("Error occurred in `DeleteUser`:", deletedUser);
        return res.status(500).json({ message: "Failed to delete the user." });
      }

      return res.json({
        message: `Removed the user: ${email} from the database`,
      });
    } catch (err) {
      console.error("Error occurred in `RemoveUser`:", err);
      return res.status(500).json({ error: "Failed to remove the user." });
    }
  }

  @Get()
  async GetBranchUsers(
    @Headers("Branch-Payload") branchPayload: string,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const parsedBranchPayload = JSON.parse(
        branchPayload || "{}"
      ) as BranchPayloadDto;
      if (!parsedBranchPayload) {
        return res.status(500).json({
          message:
            "Failed to parse branch payload from `branch-payload` request header.",
        });
      }

      const { branchId } = parsedBranchPayload;

      const branchUsers = await this.userService.GetUsersByBranch({
        branchId: BigInt(branchId),
      });
      if (branchUsers instanceof Error) {
        console.error("Error occurred in `GetUsersByBranch`:", branchUsers);
        return res
          .status(500)
          .json({ message: "Failed to retrieve the users of the branch." });
      }

      const processedBranchUsers: BranchUserDto[] = branchUsers.map((user) => {
        let attended = false;
        if (user.attendances.length > 0) {
          attended = true;
        }

        return {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          attended,
        };
      });

      return res.json({
        message: "Get users of the branch.",
        branch_users: processedBranchUsers,
      });
    } catch (err) {
      console.error("Error occurred in `GetBranchUsers`:", err);
      return res
        .status(500)
        .json({ error: "Failed to retrieve users of the branch." });
    }
  }
}
