"use client";

import { Check } from "lucide-react";

import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Service } from "@/types/service";

interface ServiceCardProps {
  service: Service;
  selected: boolean;
  onSelect: (service: Service) => void;
}

export function ServiceCard({ service, selected, onSelect }: ServiceCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(service)}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center justify-between gap-4 rounded-3xl bg-secondary p-5 text-left text-secondary-foreground transition",
        "hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        selected && "ring-2 ring-white ring-offset-2 ring-offset-background"
      )}
    >
      <div className="min-w-0">
        <h2 className="font-glacial text-base font-bold md:text-lg">{service.name}</h2>
        <p className="mt-0.5 text-[13px] text-secondary-foreground/80 md:text-sm">
          {formatPrice(service.price)}
        </p>
      </div>

      <span
        aria-hidden="true"
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition",
          selected
            ? "border-white bg-white text-secondary"
            : "border-white/70 bg-transparent"
        )}
      >
        {selected && <Check className="size-4" strokeWidth={3} />}
      </span>
    </button>
  );
}
