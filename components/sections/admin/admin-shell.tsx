"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck2, Menu, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Users;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/pages/dashboard", label: "Dashboard", icon: CalendarCheck2 },
  { href: "/pages/manage-professionals", label: "Profissionais", icon: Users },
];

interface AdminShellProps {
  topLabel?: string;
  title: string;
  showAdminBadge?: boolean;
  children: ReactNode;
}

export function AdminShell({ topLabel, title, showAdminBadge, children }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/95 px-4 pb-3 pt-4 backdrop-blur supports-backdrop-filter:bg-background/80 md:px-8">
        {topLabel && (
          <p className="mb-2 text-[11px] font-semibold tracking-wide text-muted-foreground">
            {topLabel}
          </p>
        )}
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
          <Sheet>
            <SheetTrigger
              aria-label="Abrir menu"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg text-foreground transition hover:bg-muted"
            >
              <Menu className="size-6" />
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>agendareif</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Icon className="size-4.5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>

          <h1 className="text-center font-glacial text-2xl font-extrabold md:text-3xl">
            {title}
          </h1>

          {showAdminBadge ? (
            <Badge className="h-6 shrink-0 rounded-full bg-primary px-3 text-[11px] font-bold uppercase tracking-wide text-primary-foreground">
              Adm
            </Badge>
          ) : (
            <span aria-hidden="true" className="size-9 shrink-0" />
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-5 md:px-8 md:py-8">
        {children}
      </main>
    </div>
  );
}