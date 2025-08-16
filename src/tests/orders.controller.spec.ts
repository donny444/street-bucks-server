import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from '../controllers/orders.controller';
import { AppService } from '../app.service';

describe('OrdersController', () => {
  let controller: OrdersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: AppService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('makeAnOrder should return order message', () => {
    const req = {} as any;
    const res = { json: jest.fn() } as any;
    controller.makeAnOrder(req, res);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Make an order with menu(s) in cart.',
      order_id: 0,
    });
  });

  it('getTodayOrders should return today orders message', () => {
    const req = {} as any;
    const res = { json: jest.fn() } as any;
    controller.getTodayOrders(req, res);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Get orders in current day.',
      today_orders: [],
    });
  });

  it('getSpecificOrder should return specific order message', () => {
    const params = { id: 'abc' };
    const res = { json: jest.fn() } as any;
    controller.getSpecificOrder(params, res);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Inspect the order: abc',
      order: {},
    });
  });
});
