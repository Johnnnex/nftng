import type { Metadata } from "next";
import { Suspense } from "react";
import VerifyPayment from "./VerifyPayment";

export const metadata: Metadata = {
  title: "Unchain Summer | Verifying Payment",
  robots: { index: false, follow: false },
};

export default function VerifyPaymentPage() {
  return (
    <Suspense>
      <VerifyPayment />
    </Suspense>
  );
}
