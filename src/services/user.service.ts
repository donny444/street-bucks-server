import { Injectable } from "@nestjs/common";
import { PrismaClient, Prisma, $Enums } from "../../prisma/client";

import * as bcrypt from "bcryptjs";

import {
  UserFormDto,
  BranchUserDto,
  FindUserDto,
  UserEntryDto,
  AttendaceRecordDto,
} from "../dtos/user.dto";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaClient) {}

  private toError(tag: string, err: unknown): Error {
    return new Error(
      `${tag}: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  async CheckUserExists(email: string): Promise<boolean | Error> {
    try {
      try {
        const user = await this.prisma.user.findUnique({
          where: { email },
          select: { email: true },
        });

        if (!user) {
          return false;
        }

        return true;
      } catch (err) {
        throw this.toError("Error checking if user exists:", err);
      }
    } catch (err) {
      return err instanceof Error ? err : new Error(String(err));
    }
  }

  async InsertUser(
    data: Prisma.UserUncheckedCreateInput,
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

  async InsertAttendance(
    where: Prisma.UserWhereUniqueInput,
  ): Promise<void | AttendaceRecordDto | Error> {
    try {
      const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
      const endOfDay = new Date(new Date().setHours(23, 59, 59, 999));

      const userEmail = where.email as string;

      try {
        const existedAttendance = await this.prisma.attendance.findFirst({
          where: {
            userId: userEmail,
            dateTime: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        });

        if (!existedAttendance) {
          try {
            await this.prisma.attendance.create({
              data: { userId: userEmail },
            });
          } catch (err) {
            throw this.toError(
              "Failed to create today attendance for the user",
              err,
            );
          }
        } else {
          return existedAttendance;
        }
      } catch (err) {
        throw this.toError(
          "Failed to check if today's attendance of the user exists",
          err,
        );
      }
    } catch (err) {
      console.error("Error toggling attendance:", err);
      return err instanceof Error ? err : new Error(String(err));
    }
  }

  async FindUser(
    where: Prisma.UserWhereUniqueInput,
  ): Promise<FindUserDto | null | Error> {
    try {
      try {
        const user = await this.prisma.user.findUnique({
          select: {
            email: true,
            password: true,
            role: true,
          },
          where,
        });

        if (!user) {
          return null;
        }

        return user;
      } catch (err) {
        throw this.toError("Failed to find a user", err);
      }
    } catch (err) {
      console.error("Error finding a user:", err);
      return err instanceof Error ? err : new Error(String(err));
    }
  }

  async FindUserForm(
    where: Prisma.UserWhereUniqueInput,
  ): Promise<UserFormDto | null | Error> {
    try {
      try {
        const userForm = await this.prisma.user.findUnique({
          select: {
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
          where,
        });
        if (!userForm) {
          return null;
        }

        return userForm;
      } catch (err) {
        throw this.toError("Failed to find form values of a user", err);
      }
    } catch (err) {
      console.error("Error finding form values of a user:", err);
      return err instanceof Error ? err : new Error(String(err));
    }
  }

  async FindUsersByName(name: string): Promise<UserEntryDto[] | null | Error> {
    try {
      try {
        const foundUsers = await this.prisma.user.findMany({
          select: {
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            branchId: true,
          },
          where: {
            OR: [
              { firstName: { contains: name, mode: "insensitive" } },
              { lastName: { contains: name, mode: "insensitive" } },
            ],
          },
        });

        if (foundUsers.length < 1) {
          return null;
        }

        return foundUsers;
      } catch (err) {
        throw this.toError("Failed to find users by name", err);
      }
    } catch (err) {
      console.error("Error finding users by name:", err);
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

  async SelectUsersByBranch(
    where: Prisma.UserWhereInput,
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
