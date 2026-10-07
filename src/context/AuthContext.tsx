import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService } from "../lib/services";
import { getAccessToken, clearTokens } from "../lib/api";
import type { AuthUser } from "../lib/types";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<AuthUser>;
  /** Connexion / inscription avec Google ; `isNewUser` = le compte vient d'être créé. */
  loginWithGoogle: (credential: string, rememberMe?: boolean) => Promise<{ user: AuthUser; isNewUser: boolean }>;
  sendOtp: (email: string) => Promise<void>;
  verifyOtp: (data: { email: string; otp: string; password: string; firstName: string; lastName: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (getAccessToken()) {
      authService
        .me()
        .then(setUser)
        .catch(() => {
          clearTokens();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string, rememberMe?: boolean) => {
    const loggedInUser = await authService.login(email, password, rememberMe);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const loginWithGoogle = async (credential: string, rememberMe?: boolean) => {
    const result = await authService.google(credential, rememberMe);
    setUser(result.user);
    return result;
  };

  const sendOtp = async (email: string) => {
    await authService.sendOtp(email);
  };

  const verifyOtp = async (data: { email: string; otp: string; password: string; firstName: string; lastName: string; phone?: string }) => {
    await authService.verifyOtp(data);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    setUser(await authService.me());
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, sendOtp, verifyOtp, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
