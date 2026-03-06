export type SalesCountDto = number;

export class TopMenusByQuantityDto {
  menuName!: string;
  totalQuantity!: number;
}

export class TopMenusByRevenueDto {
  menuName!: string;
  totalRevenue!: number;
}

export class SalesInPeriodDto {
  timestamp!: bigint;
}

export class SerializedSalesInPeriodDto {
  timestamp!: number;
}

export class SaleByCategoryDto {
  order!: {
    timestamp: number;
  };
  menu!: {
    category: string;
  };
}
