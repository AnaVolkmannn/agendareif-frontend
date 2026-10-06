"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { api, ApiError } from "@/lib/api/client";
import type { Session } from "@/types/auth";

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<Session>;
  changePassword: (
    oldPassword: string,
    newPassword: string,
  ) => Promise<Session>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true); // true até ler o localStorage

  useEffect(() => {
    const raw = localStorage.getItem("session");
    if (raw) setSession(JSON.parse(raw) as Session);
    setLoading(false);
  }, []);

  function saveSession(data: Session) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("session", JSON.stringify(data));
    setSession(data);
  }

  async function login(email: string, password: string) {
    const data = await api<Session>("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    });
    saveSession(data);
    return data;
  }

  async function changePassword(oldPassword: string, newPassword: string) {
    if (!session) throw new Error("Sessão não encontrada");
    // a API devolve um token novo com mustChangePassword = false
    const data = await api<Session>(
      `/professionals/${session.id}/change-password`,
      {
        method: "PATCH",
        body: { oldPassword, newPassword },
      },
    );
    saveSession(data);
    return data;
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("session");
    setSession(null);
  }

  return (
    <AuthContext.Provider
      value={{ session, loading, login, changePassword, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
