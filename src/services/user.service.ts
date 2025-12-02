import { Injectable } from "@nestjs/common";
import { PrismaClient, Prisma } from "../../prisma/client";
import { start } from "repl";

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaClient,
    private startOfDay = new Date().setHours(0, 0, 0, 0),
    private startToday = new Date(startOfDay),
    private endOfDay = new Date().setHours(23, 59, 59, 999),
    private endToday = new Date(endOfDay),
  ) {}

  async InsertUser(data: Prisma.UserUncheckedCreateInput) {
    return this.prisma.user.create({
      data,
    });
  }

  async InsertAttendance(where: Prisma.UserWhereUniqueInput) {
    const userUuid = where.uuid;
    if (!userUuid) {
      throw new Error("User uuid is required to record attendance.");
    }

    const existedAttendance = await this.prisma.attendance.findFirst({
      where: {
        userId: userUuid,
        dateTime: {
          in: [this.startToday, this.endToday],
        },
      },
    });
    if (existedAttendance) {
      throw new Error("Attendance for today already recorded.");
    }

    return this.prisma.attendance.create({
      data: { userId: userUuid },
    });
  }

  async RemoveAttendance(where: Prisma.UserWhereUniqueInput) {
    const userUuid = where.uuid;
    if (!userUuid) {
      throw new Error("User uuid is required to remove attendance.");
    }

    return this.prisma.attendance.deleteMany({
      where: {
        userId: userUuid,
        dateTime: {
          in: [this.startToday, this.endToday]
        },
      },
    });
  }

  async GetUser(where: Prisma.UserWhereUniqueInput) {
    return this.prisma.user.findUnique({
      select: {
        firstName: true,
        lastName: true,
        branchId: true,
      },
      where,
    });
  }

  async UpdateUser(params: {
    data: Prisma.UserUncheckedUpdateInput;
    where: Prisma.UserWhereUniqueInput;
  }) {
    return this.prisma.user.update({
      data: params.data,
      where: params.where,
    });
  }

  async DeleteUser(where: Prisma.UserWhereUniqueInput) {
    const user = await this.prisma.$transaction(async (prisma) => {
      await prisma.attendance.deleteMany({
        where: {
          userId: where.uuid,
        },
      });
      await prisma.user.delete({
        where: {
          uuid: where.uuid,
        },
      });
    });

    return user;
  }
}
