import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Put,
  Param,
  Res,
  Query,
} from "@nestjs/common";
import { Response } from "express";

import * as bcrypt from "bcryptjs";
import { sign as jwtSign } from "jsonwebtoken";

import { UserService } from "../services/user.service";
import { BranchPayload } from "../decorators/branch-payload.decorator";

import {
  RegisterDto,
  EditUserDto,
  UserEntryDto,
  CredentialsDto,
} from "../dtos/user.dto";
import { BranchPayloadDto } from "../dtos/branch.dto";
import { Prisma, $Enums } from "../../prisma/client";

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
    @BranchPayload() { branchId }: BranchPayloadDto,
    @Body() userData: RegisterDto,
    @Res() res: Response
  ): Promise<Response> {
    try {
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

      const existingUser = await this.userService.CheckUserExists(email);
      if (existingUser instanceof Error) {
        console.error("Error occurred in `CheckUserExists`:", existingUser);
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

      const existingUser = await this.userService.CheckUserExists(email);
      if (existingUser instanceof Error) {
        console.error("Error occurred in `CheckUserExists`:", existingUser);
        return res
          .status(500)
          .json({ message: "Failed to check existing user with the email." });
      }
      if (!existingUser) {
        return res
          .status(404)
          .json({ message: "User not found with the provided email." });
      }

      const insertedAttendance = await this.userService.InsertAttendance({
        email,
      });
      if (insertedAttendance instanceof Error) {
        console.error(
          "Error occurred in `InsertAttendance`:",
          insertedAttendance
        );
        return res
          .status(500)
          .json({ message: "Failed to record attendance for the user." });
      }
      if (insertedAttendance) {
        return res.status(400).json({
          message: "The user has been attendedfor today.",
        });
      }

      return res.json({
        message: `User: ${email} attendance status for today has been switched`,
      });
    } catch (err) {
      console.error("Error occurred in `AttendUser`:", err);
      return res.status(500).json({ error: "Failed to check in user." });
    }
  }

  @Post("sign-in/administrator")
  async SignInAdministrator(
    @Body() credentials: CredentialsDto,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const { email, password } = credentials;

      if (!email || !password) {
        return res.status(400).json({
          message: "Email and password are required for administrator sign-in.",
        });
      }

      const validEmail = this.validateEmail(email);
      if (!validEmail) {
        return res.status(400).json({
          message:
            "The email provided is not in valid format for administrator sign-in.",
        });
      }

      const user = await this.userService.FindUser({ email });
      if (user instanceof Error) {
        console.error("Error occurred in `FindUser`:", user);
        return res
          .status(500)
          .json({ message: "Failed to find the user with the email." });
      }
      if (!user) {
        return res
          .status(404)
          .json({ message: "User not found with the provided email." });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res
          .status(401)
          .json({ message: "Incorrect password for administrator sign-in." });
      }

      if (user.role !== $Enums.Role.ADMINISTRATOR) {
        return res.status(403).json({
          message: "User does not have administrator privileges.",
        });
      }

      const jwtSecret = process.env.BRANCH_JWT_SECRET;
      if (!jwtSecret) {
        console.error("Missing JWT secret for branch sign-in");
        return res.status(500).json({ error: "Error signing in a branch." });
      }

      const jwtPayload = { email };

      const token = jwtSign(jwtPayload, jwtSecret, { expiresIn: 86400 });

      return res.json({
        message: "Administrator signed in successfully.",
        token,
      });
    } catch (err) {
      console.error("Error occurred in `SignInAdministrator`:", err);
      return res
        .status(500)
        .json({ error: "Failed to sign in as an administrator." });
    }
  }

  @Get("search")
  async SearchUsersByName(
    @Query("name") name: string,
    @Res() res: Response
  ): Promise<Response> {
    try {
      if (!name) {
        return res.status(400).json({
          message: "Name query parameter is required to search users by name.",
        });
      }

      const foundUsers = await this.userService.FindUsersByName(name);
      if (foundUsers instanceof Error) {
        console.error("Error occurred in `SearchUsersByName`:", foundUsers);
        return res
          .status(500)
          .json({ message: "Failed to search users by name." });
      }
      if (!foundUsers || foundUsers.length < 1) {
        return res
          .status(404)
          .json({ message: "No users found matching the name query." });
      }

      const serializedFoundUsers: UserEntryDto[] = foundUsers.map((user) => ({
        ...user,
        branchId: Number(user.branchId),
      }));

      return res.json({
        message: `Users found from the search name: ${name}`,
        found_users: serializedFoundUsers,
      });
    } catch (err) {
      console.error("Error occurred in `SearchUsersByName`:", err);
      return res.status(500).json({ error: "Failed to search users by name." });
    }
  }

  @Get(":email")
  async GetUserForm(
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

      const userForm = await this.userService.FindUserForm({ email });
      if (userForm instanceof Error) {
        console.error("Error occurred in `FindUserForm`:", userForm);
        return res
          .status(500)
          .json({ message: "Failed to find form values of a user." });
      }
      if (!userForm) {
        return res
          .status(404)
          .json({ message: "User not found with the provided email." });
      }

      return res.json({
        message: `See the specific information of user: ${email}`,
        user_form: userForm,
      });
    } catch (err) {
      console.error("Error occurred in `GetUserForm`:", err);
      return res
        .status(500)
        .json({ error: "Failed to get form values of a user." });
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
      if (!newEmail || !firstName || !lastName || !role) {
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

      const existingUser = await this.userService.CheckUserExists(email);
      if (existingUser instanceof Error) {
        console.error("Error occurred in `CheckUserExists`:", existingUser);
        return res
          .status(500)
          .json({ message: "Failed to check existing user with the email." });
      }
      if (!existingUser) {
        return res.status(404).json({ message: "User not found." });
      }

      let newUserData: Prisma.UserUncheckedUpdateInput;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        newUserData = {
          email: newEmail,
          firstName,
          lastName,
          role,
          password: hashedPassword,
        };
      } else {
        newUserData = {
          email: newEmail,
          firstName,
          lastName,
          role,
        };
      }

      const updatedUser = await this.userService.UpdateUser({
        data: newUserData,
        where: { email },
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

  @Post(":email/removal")
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

      const user = await this.userService.CheckUserExists(email);
      if (user instanceof Error) {
        console.error("Error occurred in `CheckUserExists`:", user);
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
    @BranchPayload() { branchId }: BranchPayloadDto,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const branchUsers = await this.userService.GetUsersByBranch({
        branchId: BigInt(branchId),
      });
      if (branchUsers instanceof Error) {
        console.error("Error occurred in `GetUsersByBranch`:", branchUsers);
        return res
          .status(500)
          .json({ message: "Failed to retrieve the users of the branch." });
      }

      const processedBranchUsers = branchUsers.map((user) => {
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
