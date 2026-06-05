// Server component — import directly, never through any barrel file.
// Works for admin routes (cookies forwarded → proxy reads admin_token) and public routes.
// Use notFoundOn404 on single-item pages so a missing resource triggers Next.js 404.
import type { ComponentType, ReactNode } from "react";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

async function serverFetch<T>(url: string, cookieHeader: string): Promise<T | null> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(`${base}${url}`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) ?? null;
  } catch {
    return null;
  }
}

type Props<T extends unknown[]> = {
  requests: { url: string }[];
  onSuccess: ComponentType<{ results: T }>;
  children: ReactNode;
  /** If true and the first result is null (404/error), render Next.js notFound() instead of children. */
  notFoundOn404?: boolean;
};

export async function ServerLoader<T extends unknown[]>({
  requests,
  onSuccess: OnSuccess,
  children,
  notFoundOn404,
}: Props<T>) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
  const results = (await Promise.all(
    requests.map((r) => serverFetch<T[number]>(r.url, cookieHeader)),
  )) as T;

  if (notFoundOn404 && results[0] === null) notFound();

  return (
    <>
      <OnSuccess results={results} />
      {children}
    </>
  );
}
