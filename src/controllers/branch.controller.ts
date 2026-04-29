import { Body, Controller, Get, HttpCode, Post, Res } from "@nestjs/common";
import { Response } from "express";

import * as bcrypt from "bcryptjs";
import { sign as jwtSign } from "jsonwebtoken";

import { BranchService } from "../services/branch.service";
import { SignInDto, CreateBranchDto } from "../dtos/branch.dto";

@Controller("branches")
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post("sign-in")
  async SignInBranch(
    @Body() signInData: SignInDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const { branchId, password } = signInData;

      if (!branchId || !password) {
        return res
          .status(400)
          .json({ message: "Branch ID and password are required." });
      }

      const branchInfo = await this.branchService.FindBranch({ id: branchId });
      if (branchInfo instanceof Error) {
        console.error("Error occurred in `FindBranch`:", branchInfo);
        return res.status(500).json({ error: branchInfo.message });
      }
      if (!branchInfo) {
        return res
          .status(404)
          .json({ message: "No branch exists with the provided ID" });
      }

      const correctPassword = await bcrypt.compare(
        password,
        branchInfo.password,
      );
      if (!correctPassword) {
        return res
          .status(401)
          .json({ message: "Incorrect password for the provided one." });
      }

      const jwtSecret = process.env.BRANCH_JWT_SECRET;
      if (!jwtSecret) {
        console.error("Missing JWT secret for branch sign-in");
        return res.status(500).json({ error: "Error signing in a branch." });
      }

      const jwtPayload = { branchId: Number(branchInfo.id) };

      const token = jwtSign(jwtPayload, jwtSecret, { expiresIn: 86400 });

      return res.json({ message: "Branch signed in successfully.", token });
    } catch (err) {
      console.error("Error occurred in `SignInBranch`:", err);
      return res.status(500).json({ error: "Failed to sign in to a branch." });
    }
  }

  @Post()
  @HttpCode(201)
  async CreateBranch(
    @Body() branchData: CreateBranchDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const { password } = branchData;
      if (!password) {
        return res
          .status(400)
          .json({ message: "Password is required to create a branch." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newBranch = await this.branchService.InsertBranch({
        password: hashedPassword,
      });
      if (newBranch instanceof Error) {
        console.error("Error occurred in `InsertBranch`:", newBranch);
        return res
          .status(500)
          .json({ error: "Failed to create a new branch." });
      }

      return res.json({
        message: "Branch created successfully.",
      });
    } catch (err) {
      console.error("Error occurred in `CreateBranch`:", err);
      return res.status(500).json({ error: "Failed to create a new branch." });
    }
  }

  @Get()
  async GetBranches(@Res() res: Response): Promise<Response> {
    try {
      const branchIds = await this.branchService.SelectBranches();
      if (branchIds instanceof Error) {
        console.error("Error occurred in `SelectBranches`:", branchIds);
        return res
          .status(500)
          .json({ error: "Failed to find available branches." });
      }

      return res.json({
        message: "Returned array of branch IDs",
        branch_ids: branchIds,
      });
    } catch (err) {
      console.error("Error occurred in `GetBranches`:", err);
      return res.status(500).json({ error: "Failed to retrieve branch IDs." });
    }
  }
}
