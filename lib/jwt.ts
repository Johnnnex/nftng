import "server-only";
import jwt from "jsonwebtoken";
import type { ModulePermissionsMap } from "@/lib/permissions";

export type AccessTokenPayload = {
  sub: string;
  isSuper: boolean;
  permissions: ModulePermissionsMap;
  iat: number;
  exp: number;
};

export function signAccessToken(payload: Omit<AccessTokenPayload, "iat" | "exp">): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "15m" });
}

export function signRefreshToken(adminId: string): string {
  return jwt.sign({ sub: adminId }, process.env.JWT_REFRESH_SECRET!, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): { sub: string } {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { sub: string };
}

export function signInviteToken(inviteId: string): string {
  return jwt.sign({ sub: inviteId }, process.env.JWT_SECRET!, { expiresIn: "8h" });
}

export function verifyInviteToken(token: string): { sub: string } {
  return jwt.verify(token, process.env.JWT_SECRET!) as { sub: string };
}
