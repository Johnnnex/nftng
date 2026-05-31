export const PRODUCTS = [
  { title: "Unchain Summer (Men Merch)", image: "/images/demoprod-1.jpg", price: 100, rating: 2.5, reviewCount: 35, isNew: false },
  { title: "Unchain Summer (Women Merch)", image: "/images/demoprod-2.png", price: 360, rating: 4.5, reviewCount: 95, isNew: false },
  { title: "Unchain Summer (Keyboard)", image: "/images/demoprod-3.png", price: 700, rating: 5, reviewCount: 325, isNew: false },
  { title: "Unchain Summer (Sticker)", image: "/images/demoprod-4.png", price: 500, rating: 4.5, reviewCount: 145, isNew: false },
  { title: "Unchain Summer (Women Merch)", image: "/images/demoprod-5.jpg", price: 960, rating: 5, reviewCount: 65, isNew: true },
  { title: "Unchain Summer (Men Merch)", image: "/images/demoprod-6.jpg", price: 1160, rating: 4.5, reviewCount: 35, isNew: false },
  { title: "US Sticker", image: "/images/demoprod-7.png", price: 660, rating: 4.5, reviewCount: 55, isNew: true },
  { title: "Unchain Summer (Men Merch)", image: "/images/demoprod-1.jpg", price: 660, rating: 4.5, reviewCount: 55, isNew: false },
];

export const SEARCH_PRODUCTS = [
  { id: 1, name: "Unchain Summer (Men Merch)", price: "$100", rating: 2.5, image: "/images/demoprod-1.jpg" },
  { id: 2, name: "Unchain Summer (Women Merch)", price: "$360", rating: 4.5, image: "/images/demoprod-2.png" },
  { id: 3, name: "Unchain Summer (Keyboard)", price: "$700", rating: 5, image: "/images/demoprod-3.png" },
  { id: 4, name: "Unchain Summer (Sticker)", price: "$500", rating: 4.5, image: "/images/demoprod-4.png" },
  { id: 5, name: "Unchain Summer (Women Merch)", price: "$960", rating: 5, image: "/images/demoprod-5.jpg" },
  { id: 6, name: "Unchain Summer (Men Merch)", price: "$1160", rating: 4.5, image: "/images/demoprod-6.jpg" },
  { id: 7, name: "US Sticker", price: "$660", rating: 4.5, image: "/images/demoprod-7.png" },
  { id: 8, name: "Unchain Summer (Men Merch)", price: "$660", rating: 4.5, image: "/images/demoprod-1.jpg" },
];

export type SearchProduct = (typeof SEARCH_PRODUCTS)[0];
