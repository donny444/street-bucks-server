import { Body, Controller, Get, Put, Res } from "@nestjs/common";
import { Response } from "express";

import { StockService } from "../services/stock.service";
import { BranchPayload } from "../decorators/branch.decorator";

import { EditQuantityDto } from "../dtos/stock.dto";
import { BranchPayloadDto } from "../dtos/branch.dto";

@Controller("stocks")
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Put()
  async EditQuantity(
    @BranchPayload() { branchId }: BranchPayloadDto,
    @Body() editQuantity: EditQuantityDto,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const updatedQuantity = await this.stockService.UpdateQuantity({
        data: {
          quantity: editQuantity.quantity,
        },
        where: {
          branchId_recipeId: {
            branchId: BigInt(branchId),
            recipeId: editQuantity.recipeId,
          },
        },
      });
      if (updatedQuantity instanceof Error) {
        console.error("Error occurred in `UpdateQuantity`:", updatedQuantity);
        return res
          .status(500)
          .json({ message: "Failed to edit quantity of the recipe." });
      }

      return res.json({
        message:
          "The quantity of the selected recipe has been updated for you branch.",
      });
    } catch (err) {
      console.error("Error occurred in `EditQuantity`:", err);
      return res
        .status(500)
        .json({ message: "Failed to edit quantity of a recipe." });
    }
  }

  @Get()
  async GetBranchStocks(
    @BranchPayload() { branchId }: BranchPayloadDto,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const branchStocks = await this.stockService.SelectStocksByBranch({
        branchId: BigInt(branchId),
      });
      if (branchStocks instanceof Error) {
        console.error(
          "Error occurred in `SelectStocksByBranch`:",
          branchStocks
        );
        return res.status(500).json({
          message: "Failed to get the stock information of the branch.",
        });
      }
      if (branchStocks.length === 0) {
        return res
          .status(404)
          .json({ error: "No stocks found for the branch." });
      }

      return res.json({
        message: "Get stocks of the branch.",
        branch_stocks: branchStocks,
      });
    } catch (err) {
      console.error("Error occurred in `GetBranchStocks`:", err);
      return res
        .status(500)
        .json({ message: "Failed to get the stock information." });
    }
  }
}
