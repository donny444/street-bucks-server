import {
  Module,
  NestModule,
  RequestMethod,
  MiddlewareConsumer,
} from "@nestjs/common";

import { AssetController } from "./controllers/asset.controller";

import { BranchController } from "./controllers/branch.controller";
import { BranchService } from "./services/branch.service";
import { AuthorizeBranch } from "./middlewares/branch.middleware";

import { IngredientController } from "./controllers/ingredient.controller";
import { IngredientService } from "./services/ingredient.service";

import { InsightController } from "./controllers/insight.controller";
import { InsightService } from "./services/insight.service";

import { MenuController } from "./controllers/menu.controller";
import { MenuService } from "./services/menu.service";

import { OrderController } from "./controllers/order.controller";
import { OrderService } from "./services/order.service";

import { RecipeController } from "./controllers/recipe.controller";
import { RecipeService } from "./services/recipe.service";

import { StockController } from "./controllers/stock.controller";
import { StockService } from "./services/stock.service";

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
    AssetController,
    BranchController,
    IngredientController,
    InsightController,
    MenuController,
    OrderController,
    RecipeController,
    StockController,
    UserController,
  ],
  providers: [
    BranchService,
    IngredientService,
    InsightService,
    MenuService,
    OrderService,
    RecipeService,
    StockService,
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
      { path: "users/:email", method: RequestMethod.PUT }, // EditUser
      { path: "users/:email", method: RequestMethod.DELETE } // RemoveUser
    );

    consumer.apply(AuthorizeAdministrator).forRoutes(
      // Menu entity
      { path: "menus/", method: RequestMethod.PUT }, // EditMenu
      { path: "menus/", method: RequestMethod.POST }, // AddMenu

      // Recipe entity
      { path: "recipes/", method: RequestMethod.POST }, // AddRecipe
      { path: "recipes/:name", method: RequestMethod.PUT } // EditRecipe
    );

    consumer.apply(AuthorizeBranch).forRoutes(
      // Insight entity
      { path: "insights/sales-today", method: RequestMethod.GET }, // GetSalesToday
      { path: "insights/sales-this-week", method: RequestMethod.GET }, // GetSalesThisWeek
      { path: "insights/sales-this-month", method: RequestMethod.GET }, // GetSalesThisMonth
      { path: "insights/top-menus-by-quantity", method: RequestMethod.GET }, // GetTopMenusByQuantity
      { path: "insights/top-menus-by-revenue", method: RequestMethod.GET }, // GetTopMenusByRevenue
      { path: "insights/sales-in-week", method: RequestMethod.GET }, // GetSalesInWeek
      { path: "insights/sales-in-month", method: RequestMethod.GET }, // GetSalesInMonth
      { path: "insights/sales-in-year", method: RequestMethod.GET }, // GetSalesInYear

      // Order entity
      { path: "orders/", method: RequestMethod.POST }, // MakeOrder
      { path: "orders/", method: RequestMethod.GET }, // GetTodayOrders
      { path: "orders/:uuid", method: RequestMethod.GET }, // GetSpecificOrder
      { path: "orders/:uuid/receipt", method: RequestMethod.GET }, // GetReceipt

      // Stock entity
      { path: "stocks/", method: RequestMethod.PUT }, // EditQuantity
      { path: "stocks/", method: RequestMethod.GET }, // GetBranchStocks

      // User entity
      { path: "users/", method: RequestMethod.POST }, // RegisterUser
      { path: "users/", method: RequestMethod.GET } // GetBranchUsers
    );
  }
}
