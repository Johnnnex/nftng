import type { Metadata } from "next";
import { BASE_URL, OG_IMAGE, BASE_ROBOTS } from "@/lib";
import About from "./About";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Unchain Summer | About",
  description:
    "Learn about Unchain Summer and NFTNG – Africa's Web3 convergence point. Guiding builders, brands, and communities toward Africa's long-term Web3 future. Theme: The North Star.",
  alternates: { canonical: `${BASE_URL}/about` },
  openGraph: {
    type: "website",
    siteName: "Unchain Summer",
    title: "About | Unchain Summer",
    description:
      "Learn about Unchain Summer and NFTNG – Africa's Web3 convergence point. Guiding builders, brands, and communities toward Africa's long-term Web3 future.",
    url: `${BASE_URL}/about`,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "About | Unchain Summer",
    description:
      "Learn about Unchain Summer and NFTNG – Africa's Web3 convergence point. Guiding builders, brands, and communities toward Africa's long-term Web3 future.",
    images: [OG_IMAGE.url],
  },
  robots: BASE_ROBOTS,
};

export default About;
