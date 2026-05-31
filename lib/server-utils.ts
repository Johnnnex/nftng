import "server-only";
import type { NextRequest } from "next/server";
import type { ModulePermissionsMap } from "@/lib/permissions";

export type AdminRequestContext = {
  adminId: string;
  isSuper: boolean;
  permissions: ModulePermissionsMap;
};

// Reads x-admin-* headers injected by proxy.ts for API routes.
// Proxy verifies the token — route handlers just consume the decoded identity.
export function getAdminFromRequest(req: NextRequest): AdminRequestContext | null {
  const adminId = req.headers.get("x-admin-id");
  if (!adminId) return null;
  const isSuper = req.headers.get("x-admin-is-super") === "true";
  let permissions: ModulePermissionsMap = {};
  try { permissions = JSON.parse(req.headers.get("x-admin-permissions") ?? "{}"); } catch {}
  return { adminId, isSuper, permissions };
}
