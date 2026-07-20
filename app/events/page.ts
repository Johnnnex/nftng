import type { Metadata } from "next";
import { BASE_URL, OG_IMAGE, BASE_ROBOTS } from "@/lib";
import Events from "./Events";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Unchain Summer | Events",
  description:
    "Explore Unchain Summer 2026 events in Lagos: Football (Aug 2), Conference (Aug 5), Boxing (Aug 6). Africa's biggest week-long Web3 experience, powered by NFTNG.",
  alternates: { canonical: `${BASE_URL}/events` },
  openGraph: {
    type: "website",
    siteName: "Unchain Summer",
    title: "Events | Unchain Summer 2026",
    description:
      "Football, Conference, Boxing and more. A week-long Web3 experience in Lagos, August 2 – August 6, 2026. Powered by NFTNG.",
    url: `${BASE_URL}/events`,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Events | Unchain Summer 2026",
    description:
      "Football, Conference, Boxing and more. A week-long Web3 experience in Lagos, August 2 – August 6, 2026. Powered by NFTNG.",
    images: [OG_IMAGE.url],
  },
  robots: BASE_ROBOTS,
};

export default Events;
