import type { Metadata } from "next";
import { BASE_URL, OG_IMAGE, BASE_ROBOTS } from "@/lib";
import TrackOrder from "./TrackOrder";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Unchain Summer | Track Order",
  description: "Track your Unchain Summer 2026 merchandise order. Enter your order ID for real-time item-by-item updates.",
  alternates: { canonical: `${BASE_URL}/track-order` },
  openGraph: {
    type: "website",
    siteName: "Unchain Summer",
    title: "Track Order | Unchain Summer 2026",
    description: "Track your Unchain Summer 2026 merchandise order. Enter your order ID for real-time item-by-item updates.",
    url: `${BASE_URL}/track-order`,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Track Order | Unchain Summer 2026",
    description: "Track your Unchain Summer 2026 merchandise order. Enter your order ID for real-time item-by-item updates.",
    images: [OG_IMAGE.url],
  },
  robots: BASE_ROBOTS,
};

export default TrackOrder;
