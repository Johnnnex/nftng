import type { Metadata } from "next";
import { BASE_URL, OG_IMAGE, BASE_ROBOTS } from "@/lib";
import CollectionsPage from "./CollectionsPage";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Unchain Summer | Collections",
  description:
    "Explore exclusive Unchain Summer 2026 collections. Limited-edition pieces from Africa's most immersive Web3 experience, powered by NFTNG.",
  alternates: { canonical: `${BASE_URL}/collections` },
  openGraph: {
    type: "website",
    siteName: "Unchain Summer",
    title: "Collections | Unchain Summer 2026",
    description:
      "Explore exclusive Unchain Summer 2026 collections. Limited-edition pieces from Africa's most immersive Web3 experience, powered by NFTNG.",
    url: `${BASE_URL}/collections`,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Collections | Unchain Summer 2026",
    description:
      "Explore exclusive Unchain Summer 2026 collections. Limited-edition pieces from Africa's most immersive Web3 experience, powered by NFTNG.",
    images: [OG_IMAGE.url],
  },
  robots: BASE_ROBOTS,
};

export default CollectionsPage;
