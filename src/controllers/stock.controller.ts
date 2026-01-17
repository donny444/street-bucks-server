import { Body, Controller, Headers, Put, Res } from "@nestjs/common";
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
        return res
          .status(500)
          .json({ message: "Failed to edit the stock information." });
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
      if (!updatedQuantity) {
        return res
          .status(500)
          .json({ message: "Failed to edit quantity of a recipe." });
      }

      return res.json({
        message:
          "The quantity of selected recipe has been updated for you branch.",
      });
    } catch (err) {
      console.error("Error occurred in `EditQuantity`:", err);
      return res
        .status(500)
        .json({ message: "Failed to edit quantity of a recipe." });
    }
  }
}
