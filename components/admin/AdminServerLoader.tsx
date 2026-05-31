// Server component — import directly, never through components/admin/index.ts
import type { ComponentType, ReactNode } from "react";
import { cookies } from "next/headers";

async function serverFetch<T>(url: string, token: string): Promise<T | null> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(`${base}${url}`, {
      headers: { Authorization: `Bearer ${token}` },
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
};

export async function AdminServerLoader<T extends unknown[]>({
  requests,
  onSuccess: OnSuccess,
  children,
}: Props<T>) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  const results = token
    ? ((await Promise.all(requests.map((r) => serverFetch<T[number]>(r.url, token)))) as T)
    : (requests.map(() => null) as unknown as T);
  return (
    <>
      <OnSuccess results={results} />
      {children}
    </>
  );
}
