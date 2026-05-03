import type {
    ApiResult, BasicRegisterPayload, LoginPayload, OtpRequestPayload, OtpVerifyPayload,
    VerificationSubmitPayload, StudentProfile, IdentityDocUpload
  } from "./types";
  
  const API = (import.meta as any).env?.VITE_API_URL ?? "/api"; // pointe vers ton backend
  
  let authToken: string | null = null;
  export const setAuthToken = (t: string | null) => { authToken = t; };
  
  const headers = () => ({
    "Authorization": authToken ? `Bearer ${authToken}` : "",
  });
  
  async function jsonFetch<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
    const res = await fetch(`${API}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...headers(),
        ...(init?.headers || {}),
      },
    });
    try {
      const data = await res.json();
      return data;
    } catch {
      return { ok: false, error: "Invalid JSON response" };
    }
  }
  
  export const AuthAPI = {
    registerBasic: (payload: BasicRegisterPayload) =>
      jsonFetch<{ user: StudentProfile; token: string }>("/auth/register-basic", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    login: (payload: LoginPayload) =>
      jsonFetch<{ token: string; needsOtp: boolean }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    requestOtp: (payload: OtpRequestPayload) =>
      jsonFetch<{}>("/auth/otp/request", { method: "POST", body: JSON.stringify(payload) }),
    verifyOtp: (payload: OtpVerifyPayload) =>
      jsonFetch<{ token: string }>("/auth/otp/verify", { method: "POST", body: JSON.stringify(payload) }),
    me: () => jsonFetch<StudentProfile>("/me", { method: "GET" }),
  };
  
  export const FilesAPI = {
    // upload sécurisé -> backend stocke chiffré (AES-256), tu reçois un fileId
    upload: async (doc: IdentityDocUpload) => {
      const fd = new FormData();
      fd.append("file", doc.file);
      fd.append("kind", doc.kind);
      const res = await fetch(`${API}/files/upload`, {
        method: "POST",
        headers: { ...headers() },
        body: fd,
      });
      return (await res.json()) as ApiResult<{ fileId: string }>;
    },
  };
  
  export const VerifyAPI = {
    submit: (payload: VerificationSubmitPayload) =>
      jsonFetch<{ profile: StudentProfile }>("/verify/submit", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    // côté agent: approve/reject (exposé pour plus tard)
  };
  
  export const AuditAPI = {
    log: (evt: any) => jsonFetch<{}>("/audit", { method: "POST", body: JSON.stringify(evt) }),
  };
  