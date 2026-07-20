import type { Metadata } from "next";
import { BASE_URL, OG_IMAGE, BASE_ROBOTS } from "@/lib";
import Home from "./Home";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    absolute: "Unchain Summer 2026 | Africa's Most Immersive Web3 Experience",
    template: "Unchain Summer | %s",
  },
  description:
    "Unchain Summer 2026 is Africa's most immersive Web3 experience, powered by NFTNG. A week-long journey of culture, sport, education, and Web3 connection. Theme: The North Star. Lagos, August 2 – August 6.",
  keywords: [
    "unchain summer 2026",
    "unchain summer nftng",
    "africa web3 event",
    "africa blockchain conference",
    "web3 conference africa",
    "nftng event",
    "web3 lagos",
    "africa crypto event",
    "blockchain conference lagos",
    "africa web3 community",
    "web3 summit africa",
    "the north star web3",
    "nftng unchain summer",
    "africa defi event",
    "web3 week africa",
    "web3 event nigeria",
  ],
  alternates: { canonical: BASE_URL },
  openGraph: {
    type: "website",
    siteName: "Unchain Summer",
    title: "Unchain Summer 2026 | Africa's Most Immersive Web3 Experience",
    description:
      "A week-long Web3 journey of culture, sport, education, and connection. Africa's biggest Web3 event, powered by NFTNG. Lagos, August 2 – August 6, 2026.",
    url: BASE_URL,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Unchain Summer 2026 | Africa's Most Immersive Web3 Experience",
    description:
      "A week-long Web3 journey of culture, sport, education, and connection. Africa's biggest Web3 event, powered by NFTNG. Lagos, August 2 – August 6, 2026.",
    images: [OG_IMAGE.url],
  },
  robots: BASE_ROBOTS,
};

export default Home;
