import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getCurrentUser, loginUser, loginWithGitHub, loginWithGoogle, logoutUser } from "../api/auth";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginGoogle: (accessToken: string) => Promise<void>;
  loginGitHub: (code: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function hasAuthHint(): boolean {
  return document.cookie.split(";").some((c) => c.trim().startsWith("auth_hint="));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!hasAuthHint()) {
      setIsLoading(false);
      return;
    }
    getCurrentUser()
      .then((u) => {
        sessionStorage.setItem("auth_active", "1");
        setUser(u);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  async function login(email: string, password: string) {
    await loginUser(email, password);
    sessionStorage.setItem("auth_active", "1");
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  }

  async function loginGoogle(accessToken: string) {
    await loginWithGoogle(accessToken);
    sessionStorage.setItem("auth_active", "1");
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  }

  async function loginGitHub(code: string) {
    await loginWithGitHub(code);
    sessionStorage.setItem("auth_active", "1");
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  }

  function logout() {
    sessionStorage.removeItem("auth_active");
    logoutUser().catch(() => {});
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, isLoading, login, loginGoogle, loginGitHub, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
