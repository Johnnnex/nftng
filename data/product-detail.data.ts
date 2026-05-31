export const MOCK_PRODUCTS = [
  { id: 1, name: "Unchain Summer (Men Merch)", price: "$100", rating: 2.5, image: "/images/demoprod-1.jpg" },
  { id: 2, name: "Unchain Summer (Women Merch)", price: "$360", rating: 4.5, image: "/images/demoprod-2.png" },
  { id: 3, name: "Unchain Summer (Keyboard)", price: "$700", rating: 5, image: "/images/demoprod-3.png" },
  { id: 4, name: "Unchain Summer (Sticker)", price: "$500", rating: 4.5, image: "/images/demoprod-4.png" },
  { id: 5, name: "Unchain Summer (Women Merch)", price: "$960", rating: 5, image: "/images/demoprod-5.jpg" },
  { id: 6, name: "Unchain Summer (Men Merch)", price: "$1160", rating: 4.5, image: "/images/demoprod-6.jpg" },
  { id: 7, name: "US Sticker", price: "$660", rating: 4.5, image: "/images/demoprod-7.png" },
  { id: 8, name: "Unchain Summer (Men Merch)", price: "$660", rating: 4.5, image: "/images/demoprod-1.jpg" },
];

export const ALL_REVIEWS = [
  { id: 1, name: "Samantha D.", rating: 5, date: "2024-08-14", verified: true, content: "I absolutely love this t-shirt! The design is unique and the fabric feels so comfortable. As a fellow designer, I appreciate the attention to detail. It's become my favourite go-to shirt." },
  { id: 2, name: "Alex M.", rating: 4, date: "2024-08-12", verified: true, content: "Great quality merch! The print is sharp and holds up well after multiple washes. Sizing is true to label — ordered a Medium and it fits perfectly." },
  { id: 3, name: "Chisom O.", rating: 5, date: "2024-07-30", verified: true, content: "This is hands down the best merch I've gotten from a Web3 event. The fabric is premium and the design tells a story. Wore it to the conference and got so many compliments." },
  { id: 4, name: "Jordan K.", rating: 3, date: "2024-07-28", verified: false, content: "Nice design, but the delivery took longer than expected. Product itself is good quality — just wished the shipping was faster." },
  { id: 5, name: "Ife B.", rating: 5, date: "2024-07-20", verified: true, content: "Absolutely stunning! The colors are vibrant and it matches perfectly with everything. Already planning to get one for my friend at the next event." },
  { id: 6, name: "Daniel R.", rating: 4, date: "2024-07-18", verified: true, content: "Solid piece. The cotton is soft and breathable — perfect for Lagos weather. Would have given 5 stars but the packaging could use some improvement." },
  { id: 7, name: "Praise N.", rating: 5, date: "2024-07-05", verified: true, content: "NFTng always delivers on merch quality. This one is no different. The Unchain Summer branding is subtle but meaningful — it's a conversation starter." },
  { id: 8, name: "Tobi F.", rating: 2, date: "2024-06-28", verified: false, content: "The design is great but I received the wrong size. Customer support was helpful in resolving it, but the initial experience was frustrating." },
  { id: 9, name: "Maya L.", rating: 4, date: "2024-06-20", verified: true, content: "Really happy with this purchase. The material is top-notch and the fit is flattering. Definitely worth the price." },
  { id: 10, name: "Emeka C.", rating: 5, date: "2024-06-10", verified: true, content: "Bought two — one for me and one for my partner. We both love them. The quality is consistent and the branding is clean." },
  { id: 11, name: "Aisha K.", rating: 3, date: "2024-05-30", verified: true, content: "Good product overall. The fabric is comfortable and the design is eye-catching. My only gripe is the price point — could be more accessible." },
  { id: 12, name: "Victor O.", rating: 4, date: "2024-05-15", verified: true, content: "Clean design, great fabric. Ordering was easy and delivery was on time. Would recommend to anyone attending Unchain Summer." },
];

export const PRODUCT_DETAILS_MD = `## About This Product

The **Unchain Summer Women's Merch** is a premium collection piece designed for those who move at the intersection of culture and Web3. Crafted to turn heads at the conference and beyond.

## Materials & Care

- **Fabric:** 100% ring-spun cotton, 180 GSM
- **Fit:** Relaxed silhouette, true to standard sizing
- **Care:** Machine wash cold, tumble dry low, do not bleach
- **Origin:** Ethically produced in Lagos, Nigeria

## Sizing

Available in Small, Medium, Large, and X-Large. Sizes run true to label — size up for a relaxed fit, or size down for a more fitted look.

## Shipping & Delivery

Orders are processed within **2–3 business days**. Estimated delivery times:

1. Lagos — 1–3 business days
2. Other Nigerian states — 3–5 business days
3. International — 7–14 business days

All orders include a tracking number sent to your registered email upon dispatch.

---

*Part of the exclusive Unchain Summer 2026 drop. Limited quantities available.*`;

export const PRODUCT_FAQS = [
  {
    question: "What sizes are available?",
    answer: "This product is available in Small, Medium, Large, and X-Large. See the Product Details tab for a full sizing guide.",
  },
  {
    question: "How long does shipping take?",
    answer: "Orders are processed within 2–3 business days. Delivery within Lagos takes 1–3 business days, other Nigerian states 3–5 business days, and international orders 7–14 business days.",
  },
  {
    question: "Can I return or exchange my order?",
    answer: "We accept returns and exchanges within 14 days of delivery, provided the item is unused and in its original packaging. Reach out to us at shop@nftng.io to initiate a return.",
  },
  {
    question: "Is this item limited edition?",
    answer: "Yes. All Unchain Summer 2026 collection pieces are limited edition drops. Once sold out, they will not be restocked.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We currently accept card payments and bank transfers. Crypto payment support is coming soon.",
  },
];

export type Product = (typeof MOCK_PRODUCTS)[0];
export type Review = (typeof ALL_REVIEWS)[0];

export const SORT_OPTIONS = ["Latest", "Oldest", "Highest Rating", "Lowest Rating"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export const SIZES = ["Small", "Medium", "Large", "X-Large"];

export const REVIEWS_PER_PAGE = 4;

export const TAB_ITEMS = [
  { name: "Product Details" },
  { name: "Rating & Reviews" },
  { name: "FAQs" },
];
