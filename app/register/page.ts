import type { Metadata } from "next";
import { BASE_URL, OG_IMAGE, BASE_ROBOTS } from "@/lib";
import Register from "./Register";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Unchain Summer | Register",
  description:
    "Register for Unchain Summer 2026 – Africa's premier week-long Web3 experience powered by NFTNG. Secure your spot for an unforgettable journey in Lagos, July 26 – August 1.",
  alternates: { canonical: `${BASE_URL}/register` },
  openGraph: {
    type: "website",
    siteName: "Unchain Summer",
    title: "Register | Unchain Summer 2026",
    description:
      "Secure your spot at Africa's most immersive Web3 experience. Lagos, July 26 – August 1, 2026. Powered by NFTNG.",
    url: `${BASE_URL}/register`,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Register | Unchain Summer 2026",
    description:
      "Secure your spot at Africa's most immersive Web3 experience. Lagos, July 26 – August 1, 2026. Powered by NFTNG.",
    images: [OG_IMAGE.url],
  },
  robots: BASE_ROBOTS,
};

export default Register;
