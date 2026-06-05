import axios, { type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/auth.store";

export type AuthMode = "none" | "auth";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "",
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig & { authMode?: AuthMode }) => {
    if (config.authMode === "auth") {
      const token = useAuthStore.getState().accessToken;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
);

let _refreshPromise: Promise<{ accessToken: string; refreshToken: string } | null> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as InternalAxiosRequestConfig & { authMode?: AuthMode; _retry?: boolean };
    if (error.response?.status === 401 && !original._retry && original.authMode === "auth") {
      original._retry = true;
      try {
        if (!_refreshPromise) {
          _refreshPromise = useAuthStore.getState().refreshTokens().finally(() => { _refreshPromise = null; });
        }
        const tokens = await _refreshPromise;
        if (!tokens) throw new Error("Refresh failed");

        original.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return api(original);
      } catch {
        useAuthStore.getState().clearAuth();
        if (typeof window !== "undefined") window.location.href = "/admin/login";
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);

export const authRequest = <T = any>(config: object) => // eslint-disable-line @typescript-eslint/no-explicit-any
  api.request<T>({ ...config, authMode: "auth" } as never);
