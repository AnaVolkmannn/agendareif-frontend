"use client";

import { cn } from "@/lib/utils";

interface InspirationToggleFieldProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

/** Liga/desliga o envio de imagem de inspiração pelo cliente (RF06), por serviço. */
export function InspirationToggleField({
  checked,
  onCheckedChange,
}: InspirationToggleFieldProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-card px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold">Aceitar imagem de inspiração</p>
        <p className="text-xs text-muted-foreground">
          O cliente poderá anexar uma foto de referência ao agendar este serviço.
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label="Aceitar imagem de inspiração neste serviço"
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          checked ? "bg-primary" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "inline-block size-5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}