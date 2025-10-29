import { Injectable } from "@nestjs/common";
import { PrismaClient, Prisma } from "../../prisma/client";

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaClient) {}

  async InsertStaff(staffData: Prisma.StaffUncheckedCreateInput) {
    return this.prisma.staff.create({
      data: staffData,
    });
  }

  async InsertAttendance(where: Prisma.StaffWhereUniqueInput) {
    const staffUuid = where.uuid;
    if (!staffUuid) {
      throw new Error("Staff uuid is required to record attendance.");
    }

    return this.prisma.attendance.create({
      data: { staffId: staffUuid },
    });
  }

  async RemoveAttendance(where: Prisma.StaffWhereUniqueInput) {
    const startToday = new Date().setHours(0, 0, 0, 0);
    const endToday = new Date().setHours(23, 59, 59, 999);
    const staffUuid = where.uuid;
    if (!staffUuid) {
      throw new Error("Staff uuid is required to remove attendance.");
    }

    return this.prisma.attendance.deleteMany({
      where: {
        staffId: staffUuid,
      },
    });
  }

  async GetStaff(where: Prisma.StaffWhereUniqueInput) {
    return this.prisma.staff.findUnique({
      select: {
        firstName: true,
        lastName: true,
        branchId: true,
        isManager: true,
        isAdmin: true,
      },
      where,
    });
  }

  async UpdateStaff(params: {
    data: Prisma.StaffUncheckedUpdateInput;
    where: Prisma.StaffWhereUniqueInput;
  }) {
    return this.prisma.staff.update({
      data: params.data,
      where: params.where,
    });
  }

  async DeleteStaff(where: Prisma.StaffWhereUniqueInput) {
    return this.prisma.staff.delete({
      where,
    });
  }
}
