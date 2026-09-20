// ============================================================
// src/lib/api.ts — client HTTP unique (même convention que frontend-embassy)
// ============================================================
//
// Remplace les deux anciennes couches concurrentes (src/api/axios.ts+services
// et cet ancien src/lib/api.ts basé sur fetch) : un seul point d'entrée, le
// gateway nginx (infra/nginx/nginx.conf), qui décide lui-même identity-api
// vs ambassade-api selon le préfixe de chemin.

import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost";
const REQUEST_TIMEOUT = 30000;

const ACCESS_TOKEN_KEY = "poramma_community_access_token";
const REFRESH_TOKEN_KEY = "poramma_community_refresh_token";

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Refresh en vol partagé entre requêtes concurrentes — même principe que
 * frontend-embassy/src/lib/api.ts (évite que deux 401 simultanés appellent
 * chacun /auth/refresh avec le même refreshToken, dont un seul réussirait).
 */
let refreshPromise: Promise<{ accessToken: string; refreshToken: string }> | null = null;

function refreshTokens(): Promise<{ accessToken: string; refreshToken: string }> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) throw new Error("No refresh token");

      // axios brut, pas `api` — évite de re-rentrer dans ces intercepteurs.
      const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
      setTokens(data.data.accessToken, data.data.refreshToken);
      return data.data as { accessToken: string; refreshToken: string };
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && getRefreshToken()) {
      original._retry = true;
      try {
        const { accessToken } = await refreshTokens();
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        clearTokens();
        window.location.href = "/signin";
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);
