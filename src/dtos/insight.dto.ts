export type TopMenusByQuantityDto = {
  menuName: string;
  totalQuantity: number;
};

export type SaleByCategoryDto = {
  order: {
    timestamp: number;
  };
  menu: {
    category: string;
  };
};
