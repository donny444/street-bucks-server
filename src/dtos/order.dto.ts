export class OrderedMenuDto {
  menuId!: string;
  quantity!: number;
}

export class MenuPriceDto {
  name!: string;
  price!: number;
}

export class SerializedOrderDto {
  uuid!: string;
  timestamp!: number;
  totalPrice!: number;
}

export class OrderDetailsDto {
  uuid!: string;
  totalPrice!: number;
  entry!: {
    quantity: number;
    menu: {
      name: string;
      price: number;
    };
  }[];
}

export class ReceiptDto {
  uuid!: string;
  timestamp!: number;
  totalPrice!: number;
  entries!: {
    menuName: string;
    price: number;
    quantity: number;
  }[];
}
