"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarCheck2, Clock, LayoutDashboard, LogOut, Scissors, UserRound, Users } from "lucide-react";
import { ModeToggle } from "../theme/mode-toggle";
import { useAuth } from "@/auth/AuthContext";
import type { Role } from "@/types/auth";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";


interface NavItem {
  href: string;
  label: string;
  icon: typeof Users;
  roles: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { href: "/pages/professional/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["PROFESSIONAL"] },
  { href: "/pages/admin/manage-professionals", label: "Profissionais", icon: Users, roles: ["ADMIN"] },
  { href: "/pages/professional/portfolio", label: "Portfólio", icon: Users, roles: ["PROFESSIONAL"] },
  { href: "/pages/professional/appointment", label: "Agenda", icon: CalendarCheck2, roles: ["PROFESSIONAL"] },
  { href: "/pages/professional/schedule", label: "Ajustar horários", icon: Clock, roles: ["PROFESSIONAL"] },
  { href: "/pages/professional/services", label: "Meus serviços", icon: Scissors, roles: ["PROFESSIONAL"] },
  { href: "/pages/professional/profile", label: "Meu perfil", icon: UserRound, roles: ["PROFESSIONAL"] },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, logout } = useAuth();

  // cada papel só enxerga os itens do seu fluxo
  const items = NAV_ITEMS.filter((item) => session && item.roles.includes(session.role));

  function handleSair() {
    logout();
    router.push("/pages/login");
  }
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex flex-row items-center justify-between px-3 py-3 group-data-[collapsible=icon]:justify-center">
        <div className="flex flex-col group-data-[collapsible=icon]:hidden">
          <span className="truncate px-1 font-barbra text-xl leading-none dark:text-primary">
            Reif
          </span>
          <span className="truncate px-1 font-barbra text-lg leading-none">
            Beauty Studio
          </span>
        </div>
        <SidebarTrigger className="hidden shrink-0 md:inline-flex" />
      </SidebarHeader>

      <SidebarContent className="px-1">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      tooltip={item.label}
                      className="h-10 gap-3 rounded-lg"
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      <div className="mx-3 my-2 border-t border-sidebar-border" />

       <SidebarGroup>
        <SidebarGroupContent>
           <SidebarMenu>
             <SidebarMenuItem>
               <SidebarMenuButton                 
                onClick={handleSair}
                 tooltip="Sair"
                 className="h-10 gap-3 rounded-lg"
                >
                 <LogOut className="size-4 shrink-0" />
                 <span className="truncate">Sair</span>
               </SidebarMenuButton>
             </SidebarMenuItem>
           </SidebarMenu>
         </SidebarGroupContent>
       </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="mx-auto flex max-w-6xl items-center">
          <ModeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}