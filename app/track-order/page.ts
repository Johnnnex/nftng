import type { Metadata } from "next";
import { BASE_URL, OG_IMAGE, BASE_ROBOTS } from "@/lib";
import TrackOrder from "./TrackOrder";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Track Your Order · NFTNG",
  description: "Enter your order ID to get real-time updates on your NFTNG merchandise.",
  alternates: { canonical: `${BASE_URL}/track-order` },
  openGraph: {
    type: "website",
    siteName: "Unchain Summer",
    title: "Track Your Order · NFTNG",
    description: "Enter your order ID to get real-time updates on your NFTNG merchandise.",
    url: `${BASE_URL}/track-order`,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Track Your Order · NFTNG",
    description: "Enter your order ID to get real-time updates on your NFTNG merchandise.",
    images: [OG_IMAGE.url],
  },
  robots: BASE_ROBOTS,
};

export default TrackOrder;
