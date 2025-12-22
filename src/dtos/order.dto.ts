export class OrderedMenuDto {
  menuId: bigint;
  quantity: number;
}

export class MenuPriceDto {
  id: bigint;
  price: number;
}

export class OrderDto {
  uuid: string;
  timestamp: bigint;
  totalPrice: number;
}
