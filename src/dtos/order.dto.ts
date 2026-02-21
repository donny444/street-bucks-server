export class OrderedMenuDto {
  menuId!: string;
  quantity!: number;
}

export class MenuPriceDto {
  name!: string;
  price!: number;
}

export class ReceiptType {
  uuid!: string;
  timestamp!: number;
  totalPrice!: number;
  entries!: {
    menuName: string;
    price: number;
    quantity: number;
  }[];
}
