import {
  Module,
  NestModule,
  RequestMethod,
  MiddlewareConsumer,
} from "@nestjs/common";

import { MenuController } from "./controllers/menu.controller";
import { MenuService } from "./services/menu.service";

import { OrderController } from "./controllers/order.controller";
import { OrderService } from "./services/order.service";

import { UserController } from "./controllers/user.controller";
import { UserService } from "./services/user.service";
import { AuthenticateUser, AuthorizeUser } from "./middlewares/auth.middleware";

import { InsightController } from "./controllers/insight.controller";
import { InsightService } from "./services/insight.service";

import { BranchController } from "./controllers/branch.controller";
import { BranchService } from "./services/branch.service";
import { AuthorizeBranch } from "./middlewares/branch.middleware";

import { PrismaClient } from "../prisma/client";

@Module({
  imports: [],
  controllers: [
    MenuController,
    OrderController,
    UserController,
    InsightController,
    BranchController,
  ],
  providers: [
    PrismaClient,
    MenuService,
    OrderService,
    UserService,
    InsightService,
    BranchService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // User Entity
    consumer.apply(AuthenticateUser).forRoutes(
      { path: "users/:email", method: RequestMethod.POST } // AttendUser
    );

    consumer.apply(AuthorizeUser).forRoutes(
      { path: "users/:email", method: RequestMethod.PUT }, // EditUser
      { path: "users/:email", method: RequestMethod.DELETE } // RemoveUser
    );

    // Order Entity
    consumer.apply(AuthorizeBranch).forRoutes(
      { path: "orders/", method: RequestMethod.POST }, // MakeOrder
      { path: "orders/", method: RequestMethod.GET }, // TodayOrders
      { path: "orders/:uuid", method: RequestMethod.GET } // SpecificOrder
    );

    // Insight Entity
    consumer.apply(AuthorizeBranch).forRoutes(
      { path: "insights/sales-today", method: RequestMethod.GET }, // SalesToday
      { path: "insights/top-menus", method: RequestMethod.GET }, // TopMenus
      { path: "insights/sales-in-week", method: RequestMethod.GET }, // SalesInWeek
      { path: "insights/sales-in-month", method: RequestMethod.GET }, // SalesInMonth
      { path: "insights/sales-in-year", method: RequestMethod.GET } // SalesInYear
    );

    // Stock Entity
    consumer.apply(AuthorizeBranch).forRoutes(
      { path: "stocks/", method: RequestMethod.PUT } // EditQuantity
    );
  }
}
