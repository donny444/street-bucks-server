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

import { AppService } from "../app.service";
import StaffDataDto from "../dtos/staff_data.dto";

@Controller("staffs")
export class StaffsController {
  constructor(private readonly appService: AppService) {}

  @Post()
  RegisterStaff(
    @Body() staffData: StaffDataDto,
    @Res() res: Response
  ): Response {
    try {
      const { firstName = "", lastName = "", password = "" } = staffData;

      if (!firstName || !lastName || !password) {
        return res.status(400).json({
          message: "First name, last name, and password are required.",
        });
      }

      return res.json({
        message: "Staff registered successfully.",
      });
    } catch (err) {
      console.error("Error registering staff:", err);
      return res.status(500).json({ error: "Failed to register staff." });
    }
  }

  @Post(":id")
  CheckInStaff(
    @Param() params: any,
    @Body("status") status: boolean,
    @Res() res: Response
  ): Response {
    try {
      return res.json({
        message: `Staff: ${params.id} check status: ${status}`,
      });
    } catch (err) {
      console.error("Error checking in staff:", err);
      return res.status(500).json({ error: "Failed to check in staff." });
    }
  }

  @Get(":id")
  StaffInfo(@Param() params: any, @Res() res: Response): Response {
    try {
      return res.json({
        message: `See the specific information of staff: ${params.id}`,
      });
    } catch (err) {
      console.error("Error retrieving staff info:", err);
      return res.status(500).json({ error: "Failed to retrieve staff info." });
    }
  }

  @Put(":id")
  EditStaff(
    @Param("id") id: string,
    @Body() staffData: StaffDataDto,
    @Res() res: Response
  ): Response {
    try {
      console.log(staffData.firstName);
      console.log(staffData.lastName);
      console.log(staffData.password);
      return res.json({
        message: `Manipulate the information of staff: ${id}`,
      });
    } catch (err) {
      console.error("Error editing staff info:", err);
      return res.status(500).json({ error: "Failed to edit staff info." });
    }
  }

  @Delete(":id")
  @HttpCode(204)
  RemoveStaff(@Param() params: any, @Res() res: Response): Response {
    try {
      return res.json({
        message: `Delete all information of staff: ${params.id}`,
      });
    } catch (err) {
      console.error("Error deleting staff:", err);
      return res.status(500).json({ error: "Failed to delete staff." });
    }
  }
}
