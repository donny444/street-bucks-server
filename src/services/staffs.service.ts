import { Injectable } from "@nestjs/common";
import { PrismaClient } from "../../prisma/client";
import StaffDataDto from "../dtos/staff_data.dto";

@Injectable()
export class StaffsService {
  constructor(private prisma: PrismaClient) {}

  async InsertStaff(staffData: StaffDataDto) {
    return this.prisma.staff.create({
      data: { ...staffData },
    });
  }

  async InsertAttendance(staffData: StaffDataDto) {
    return this.prisma.attendance.create({
      data: { staffId: staffData.uuid! },
    });
  }

  async GetStaff(staffData: StaffDataDto) {
    return this.prisma.staff.findUnique({
      select: {
        firstName: true,
        lastName: true,
        branchId: true,
        isManager: true,
        isAdmin: true,
      },
      where: { uuid: staffData.uuid! },
    });
  }

  async UpdateStaff(staffData: StaffDataDto) {
    return this.prisma.staff.update({
      data: { ...staffData },
      where: { uuid: staffData.uuid! },
    });
  }

  async DeleteStaff(staffData: StaffDataDto) {
    return this.prisma.staff.delete({
      where: { uuid: staffData.uuid! },
    });
  }
}
