import type { Metadata } from "next";
import { BASE_URL, OG_IMAGE, BASE_ROBOTS } from "@/lib";
import Contact from "./Contact";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Unchain Summer | Contact",
  description:
    "Get in touch with the Unchain Summer and NFTNG team. Africa's premier Web3 event powering connection, growth, and ecosystem development across the continent.",
  alternates: { canonical: `${BASE_URL}/contact` },
  openGraph: {
    type: "website",
    siteName: "Unchain Summer",
    title: "Contact | Unchain Summer",
    description:
      "Get in touch with the Unchain Summer and NFTNG team. Africa's premier Web3 event powering connection, growth, and ecosystem development.",
    url: `${BASE_URL}/contact`,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | Unchain Summer",
    description:
      "Get in touch with the Unchain Summer and NFTNG team. Africa's premier Web3 event powering connection, growth, and ecosystem development.",
    images: [OG_IMAGE.url],
  },
  robots: BASE_ROBOTS,
};

export default Contact;
