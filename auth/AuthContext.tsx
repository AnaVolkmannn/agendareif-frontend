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
  /**
   * true enquanto a senha digitada no login continuar em memória. A tela de
   * primeiro acesso usa isso para esconder o campo de senha provisória: não
   * faz sentido pedir de novo o que a pessoa acabou de digitar no login.
   * Vira false ao recarregar a página, e aí o campo precisa reaparecer.
   */
  temSenhaEmMemoria: boolean;
  login: (email: string, password: string) => Promise<Session>;
  /** oldPassword null usa a senha guardada em memória desde o login. */
  changePassword: (
    oldPassword: string | null,
    newPassword: string,
  ) => Promise<Session>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true); // true até ler o localStorage
  // Só em memória, nunca no localStorage: some ao recarregar e no logout.
  const [senhaDoLogin, setSenhaDoLogin] = useState<string | null>(null);

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
    setSenhaDoLogin(password);
    return data;
  }

  async function changePassword(
    oldPassword: string | null,
    newPassword: string,
  ) {
    if (!session) throw new Error("Sessão não encontrada");

    // A API exige a senha atual. No primeiro acesso ela é a mesma que a
    // pessoa acabou de usar no login, então reaproveitamos em vez de pedir
    // de novo; a tela de perfil continua passando a sua explicitamente.
    const senhaAtual = oldPassword ?? senhaDoLogin;
    if (!senhaAtual) throw new Error("Senha atual não informada");

    // a API devolve um token novo com mustChangePassword = false
    const data = await api<Session>(
      `/professionals/${session.id}/change-password`,
      {
        method: "PATCH",
        body: { oldPassword: senhaAtual, newPassword },
      },
    );
    setSenhaDoLogin(null);
    saveSession(data);
    return data;
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("session");
    setSenhaDoLogin(null);
    setSession(null);
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        temSenhaEmMemoria: senhaDoLogin !== null,
        login,
        changePassword,
        logout,
      }}
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
