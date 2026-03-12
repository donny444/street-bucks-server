import { Injectable } from "@nestjs/common";
import { PrismaClient, Prisma, $Enums } from "../../prisma/client";

import * as bcrypt from "bcryptjs";

import { UserInfoDto, BranchUserDto } from "../dtos/user.dto";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaClient) {}

  private serializeBranchId(userInfo: UserInfoDto): UserInfoDto {
    return {
      ...userInfo,
      branchId: Number(userInfo.branchId),
    };
  }

  private toError(tag: string, err: unknown): Error {
    return new Error(
      `${tag}: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  async InsertUser(
    data: Prisma.UserUncheckedCreateInput
  ): Promise<void | Error> {
    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      try {
        await this.prisma.user.create({
          data: {
            ...data,
            password: hashedPassword,
            branchId: data.branchId,
            role: $Enums.Role.STAFF,
          },
        });
      } catch (err) {
        throw this.toError("Failed to insert a user", err);
      }
    } catch (err) {
      console.error("Error inserting new user:", err);
      return err instanceof Error ? err : new Error(String(err));
    }
  }

  async ToggleAttendance(
    where: Prisma.UserWhereUniqueInput
  ): Promise<void | Error> {
    try {
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
        try {
          await this.prisma.attendance.deleteMany({
            where: {
              userId: existedAttendance.userId,
              dateTime: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
          });
        } catch (err) {
          throw this.toError(
            "Failed to delete today attendance of the user",
            err
          );
        }
      } else {
        try {
          await this.prisma.attendance.create({
            data: { userId: userEmail },
          });
        } catch (err) {
          throw this.toError(
            "Failed to create today attendance for the user",
            err
          );
        }
      }
    } catch (err) {
      console.error("Error toggling attendance:", err);
      return err instanceof Error ? err : new Error(String(err));
    }
  }

  async FindUser(
    where: Prisma.UserWhereUniqueInput
  ): Promise<UserInfoDto | null | Error> {
    try {
      try {
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
      } catch (err) {
        throw this.toError("Failed to find a specific user", err);
      }
    } catch (err) {
      console.error("Error finding user:", err);
      return err instanceof Error ? err : new Error(String(err));
    }
  }

  async UpdateUser(params: {
    data: Prisma.UserUncheckedUpdateInput;
    where: Prisma.UserWhereUniqueInput;
  }): Promise<void | Error> {
    try {
      try {
        await this.prisma.user.update({
          data: params.data,
          where: params.where,
        });
      } catch (err) {
        throw this.toError("Failed to update user detail", err);
      }
    } catch (err) {
      console.error("Error updating user detail:", err);
      return err instanceof Error ? err : new Error(String(err));
    }
  }

  async DeleteUser(where: Prisma.UserWhereUniqueInput): Promise<void | Error> {
    try {
      try {
        await this.prisma.$transaction(async (prisma) => {
          await prisma.attendance.deleteMany({
            where: {
              userId: where.email,
            },
          });
          await prisma.user.delete({ where });
        });
      } catch (err) {
        throw this.toError("Failed to delete the user", err);
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      return err instanceof Error ? err : new Error(String(err));
    }
  }

  async GetUsersByBranch(
    where: Prisma.UserWhereInput
  ): Promise<BranchUserDto[] | Error> {
    try {
      try {
        const branchUsers = await this.prisma.user.findMany({
          select: {
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            attendances: {
              select: { dateTime: true },
              where: {
                dateTime: {
                  gte: new Date(new Date().setHours(0, 0, 0, 0)),
                  lte: new Date(new Date().setHours(23, 59, 59, 999)),
                },
              },
            },
          },
          where,
        });

        return branchUsers;
      } catch (err) {
        throw this.toError("Failed to retrieve users of the branch", err);
      }
    } catch (err) {
      console.error("Error retrieving users of the branch:", err);
      return err instanceof Error ? err : new Error(String(err));
    }
  }
}
