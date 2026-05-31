import type { Metadata } from "next";
import { BASE_URL, OG_IMAGE, BASE_ROBOTS } from "@/lib";
import Cart from "./Cart";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Unchain Summer | Cart",
  description:
    "Review your selected Unchain Summer 2026 merchandise before checkout.",
  alternates: { canonical: `${BASE_URL}/cart` },
  openGraph: {
    type: "website",
    siteName: "Unchain Summer",
    title: "Cart | Unchain Summer 2026",
    description:
      "Review your selected Unchain Summer 2026 merchandise before checkout.",
    url: `${BASE_URL}/cart`,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cart | Unchain Summer 2026",
    description:
      "Review your selected Unchain Summer 2026 merchandise before checkout.",
    images: [OG_IMAGE.url],
  },
  robots: BASE_ROBOTS,
};

export default Cart;
