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

import * as bcrypt from "bcryptjs";
import { sign as jwtSign } from "jsonwebtoken";

import { BranchService } from "../services/branch.service";

import { SignInDto } from "../dtos/branch.dto";

@Controller("branches")
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post("signin")
  @HttpCode(200)
  async SignInBranch(
    @Body() signInData: SignInDto,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const { branchId, password } = signInData;

      if (!branchId || !password) {
        return res
          .status(400)
          .json({ message: "Branch ID and password are required." });
      }

      const branchInfo = await this.branchService.FindBranch({ id: branchId });
      if (!branchInfo) {
        return res
          .status(404)
          .json({ message: "No branch exists with the provided ID" });
      }

      const correctPassword = await bcrypt.compare(
        password,
        branchInfo.password
      );
      if (!correctPassword) {
        return res
          .status(401)
          .json({ message: "Incorrect password for the provided one." });
      }

      const jwtSecret = process.env.BRANCH_JWT_SECRET;
      if (!jwtSecret) {
        console.error("Missing JWT secret for branch sign-in");
        return res.status(500).json({ error: "Failed to sign in branch." });
      }

      const jwtPayload = { branchId: Number(branchInfo.id) };

      const token = jwtSign(jwtPayload, jwtSecret, { expiresIn: 86400 });

      return res.json({ message: "Branch signed in successfully.", token });
    } catch (err) {
      console.error("Error signing in branch:", err);
      return res.status(500).json({ error: "Failed to sign in branch." });
    }
  }
}
