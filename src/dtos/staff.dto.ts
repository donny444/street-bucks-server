import type { Prisma } from "../../prisma/client";

type StaffDto = Partial<Prisma.StaffUncheckedCreateInput> &
  Partial<Prisma.StaffUncheckedUpdateInput> &
  Prisma.StaffWhereUniqueInput;

export default StaffDto;
