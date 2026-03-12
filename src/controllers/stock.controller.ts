import { Body, Controller, Get, Headers, Put, Res } from "@nestjs/common";
import { Response } from "express";

import { StockService } from "../services/stock.service";

import { EditQuantityDto } from "../dtos/stock.dto";
import { BranchPayloadDto } from "../dtos/branch.dto";

@Controller("stocks")
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Put()
  async EditQuantity(
    @Headers("Branch-Payload") branchPayload: string,
    @Body() editQuantity: EditQuantityDto,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const parsedBranchPayload = JSON.parse(
        branchPayload || "{}"
      ) as BranchPayloadDto;
      if (!parsedBranchPayload) {
        return res.status(500).json({
          message:
            "Failed to parse branch payload from `branch-payload` request header.",
        });
      }

      const { branchId } = parsedBranchPayload;

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
    @Headers("Branch-Payload") branchPayload: string,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const parsedBranchPayload = JSON.parse(
        branchPayload || "{}"
      ) as BranchPayloadDto;
      if (!parsedBranchPayload) {
        return res.status(500).json({
          message:
            "Failed to parse branch payload from `branch-payload` request header.",
        });
      }

      const { branchId } = parsedBranchPayload;

      const branchStocks = await this.stockService.GetStocksByBranch({
        branchId: BigInt(branchId),
      });
      if (branchStocks instanceof Error) {
        console.error("Error occurred in `GetStocksByBranch`:", branchStocks);
        return res.status(500).json({
          message: "Failed to get the stock information of the branch.",
        });
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
