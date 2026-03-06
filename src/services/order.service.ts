import { Injectable } from "@nestjs/common";
import { PrismaClient, Prisma, Order } from "../../prisma/client";

import PDFDocument from "pdfkit";
import * as fs from "fs";
import * as path from "path";

import {
  OrderedMenuDto,
  MenuPriceDto,
  ReceiptDto,
  SerializedOrderDto,
  SpecificOrderDto,
} from "../dtos/order.dto";

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaClient) {}

  private accumulatePrice(
    orderedMenus: OrderedMenuDto[],
    menuPrices: MenuPriceDto[]
  ): number {
    return orderedMenus.reduce((acc, orderedMenu) => {
      const matchedMenu = menuPrices.find(
        (eachMenu) => eachMenu.name === orderedMenu.menuId
      );
      return acc + (matchedMenu ? matchedMenu.price * orderedMenu.quantity : 0);
    }, 0);
  }

  private toError(tag: string, err: unknown): Error {
    return new Error(
      `${tag}: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  async InsertOrder(
    orderedMenus: OrderedMenuDto[],
    branchId: number
  ): Promise<Order | Error> {
    try {
      const extractedMenuIds = orderedMenus.map((item) => item.menuId);

      const order = await this.prisma.$transaction(async (prisma) => {
        let menuPrices: MenuPriceDto[];
        try {
          menuPrices = await prisma.menu.findMany({
            select: { name: true, price: true },
            where: {
              name: { in: extractedMenuIds },
            },
          });
        } catch (err) {
          throw this.toError("Failed to fetch menu prices", err);
        }

        const accumulatedPrice = this.accumulatePrice(orderedMenus, menuPrices);

        let ingredients: { menuId: string; recipeId: string; amount: number }[];
        try {
          ingredients = await prisma.ingredient.findMany({
            select: { menuId: true, recipeId: true, amount: true },
            where: { menuId: { in: extractedMenuIds } },
          });
        } catch (err) {
          throw this.toError("Failed to fetch ingredients", err);
        }

        const quantityByMenu = new Map(
          orderedMenus.map((e) => [e.menuId, e.quantity])
        );
        const requiredByRecipe = new Map<string, number>();
        for (const ing of ingredients) {
          const menuQty = quantityByMenu.get(ing.menuId) ?? 0;
          const needed = ing.amount * menuQty;
          if (needed > 0) {
            requiredByRecipe.set(
              ing.recipeId,
              (requiredByRecipe.get(ing.recipeId) ?? 0) + needed
            );
          }
        }

        // Check stock sufficiency before decrementing
        const requiredRecipeIds = Array.from(requiredByRecipe.keys());

        let currentStocks: { recipeId: string; quantity: number }[];
        try {
          currentStocks = await prisma.stock.findMany({
            where: {
              branchId: BigInt(branchId),
              recipeId: { in: requiredRecipeIds },
            },
            select: { recipeId: true, quantity: true },
          });
        } catch (err) {
          throw this.toError("Failed to fetch current stock", err);
        }

        const stockByRecipe = new Map(
          currentStocks.map((s) => [s.recipeId, s.quantity])
        );

        const insufficientStocks: {
          recipeId: string;
          required: number;
          available: number;
        }[] = [];
        for (const [recipeId, requiredQty] of requiredByRecipe) {
          const availableQty = stockByRecipe.get(recipeId) ?? 0;
          if (availableQty < requiredQty) {
            insufficientStocks.push({
              recipeId,
              required: requiredQty,
              available: availableQty,
            });
          }
        }

        if (insufficientStocks.length > 0) {
          throw new Error(
            `Insufficient stock for recipes: ${insufficientStocks
              .map(
                (s) =>
                  `${s.recipeId} (required: ${s.required}, available: ${s.available})`
              )
              .join(", ")}`
          );
        }

        try {
          await Promise.all(
            Array.from(requiredByRecipe.entries()).map(([recipeId, qty]) =>
              prisma.stock.update({
                where: {
                  branchId_recipeId: { branchId: BigInt(branchId), recipeId },
                },
                data: { quantity: { decrement: qty } },
              })
            )
          );
        } catch (err) {
          throw this.toError("Failed to decrement stock", err);
        }

        let newOrder: Order;
        try {
          newOrder = await prisma.order.create({
            data: {
              branchId: BigInt(branchId),
              timestamp: new Date().getTime(),
              totalPrice: accumulatedPrice,
            },
          });
        } catch (err) {
          throw this.toError("Failed to create order", err);
        }

        try {
          await prisma.entry.createMany({
            data: orderedMenus.map((orderedMenu) => ({
              orderId: newOrder.uuid,
              menuId: orderedMenu.menuId,
              quantity: orderedMenu.quantity,
            })),
          });
        } catch (err) {
          throw this.toError("Failed to create order entries", err);
        }

        return newOrder;
      });

      return order;
    } catch (err) {
      return err instanceof Error ? err : new Error(String(err));
    }
  }

  async GetTodayOrders(
    branchId: number
  ): Promise<SerializedOrderDto[] | Error> {
    try {
      const startOfDay = new Date().setHours(0, 0, 0, 0);
      const endOfDay = new Date().setHours(23, 59, 59, 999);

      let orders: {
        uuid: string;
        timestamp: bigint;
        totalPrice: number;
      }[];
      try {
        orders = await this.prisma.order.findMany({
          where: {
            timestamp: {
              gte: startOfDay,
              lte: endOfDay,
            },
            branchId: BigInt(branchId),
          },
          select: {
            uuid: true,
            timestamp: true,
            totalPrice: true,
          },
        });
      } catch (err) {
        throw this.toError("Failed to find orders by `branchId`", err);
      }

      const serializedOrders = orders.map((order) => ({
        uuid: order.uuid,
        timestamp: Number(order.timestamp),
        totalPrice: order.totalPrice,
      }));

      return serializedOrders;
    } catch (err) {
      return err instanceof Error ? err : new Error(String(err));
    }
  }

  async GetSpecificOrder(
    where: Prisma.OrderWhereUniqueInput
  ): Promise<SpecificOrderDto | null | Error> {
    try {
      try {
        const order = await this.prisma.order.findUnique({
          select: {
            uuid: true,
            totalPrice: true,
            entry: {
              select: {
                quantity: true,
                menu: {
                  select: {
                    name: true,
                    price: true,
                  },
                },
              },
            },
          },
          where: where,
        });

        return order;
      } catch (err) {
        throw this.toError("Failed to find specific order", err);
      }
    } catch (err) {
      return err instanceof Error ? err : new Error(String(err));
    }
  }

  async GenerateReceipt(receipt: ReceiptDto): Promise<string> {
    const receiptsDir = path.join(__dirname, "..", "..", "assets", "receipts");

    if (!fs.existsSync(receiptsDir)) {
      fs.mkdirSync(receiptsDir, { recursive: true });
    }

    const filePath = path.join(receiptsDir, `${receipt.uuid}.pdf`);
    const orderDate = new Date(receipt.timestamp);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
        info: {
          Title: `Receipt - ${receipt.uuid}`,
          Author: "StreetBucks",
          CreationDate: orderDate,
        },
      });

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // Header
      doc.fontSize(24).text("StreetBucks", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(16).text("Receipt", { align: "center" });
      doc.moveDown();

      // Order Info
      doc.fontSize(10).text(`Order ID: ${receipt.uuid}`);
      doc.text(`Date: ${orderDate.toLocaleString()}`);
      doc.moveDown();

      // Separator line
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown();

      // Table header
      const tableTop = doc.y;
      doc.fontSize(10).font("Helvetica-Bold");
      doc.text("Item", 50, tableTop);
      doc.text("Qty", 300, tableTop);
      doc.text("Price", 370, tableTop);
      doc.text("Subtotal", 450, tableTop);
      doc.moveDown();

      // Items
      doc.font("Helvetica");
      let y = doc.y;
      for (const entry of receipt.entries) {
        const subtotal = entry.price * entry.quantity;
        doc.text(entry.menuName, 50, y);
        doc.text(entry.quantity.toString(), 300, y);
        doc.text(`฿${entry.price.toFixed(2)}`, 370, y);
        doc.text(`฿${subtotal.toFixed(2)}`, 450, y);
        y += 20;
      }
      doc.y = y;
      doc.moveDown();

      // Separator line
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown();

      // Total
      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(`Total: ฿${receipt.totalPrice.toFixed(2)}`, {
          align: "right",
        });

      doc.moveDown(2);

      // Footer
      doc
        .font("Helvetica")
        .fontSize(10)
        .text("Thank you for your purchase!", { align: "center" });

      doc.end();

      writeStream.on("finish", () => resolve(filePath));
      writeStream.on("error", reject);
    });
  }

  GetReceiptPath(uuid: string): string | null {
    const filePath = path.join(
      __dirname,
      "..",
      "..",
      "assets",
      "receipts",
      `${uuid}.pdf`
    );
    if (fs.existsSync(filePath)) {
      return filePath;
    }
    return null;
  }
}
