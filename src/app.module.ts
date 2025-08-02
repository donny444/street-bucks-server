import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MenusController } from './controllers/menus.controller';
import { OrdersController } from './controllers/orders.controller';
import { StaffsController } from './controllers/staffs.controller';
import { InsightsController } from './controllers/insights.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [
    AppController,
    MenusController,
    OrdersController,
    StaffsController,
    InsightsController,
  ],
  providers: [AppService],
})
export class AppModule {}
