import { Module } from "@nestjs/common";
import { MenuController } from "./controllers/menu.controller";
import { MenuService } from "./services/menu.service";
import { OrderController } from "./controllers/order.controller";
import { OrderService } from "./services/order.service";
import { UserController } from "./controllers/user.controller";
import { UserService } from "./services/user.service";
import { InsightController } from "./controllers/insight.controller";
import { InsightService } from "./services/insight.service";
import { PrismaClient } from "../prisma/client";

@Module({
  imports: [],
  controllers: [
    MenuController,
    OrderController,
    UserController,
    InsightController,
  ],
  providers: [
    PrismaClient,
    MenuService,
    OrderService,
    UserService,
    InsightService,
  ],
})
export class AppModule {}
