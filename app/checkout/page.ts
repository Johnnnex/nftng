import type { Metadata } from "next";
import { BASE_URL, OG_IMAGE, BASE_ROBOTS } from "@/lib";
import Checkout from "./Checkout";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Unchain Summer | Checkout",
  description:
    "Complete your purchase of Unchain Summer 2026 merchandise. Fast, secure checkout.",
  alternates: { canonical: `${BASE_URL}/checkout` },
  openGraph: {
    type: "website",
    siteName: "Unchain Summer",
    title: "Checkout | Unchain Summer 2026",
    description:
      "Complete your purchase of Unchain Summer 2026 merchandise. Fast, secure checkout.",
    url: `${BASE_URL}/checkout`,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Checkout | Unchain Summer 2026",
    description:
      "Complete your purchase of Unchain Summer 2026 merchandise. Fast, secure checkout.",
    images: [OG_IMAGE.url],
  },
  robots: BASE_ROBOTS,
};

export default Checkout;
