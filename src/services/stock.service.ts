import { Injectable } from "@nestjs/common";
import { PrismaClient, Prisma } from "../../prisma/client";

@Injectable()
export class StockService {
  constructor(private prisma: PrismaClient) {}

  async UpdateQuantity(params: {
    data: Prisma.StockUncheckedUpdateInput;
    where: Prisma.StockWhereUniqueInput;
  }): Promise<Prisma.Prisma__StockClient<Prisma.StockUncheckedUpdateInput>> {
    return this.prisma.stock.update({
      data: params.data,
      where: params.where,
    });
  }
}
