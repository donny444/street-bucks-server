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

import { StaffService } from "../services/staff.service";
import type { Prisma } from "../../prisma/client";

type StaffIdentifier = Required<Pick<Prisma.StaffWhereUniqueInput, "uuid">>;
type StaffCreateRequest = Prisma.StaffUncheckedCreateInput;
type StaffUpdateRequest = Prisma.StaffUncheckedUpdateInput & StaffIdentifier;

@Controller("staffs")
export class StaffController {
  constructor(private readonly staffsService: StaffService) {}

  @Post()
  async RegisterStaff(
    @Body() staffData: StaffCreateRequest,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const { firstName, lastName, password, uuid } = staffData;

      if (!firstName || !lastName || !password) {
        return res.status(400).json({
          message: "First name, last name, and password are required.",
        });
      }

      const existingStaff = uuid
        ? await this.staffsService.GetStaff({ uuid })
        : null;
      if (existingStaff) {
        return res.status(409).json({ message: "Staff already exists." });
      }

      await this.staffsService.InsertStaff(staffData);

      return res.json({
        message: "Staff registered successfully.",
      });
    } catch (err) {
      console.error("Error registering staff:", err);
      return res.status(500).json({ error: "Failed to register staff." });
    }
  }

  @Post(":uuid")
  async CheckInStaff(
    @Param("uuid") uuid: string,
    @Body("status") status: boolean,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const existingStaff = await this.staffsService.GetStaff({ uuid });
      if (!existingStaff) {
        return res.status(404).json({ message: "Staff not found." });
      }

      if (status) {
        await this.staffsService.InsertAttendance({ uuid });
      } else {
        await this.staffsService.RemoveAttendance({ uuid });
      }

      return res.json({
        message: `Staff: ${uuid} check status: ${status}`,
      });
    } catch (err) {
      console.error("Error checking in staff:", err);
      return res.status(500).json({ error: "Failed to check in staff." });
    }
  }

  @Get(":uuid")
  async StaffInfo(
    @Param("uuid") uuid: string,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const staff = await this.staffsService.GetStaff({ uuid });
      if (!staff) {
        return res.status(404).json({ message: "Staff not found." });
      }

      return res.json({
        message: `See the specific information of staff: ${uuid}`,
      });
    } catch (err) {
      console.error("Error retrieving staff info:", err);
      return res.status(500).json({ error: "Failed to retrieve staff info." });
    }
  }

  @Put()
  async EditStaff(
    @Body() staffData: StaffUpdateRequest,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const { uuid, ...updateFields } = staffData;
      const { firstName, lastName, password } = staffData;

      if (!uuid || !firstName || !lastName || !password) {
        return res.status(400).json({
          message: "UUID, first name, last name, and password are required.",
        });
      }

      const existingStaff = await this.staffsService.GetStaff({ uuid });
      if (!existingStaff) {
        return res.status(404).json({ message: "Staff not found." });
      }

      await this.staffsService.UpdateStaff({
        where: { uuid },
        data: updateFields,
      });

      return res.json({
        message: `Manipulate the information of staff: ${uuid}`,
      });
    } catch (err) {
      console.error("Error editing staff info:", err);
      return res.status(500).json({ error: "Failed to edit staff info." });
    }
  }

  @Delete(":uuid")
  @HttpCode(204)
  async RemoveStaff(
    @Param("uuid") uuid: string,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const staff = await this.staffsService.GetStaff({ uuid });
      if (!staff) {
        return res.status(404).json({ message: "Staff not found." });
      }

      await this.staffsService.DeleteStaff({ uuid });

      return res.json({
        message: `Delete all information of staff: ${uuid}`,
      });
    } catch (err) {
      console.error("Error deleting staff:", err);
      return res.status(500).json({ error: "Failed to delete staff." });
    }
  }
}
