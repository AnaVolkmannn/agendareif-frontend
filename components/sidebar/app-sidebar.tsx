"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck2, UserRound, Users } from "lucide-react";
import { ModeToggle } from "../theme/mode-toggle";

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
  SidebarTrigger,
} from "@/components/ui/sidebar";


interface NavItem {
  href: string;
  label: string;
  icon: typeof Users;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/pages/professional/dashboard", label: "Dashboard", icon: CalendarCheck2 },
  { href: "/pages/admin/manage-professionals", label: "Profissionais", icon: Users },
  { href: "/pages/professional/portfolio", label: "Portfólio", icon: Users },
  { href: "/pages/professional/appointment", label: "Agenda", icon: CalendarCheck2 },
  { href: "/pages/professional/profile", label: "Meu perfil", icon: UserRound },
  { href: "/pages/login", label: "Login", icon: Users,},
];

export function AppSidebar() {
  const pathname = usePathname();

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
              {NAV_ITEMS.map((item) => {
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
      </SidebarContent>

      <SidebarFooter>
        <div className="mx-auto flex max-w-6xl items-center">
          <ModeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}