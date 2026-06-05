import type { Metadata } from "next";
import { BASE_URL, OG_IMAGE, BASE_ROBOTS } from "@/lib";
import ProductDetailPage from "./ProductDetailPage";

type Params = { params: Promise<{ productId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { productId } = await params;
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const res = await fetch(`${base}/api/products/${productId}`, { cache: "no-store" });
    if (res.ok) {
      const { data } = await res.json() as {
        data: { title: string; baseImage: string | null; description: string | null; about: string | null };
      };
      const desc = (data.about ?? data.description ?? `Shop ${data.title} — exclusive Unchain Summer 2026 merchandise, powered by NFTNG.`).substring(0, 160);
      const image = data.baseImage ? { url: data.baseImage, width: 600, height: 600, alt: data.title } : OG_IMAGE;
      return {
        metadataBase: new URL(BASE_URL),
        title: `Unchain Summer | ${data.title}`,
        description: desc,
        alternates: { canonical: `${BASE_URL}/collections/${productId}` },
        openGraph: {
          type: "website",
          siteName: "Unchain Summer",
          title: `${data.title} | Unchain Summer 2026`,
          description: desc,
          url: `${BASE_URL}/collections/${productId}`,
          images: [image],
        },
        twitter: {
          card: "summary_large_image",
          title: `${data.title} | Unchain Summer 2026`,
          description: desc,
          images: [data.baseImage ?? OG_IMAGE.url],
        },
        robots: BASE_ROBOTS,
      };
    }
  } catch { /* fall through to default */ }

  return {
    metadataBase: new URL(BASE_URL),
    title: "Unchain Summer | Collections",
    description: "Explore exclusive Unchain Summer 2026 merchandise, powered by NFTNG.",
    openGraph: {
      type: "website",
      siteName: "Unchain Summer",
      title: "Collections | Unchain Summer 2026",
      description: "Explore exclusive Unchain Summer 2026 merchandise, powered by NFTNG.",
      url: `${BASE_URL}/collections`,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: "Collections | Unchain Summer 2026",
      description: "Explore exclusive Unchain Summer 2026 merchandise, powered by NFTNG.",
      images: [OG_IMAGE.url],
    },
    robots: BASE_ROBOTS,
  };
}

export default ProductDetailPage;
