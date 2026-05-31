"use client";

import { usePathname } from "next/navigation";
import { Header, Footer, CustomCursor } from "@/components";

export const PublicShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return <>{children}</>;

  return (
    <>
      <CustomCursor />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
};
