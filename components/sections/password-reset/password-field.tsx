"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (valor: string) => void;
  autoComplete: string;
  invalido?: boolean;
  autoFocus?: boolean;
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  invalido,
  autoFocus,
}: PasswordFieldProps) {
  const [visivel, setVisivel] = useState(false);

  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </Label>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />
        <Input
          id={id}
          type={visivel ? "text" : "password"}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          placeholder="••••••••"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={invalido}
          className="h-12 rounded-xl border-transparent bg-card px-9 shadow-sm"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setVisivel((atual) => !atual)}
          aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
          className="absolute right-2 top-1/2 size-7 -translate-y-1/2 text-neutral-500 hover:bg-transparent hover:text-neutral-700 dark:hover:text-neutral-300"
        >
          {visivel ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </Button>
      </div>
    </div>
  );
}
