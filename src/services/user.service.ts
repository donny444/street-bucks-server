import { Injectable } from "@nestjs/common";
import { PrismaClient, Prisma } from "../../prisma/client";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaClient) {}

  async InsertUser(data: Prisma.UserUncheckedCreateInput) {
    return this.prisma.user.create({
      data: {
        ...data,
        branchId: data.branchId || 1, // workaround
        role: "STAFF",
      },
    });
  }

  async ToggleAttendance(where: Prisma.UserWhereUniqueInput) {
    const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date().setHours(23, 59, 59, 999));
    const userUuid = where.uuid;
    if (!userUuid) {
      throw new Error("User uuid is required to record attendance.");
    }

    const existedAttendance = await this.prisma.attendance.findFirst({
      where: {
        userId: userUuid,
        dateTime: {
          in: [startOfDay, endOfDay],
        },
      },
    });

    if (existedAttendance) {
      return this.prisma.attendance.deleteMany({
        where: {
          userId: existedAttendance.uuid,
          dateTime: {
            in: [startOfDay, endOfDay],
          },
        },
      });
    } else {
      return this.prisma.attendance.create({
        data: { userId: userUuid },
      });
    }
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
