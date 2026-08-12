import type { ReactNode } from "react";

interface BookingShellProps {
  children: ReactNode;
}

export function BookingShell({ children }: BookingShellProps) {
  return (
    <main className="min-h-screen bg-black px-6 pb-12 pt-6 text-white md:px-12 md:pt-10 lg:px-20">
      <div className="mx-auto flex w-full max-w-3xl flex-col">{children}</div>
    </main>
  );
}