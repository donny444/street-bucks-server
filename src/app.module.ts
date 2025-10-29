import { Module } from "@nestjs/common";
import { MenuController } from "./controllers/menu.controller";
import { MenuService } from "./services/menu.service";
import { OrderController } from "./controllers/order.controller";
import { OrderService } from "./services/order.service";
import { StaffController } from "./controllers/staff.controller";
import { StaffService } from "./services/staff.service";
import { InsightController } from "./controllers/insight.controller";
import { InsightService } from "./services/insight.service";
import { PrismaClient } from "../prisma/client";

@Module({
  imports: [],
  controllers: [
    MenuController,
    OrderController,
    StaffController,
    InsightController,
  ],
  providers: [
    PrismaClient,
    MenuService,
    OrderService,
    StaffService,
    InsightService,
  ],
})
export class AppModule {}
