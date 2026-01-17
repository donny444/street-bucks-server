import { Injectable } from "@nestjs/common";
import { PrismaClient, Prisma, User, $Enums } from "../../prisma/client";

import * as bcrypt from "bcryptjs";

import { UserInfoDto } from "../dtos/user.dto";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaClient) {}

  serializeBranchId(userInfo: UserInfoDto): UserInfoDto {
    return {
      ...userInfo,
      branchId: Number(userInfo.branchId),
    };
  }

  async InsertUser(
    data: Prisma.UserUncheckedCreateInput
  ): Promise<User | Error> {
    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);

      const newUser = await this.prisma.user.create({
        data: {
          ...data,
          password: hashedPassword,
          branchId: data.branchId || 1, // workaround
          role: $Enums.Role.STAFF,
        },
      });

      return newUser;
    } catch (err) {
      console.error("Error inserting new user:", err);
      return Error(err as string);
    }
  }

  async ToggleAttendance(where: Prisma.UserWhereUniqueInput) {
    const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date().setHours(23, 59, 59, 999));

    const userEmail = where.email as string;

    const existedAttendance = await this.prisma.attendance.findFirst({
      where: {
        userId: userEmail,
        dateTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (existedAttendance) {
      return this.prisma.attendance.deleteMany({
        where: {
          userId: existedAttendance.userId,
          dateTime: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });
    } else {
      return this.prisma.attendance.create({
        data: { userId: userEmail },
      });
    }
  }

  async FindUser(where: Prisma.UserWhereUniqueInput) {
    const userInfo = await this.prisma.user.findUnique({
      select: {
        firstName: true,
        lastName: true,
        branchId: true,
      },
      where,
    });
    if (!userInfo) {
      return null;
    }

    const serializedUserInfo = this.serializeBranchId(userInfo);

    return serializedUserInfo;
  }

  async UpdateUser(params: {
    data: Prisma.UserUncheckedUpdateInput;
    where: Prisma.UserWhereUniqueInput;
  }): Promise<Prisma.Prisma__UserClient<Prisma.UserUncheckedUpdateInput>> {
    return this.prisma.user.update({
      data: params.data,
      where: params.where,
    });
  }

  async DeleteUser(where: Prisma.UserWhereUniqueInput) {
    const user = await this.prisma.$transaction(async (prisma) => {
      await prisma.attendance.deleteMany({
        where: {
          userId: where.email,
        },
      });
      await prisma.user.delete({ where });
    });

    return user;
  }
}
