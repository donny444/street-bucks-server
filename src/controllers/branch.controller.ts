import { Body, Controller, Get, HttpCode, Post, Res } from "@nestjs/common";
import { Response } from "express";

import { Branch } from "../../prisma/client";

import * as bcrypt from "bcryptjs";
import { sign as jwtSign } from "jsonwebtoken";

import { BranchService } from "../services/branch.service";

import {
  SignInDto,
  SerializedBranchId,
  CreateBranchDto,
} from "../dtos/branch.dto";

@Controller("branches")
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  serializeBranchId(branch: Branch): SerializedBranchId {
    return Number(branch.id);
  }

  @Post("sign-in")
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
      if (branchInfo instanceof Error) {
        return res
          .status(500)
          .json({ error: "Failed to sign in to a branch." });
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
      return res.status(500).json({ error: "Failed to sign in to a branch." });
    }
  }

  @Post()
  async CreateBranch(
    @Body() branchData: CreateBranchDto,
    @Res() res: Response
  ): Promise<Response> {
    const { password } = branchData;
    if (!password) {
      return res
        .status(400)
        .json({ message: "Password is required to create a branch." });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const newBranch = await this.branchService.InsertBranch({
        password: hashedPassword,
      });
      if (newBranch instanceof Error) {
        return res
          .status(500)
          .json({ error: "Failed to create a new branch." });
      }

      const serializedBranchId = this.serializeBranchId(newBranch);

      return res.status(201).json({
        message: `Branch created successfully with the id: #${serializedBranchId}.`,
      });
    } catch (err) {
      console.error("Error creating new branch:", err);
      return res.status(500).json({ error: "Failed to create a new branch." });
    }
  }

  @Get()
  async GetBranches(@Res() res: Response): Promise<Response> {
    try {
      const branchIds = await this.branchService.SelectBranches();
      if (branchIds instanceof Error) {
        return res
          .status(500)
          .json({ error: "Failed to fetch branches from the database." });
      }

      return res.json({
        message: "Returned array of branch IDs",
        branch_ids: branchIds,
      });
    } catch (err) {
      console.error("Error fetching branches:", err);
      return res.status(500).json({ error: "Failed to retrieve branch IDs." });
    }
  }
}
