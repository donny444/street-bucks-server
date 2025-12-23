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
import { InsightController } from "./controllers/insight.controller";
import { InsightService } from "./services/insight.service";
import { AuthenticateUser, AuthorizeUser } from "./middlewares/auth.middleware";
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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticateUser)
      .forRoutes({ path: "users/:uuid", method: RequestMethod.POST });

    consumer
      .apply(AuthorizeUser)
      .forRoutes(
        { path: "users/:uuid", method: RequestMethod.PUT },
        { path: "users/:uuid", method: RequestMethod.DELETE }
      );
  }
}
