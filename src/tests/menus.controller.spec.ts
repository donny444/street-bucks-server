import { Test, TestingModule } from '@nestjs/testing';
import { MenusController } from '../controllers/menus.controller';
import { AppService } from '../app.service';

describe('MenusController', () => {
  let controller: MenusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenusController],
      providers: [
        {
          provide: AppService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<MenusController>(MenusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getHotMenus should return hot beverages message', () => {
    const res = { json: jest.fn() } as any;
    controller.getHotMenus(res);
    expect(res.json).toHaveBeenCalledWith({ message: 'Returns all available hot beverages' });
  });

  it('getIcedMenus should return iced beverages message', () => {
    const res = { json: jest.fn() } as any;
    controller.getIcedMenus(res);
    expect(res.json).toHaveBeenCalledWith({ message: 'Returns all available iced beverages' });
  });

  it('getCakeMenus should return cake menus message', () => {
    const res = { json: jest.fn() } as any;
    controller.getCakeMenus(res);
    expect(res.json).toHaveBeenCalledWith({ message: 'Returns all available cake menus' });
  });

  it('getSpecificMenu should return specific menu message', () => {
    // getSpecificMenu expects (id: string), but implementation expects res: Response
    // We'll mock res for compatibility
    const res = { json: jest.fn() } as any;
    // @ts-ignore
    controller.getSpecificMenu('123', res);
    expect(res.json).toHaveBeenCalledWith({ message: 'Returns the menu: 123' });
  });
});
