import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ModulePermissionsMap } from "@/lib/permissions";

export type AdminProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isSuper: boolean;
  permissions: ModulePermissionsMap;
};

type LoginPayload = { email: string; password: string };
type AcceptInvitePayload = { token: string; password: string };
type AuthApiResponse = { accessToken: string; refreshToken: string; admin: AdminProfile };

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  admin: AdminProfile | null;
  hydrated: boolean;
  login: (data: LoginPayload) => Promise<void>;
  acceptInvite: (data: AcceptInvitePayload) => Promise<void>;
  logout: () => Promise<void>;
  setTokens: (access: string, refresh: string) => void;
  setAdmin: (admin: AdminProfile) => void;
  clearAuth: () => void;
  setHydrated: () => void;
  // Uses raw fetch intentionally — called by the axios interceptor on 401.
  // Using the api instance here would create a circular call chain.
  refreshTokens: () => Promise<{ accessToken: string; refreshToken: string } | null>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      admin: null,
      hydrated: false,

      // Dynamic import avoids circular dependency: lib/api.ts already imports useAuthStore.
      login: async (data) => {
        const { api } = await import("@/lib/api");
        const res = await api.post<{ data: AuthApiResponse }>("/api/admin/auth/login", data);
        const { accessToken, refreshToken, admin } = res.data.data;
        set({ accessToken, refreshToken, admin });
      },

      acceptInvite: async (data) => {
        const { api } = await import("@/lib/api");
        const res = await api.post<{ data: AuthApiResponse }>("/api/admin/auth/invite/accept", data);
        const { accessToken, refreshToken, admin } = res.data.data;
        set({ accessToken, refreshToken, admin });
      },

      logout: async () => {
        const { refreshToken } = get();
        try {
          await fetch("/api/admin/auth/logout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });
        } finally {
          set({ accessToken: null, refreshToken: null, admin: null });
        }
      },

      setTokens: (access, refresh) => set({ accessToken: access, refreshToken: refresh }),
      setAdmin: (admin) => set({ admin }),
      clearAuth: () => set({ accessToken: null, refreshToken: null, admin: null }),
      setHydrated: () => set({ hydrated: true }),

      refreshTokens: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return null;
        try {
          const res = await fetch("/api/admin/auth/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });
          if (!res.ok) {
            get().clearAuth();
            return null;
          }
          const { data } = await res.json();
          set({ accessToken: data.accessToken, refreshToken: data.refreshToken });
          return { accessToken: data.accessToken, refreshToken: data.refreshToken };
        } catch {
          get().clearAuth();
          return null;
        }
      },
    }),
    {
      name: "nftng-auth",
      partialize: (state) => ({
        refreshToken: state.refreshToken,
        admin: state.admin,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
