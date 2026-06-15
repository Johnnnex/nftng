import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";
import { hasPermission, PAGE_PERMISSION_MAP } from "@/lib/permissions";
import type { ModulePermissionsMap } from "@/lib/permissions";

// Both page paths and the auth API endpoints that don't require an existing session.
const PUBLIC_ADMIN_PATHS = [
  "/admin/login",
  "/admin/accept-invite",
  "/api/admin/auth/login",
  "/api/admin/auth/refresh",
  "/api/admin/auth/invite/accept",
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApiRoute = pathname.startsWith("/api/");

  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }
  if (PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // axios adds Authorization: Bearer for client API calls.
  // Page navigations and server-component internal fetches use the httpOnly cookie.
  const auth = req.headers.get("authorization");
  const cookieToken = req.cookies.get("admin_token")?.value;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : cookieToken;

  if (!token) {
    if (isApiRoute) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  let payload: ReturnType<typeof verifyAccessToken>;
  try {
    payload = verifyAccessToken(token);
  } catch (err) {
    // Expired token on a page route: let through so the client-side axios interceptor
    // can call /api/admin/auth/refresh with the persisted refreshToken and retry silently.
    // Hard-block (redirect / 401) only for missing or structurally invalid tokens.
    if ((err as Error).name === "TokenExpiredError" && !isApiRoute) {
      return NextResponse.next();
    }
    if (isApiRoute) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // Job 3 — page-level permission gate.
  // Real admin, wrong page → redirect to dashboard (not login).
  // Only applies to page routes, not API calls.
  if (!isApiRoute) {
    const match = Object.entries(PAGE_PERMISSION_MAP).find(([path]) => pathname.startsWith(path));
    if (match) {
      const [, required] = match;
      if (!hasPermission(payload.permissions as ModulePermissionsMap, payload.isSuper ?? false, required!.module, required!.action)) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
    }
  }

  // Job 2 — attach x-admin-* as request headers for API route handlers only.
  // Page routes already did their job (permission gating above) — no headers needed.
  if (isApiRoute) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-admin-id", payload.sub);
    requestHeaders.set("x-admin-is-super", String(payload.isSuper ?? false));
    requestHeaders.set("x-admin-permissions", JSON.stringify((payload.permissions as ModulePermissionsMap) ?? {}));
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
