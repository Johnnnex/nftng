export const MOCK_CART_ITEMS = [
  { id: 1, name: "Unchain Summer (Women Merch)", size: "Large", color: "White", price: 145, qty: 1, image: "/images/demoprod-2.png" },
  { id: 2, name: "Unchain Summer (Women Merch)", size: "Medium", color: "Red", price: 180, qty: 1, image: "/images/demoprod-5.jpg" },
  { id: 3, name: "Key Holder", size: "One Size", color: "Green", price: 240, qty: 1, image: "/images/demoprod-4.png" },
];

export const DISCOUNT_PCT = 20;
export const DELIVERY_FEE = 15;

export type CartItem = (typeof MOCK_CART_ITEMS)[0];
