import type { Metadata } from "next";
import { BASE_URL, OG_IMAGE, BASE_ROBOTS } from "@/lib";
import Events from "./Events";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Unchain Summer | Events",
  description:
    "Explore Unchain Summer 2026 events in Lagos: Football (Jul 26), Conference (Jul 30), Boxing (Jul 31). Africa's biggest week-long Web3 experience, powered by NFTNG.",
  alternates: { canonical: `${BASE_URL}/events` },
  openGraph: {
    type: "website",
    siteName: "Unchain Summer",
    title: "Events | Unchain Summer 2026",
    description:
      "Football, Conference, Boxing and more. A week-long Web3 experience in Lagos, July 26 – August 1, 2026. Powered by NFTNG.",
    url: `${BASE_URL}/events`,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Events | Unchain Summer 2026",
    description:
      "Football, Conference, Boxing and more. A week-long Web3 experience in Lagos, July 26 – August 1, 2026. Powered by NFTNG.",
    images: [OG_IMAGE.url],
  },
  robots: BASE_ROBOTS,
};

export default Events;
