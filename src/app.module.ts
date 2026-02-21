import {
  Module,
  NestModule,
  RequestMethod,
  MiddlewareConsumer,
} from "@nestjs/common";

import { AssetsController } from "./controllers/assets.controller";

import { BranchController } from "./controllers/branch.controller";
import { BranchService } from "./services/branch.service";
import { AuthorizeBranch } from "./middlewares/branch.middleware";

import { InsightController } from "./controllers/insight.controller";
import { InsightService } from "./services/insight.service";

import { MenuController } from "./controllers/menu.controller";
import { MenuService } from "./services/menu.service";

import { OrderController } from "./controllers/order.controller";
import { OrderService } from "./services/order.service";

import { UserController } from "./controllers/user.controller";
import { UserService } from "./services/user.service";
import {
  AuthenticateUser,
  AuthorizeManager,
  AuthorizeAdministrator,
} from "./middlewares/user.middleware";

import { PrismaClient } from "../prisma/client";

@Module({
  imports: [],
  controllers: [
    AssetsController,
    BranchController,
    InsightController,
    MenuController,
    OrderController,
    UserController,
  ],
  providers: [
    BranchService,
    InsightService,
    MenuService,
    OrderService,
    UserService,
    PrismaClient,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticateUser).forRoutes(
      // User entity
      { path: "users/:email", method: RequestMethod.POST } // AttendUser
    );

    consumer.apply(AuthorizeManager).forRoutes(
      // Stock entity
      { path: "stocks/", method: RequestMethod.PUT }, // EditQuantity

      // User entity
      { path: "users/", method: RequestMethod.POST }, // RegisterUser
      { path: "users/:email", method: RequestMethod.GET }, // GetUserInfo
      { path: "users/:email", method: RequestMethod.PUT }, // EditUser
      { path: "users/:email", method: RequestMethod.DELETE } // RemoveUser
    );

    consumer.apply(AuthorizeAdministrator).forRoutes(
      // Menu entity
      { path: "menus/", method: RequestMethod.PUT }, // EditMenu
      { path: "menus/", method: RequestMethod.POST }, // AddMenu

      // Recipe entity
      { path: "recipes/", method: RequestMethod.POST } // AddRecipe
    );

    consumer.apply(AuthorizeBranch).forRoutes(
      // Insight entity
      { path: "insights/sales-today", method: RequestMethod.GET }, // GetSalesToday
      { path: "insights/top-menus", method: RequestMethod.GET }, // GetTopMenus
      { path: "insights/sales-in-week", method: RequestMethod.GET }, // GetSalesInWeek
      { path: "insights/sales-in-month", method: RequestMethod.GET }, // GetSalesInMonth
      { path: "insights/sales-in-year", method: RequestMethod.GET }, // GetSalesInYear

      // Order entity
      { path: "orders/", method: RequestMethod.POST }, // MakeOrder
      { path: "orders/", method: RequestMethod.GET }, // GetTodayOrders
      { path: "orders/:uuid", method: RequestMethod.GET }, // GetSpecificOrder
      { path: "orders/:uuid/receipt", method: RequestMethod.GET }, // GetReceipt

      // Stock Entity
      { path: "stocks/", method: RequestMethod.PUT } // EditQuantity
    );
  }
}
