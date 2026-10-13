"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import type { Role } from "@/types/auth";

const ROTAS = {
  login: "app/pages/login/page.tsx",
  trocaSenha: "/pages/professional/change-password",
  home: "/",
};

interface Props {
  roles?: Role[];
  allowPasswordChange?: boolean;
  children: ReactNode;
}

export default function RequireAuth({
  roles,
  allowPasswordChange = false,
  children,
}: Props) {
  const { session, loading } = useAuth();
  const router = useRouter();

  let redirectTo: string | null = null;
  if (!loading) {
    if (!session) redirectTo = ROTAS.login;
    else if (
      session.role === "PROFESSIONAL" &&
      session.mustChangePassword &&
      !allowPasswordChange
    )
      redirectTo = ROTAS.trocaSenha;
    else if (roles && !roles.includes(session.role)) redirectTo = ROTAS.home;
  }

  useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  if (loading || redirectTo) return null; // ou um spinner
  return <>{children}</>;
}
