export const BILLING_FIELDS = [
  { name: "firstName" as const, label: "First Name *", placeholder: "e.g. Amara", type: "text" as const, required: true },
  { name: "companyName" as const, label: "Company Name", placeholder: "e.g. NFTNG Ltd.", type: "text" as const, required: false },
  { name: "address" as const, label: "Street Address *", placeholder: "e.g. 12 Admiralty Way", type: "text" as const, required: true },
  { name: "apartment" as const, label: "Apartment, floor, etc. (optional)", placeholder: "e.g. Flat 3B", type: "text" as const, required: false },
  { name: "city" as const, label: "Town / City *", placeholder: "e.g. Lagos", type: "text" as const, required: true },
  { name: "phone" as const, label: "Phone Number *", placeholder: "+234 800 000 0000", type: "tel" as const, required: true },
  { name: "email" as const, label: "Email Address *", placeholder: "you@example.com", type: "email" as const, required: true },
];

export const SUMMARY_ITEMS = [
  { name: "Unchain Summer (Women Merch)", size: "Large", color: "White", price: 145, image: "/images/demoprod-2.png" },
  { name: "Unchain Summer (Women Merch)", size: "Medium", color: "Red", price: 180, image: "/images/demoprod-5.jpg" },
  { name: "Key Holder", size: "One Size", color: "Green", price: 240, image: "/images/demoprod-4.png" },
];
