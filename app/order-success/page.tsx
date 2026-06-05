import type { Metadata } from "next";
import { BASE_URL } from "@/lib";
import { Suspense } from "react";
import OrderSuccess from "./OrderSuccess";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Unchain Summer | Order Confirmed",
  robots: { index: false, follow: false },
};

export default function OrderSuccessPage() {
  return (
    <Suspense>
      <OrderSuccess />
    </Suspense>
  );
}
