import { Injectable } from "@nestjs/common";
import { PrismaClient } from "../../prisma/client";
import StaffDto from "../dtos/staff.dto";

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaClient) {}

  async InsertStaff(staffData: StaffDto) {
    return this.prisma.staff.create({
      data: { ...staffData },
    });
  }

  async InsertAttendance(staffData: StaffDto) {
    return this.prisma.attendance.create({
      data: { staffId: staffData.uuid },
    });
  }

  async RemoveAttendance(staffData: StaffDto) {
    const startToday = new Date().setHours(0, 0, 0, 0);
    const endToday = new Date().setHours(23, 59, 59, 999);

    return this.prisma.attendance.deleteMany({
      where: {
        staffId: staffData.uuid,
        dateTime: {
          gte: new Date(startToday),
          lte: new Date(endToday),
        },
      },
    });
  }

  async GetStaff(staffData: StaffDto) {
    return this.prisma.staff.findUnique({
      select: {
        firstName: true,
        lastName: true,
        branchId: true,
        isManager: true,
        isAdmin: true,
      },
      where: { uuid: staffData.uuid },
    });
  }

  async UpdateStaff(staffData: StaffDto) {
    return this.prisma.staff.update({
      data: { ...staffData },
      where: { uuid: staffData.uuid },
    });
  }

  async DeleteStaff(staffData: StaffDto) {
    return this.prisma.staff.delete({
      where: { uuid: staffData.uuid },
    });
  }
}
