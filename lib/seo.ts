export const BASE_URL = "https://unchainsummer.nftng.io";

export const OG_IMAGE = {
  url: `${BASE_URL}/seo/open-graph.png`,
  width: 1200,
  height: 630,
  alt: "Unchain Summer 2026 – Africa's Most Immersive Web3 Experience, Powered by NFTNG",
} as const;

export const BASE_ROBOTS = {
  index: true,
  follow: true,
  googleBot: { index: true, follow: true, "max-image-preview": "large" as const, "max-snippet": -1 },
} as const;
