import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from '../app.service';

@Controller("menus")
export class MenusController {
  constructor(private readonly appService: AppService) {}

  @Get("hot")
  getHotMenus(): string {
    return "Returns all available hot beverages";
  }

  @Get("iced")
  getIcedMenus(): string {
    return "Returns all available iced beverages";
  }

  @Get("cake")
  getCakeMenus(): string {
    return "Returns all available cake menus";
  }

  @Get(":id")
  getSpecificMenu(@Param() params: any): string {
    return "Returns the menu specified in :id route path."
  }

}
