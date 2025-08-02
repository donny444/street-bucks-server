import { Controller, Delete, Get, Post, Put, Param } from '@nestjs/common';
import { AppService } from '../app.service';

@Controller("staffs")
export class StaffsController {
  constructor(private readonly appService: AppService) {}

  @Post()
  RegisterStaff(): string {
    return "Register a new staff.";
  }

  @Post(":id")
  CheckInStaff(@Param() params: any): string {
    return "Check-in operation for staff attendance.";
  }

  @Get(":id")
  GetStaffInfo(@Param() params: any): string {
    return "See a specific staff information.";
  }

  @Put(":id")
  EditStaffInfo(@Param() params: any): string {
    return "Manipulate a specific staff information.";
  }

  @Delete(":id")
  DeleteAStaff(@Param() params: any): string {
    return "Delete a specific staff.";
  }
}