import type { Metadata } from "next";
import { Suspense } from "react";
import AcceptInvite from "./AcceptInvite";

export const metadata: Metadata = {
  title: "Unchain Summer | Accept Invite",
  robots: { index: false, follow: false },
};

export default function AcceptInvitePage() {
  return (
    <Suspense>
      <AcceptInvite />
    </Suspense>
  );
}
