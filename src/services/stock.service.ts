import { Injectable } from "@nestjs/common";
import { PrismaClient, Prisma, Stock } from "../../prisma/client";

@Injectable()
export class StockService {
  constructor(private prisma: PrismaClient) {}

  async UpdateQuantity(params: {
    data: Prisma.StockUncheckedUpdateInput;
    where: Prisma.StockWhereUniqueInput;
  }): Promise<Stock> {
    return this.prisma.stock.update({
      data: params.data,
      where: params.where,
    });
  }

  async GetStocksByBranch(
    where: Prisma.StockWhereInput
  ): Promise<Prisma.StockWhereInput[]> {
    return this.prisma.stock.findMany({
      select: {
        quantity: true,
        recipe: {
          select: {
            name: true,
            unit: true,
            imagePath: true,
          },
        },
      },
      where,
    });
  }
}
