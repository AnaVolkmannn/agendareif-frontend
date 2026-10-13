"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import RequireAuth from "@/auth/RequireAuth";

/**
 * Layout de todas as telas em /pages. Quem decide o que aparece é a rota:
 *  - /pages/client/** e /pages/login  -> públicas, sem sidebar
 *  - /pages/professional/change-password -> só profissional, sem sidebar
 *  - /pages/admin/**                  -> só ADMIN, com sidebar
 *  - /pages/professional/**           -> só PROFESSIONAL, com sidebar
 */
export default function PagesLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // primeiro acesso: o profissional ainda precisa trocar a senha provisória
  if (pathname.startsWith("/pages/professional/change-password")) {
    return (
      <RequireAuth roles={["PROFESSIONAL"]} allowPasswordChange>
        {children}
      </RequireAuth>
    );
  }

  const isAdmin = pathname.startsWith("/pages/admin");
  const isProfessional = pathname.startsWith("/pages/professional");

  // fluxo do cliente e login: sem autenticação e sem sidebar
  if (!isAdmin && !isProfessional) return <>{children}</>;

  return (
    <RequireAuth roles={[isAdmin ? "ADMIN" : "PROFESSIONAL"]}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </RequireAuth>
  );
}
