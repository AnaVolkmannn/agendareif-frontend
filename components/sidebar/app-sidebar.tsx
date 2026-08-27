"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck2, Users } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Users;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/pages/dashboard", label: "Dashboard", icon: CalendarCheck2 },
  { href: "/pages/manage-professionals", label: "Profissionais", icon: Users },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-3">
        <span className="px-1 font-glacial text-lg font-extrabold leading-none">
          agendareif
        </span>
      </SidebarHeader>

      <SidebarSeparator />

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
                      isActive={isActive}
                      tooltip={item.label}
                      className="h-10 gap-3 rounded-lg"
                    >
                      <Link href={item.href}>
                        <Icon className="size-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
