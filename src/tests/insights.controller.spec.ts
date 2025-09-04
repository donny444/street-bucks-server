import { Test, TestingModule } from "@nestjs/testing";
import { InsightsController } from "../controllers/insights.controller";
import { AppService } from "../app.service";

describe("InsightsController", () => {
  let controller: InsightsController;
  let appService: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InsightsController],
      providers: [
        {
          provide: AppService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<InsightsController>(InsightsController);
    appService = module.get<AppService>(AppService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("SalesToday should return today sales message", () => {
    const res = { json: jest.fn() } as any;
    controller.SalesToday(res);
    expect(res.json).toHaveBeenCalledWith({
      message: "See today's menu sales.",
    });
  });

  it("SalesThisWeek should return week sales message", () => {
    const res = { json: jest.fn() } as any;
    controller.SalesThisWeek(res);
    expect(res.json).toHaveBeenCalledWith({
      message: "See counts of sales for every day in this week.",
    });
  });

  it("SalesThisMonth should return month sales message", () => {
    const res = { json: jest.fn() } as any;
    controller.SalesThisMonth(res);
    expect(res.json).toHaveBeenCalledWith({
      message: "See counts of sales for every day in this month.",
    });
  });
});
