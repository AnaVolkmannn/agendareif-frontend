"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OPCOES_HORARIO } from "@/lib/api/horarios";
import { cn } from "@/lib/utils";

const ITENS = OPCOES_HORARIO.map((hora) => ({ label: hora, value: hora }));

interface TimeSelectProps {
  value: string | null;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  className?: string;
}

export function TimeSelect({
  value,
  onChange,
  placeholder,
  ariaLabel,
  className,
}: TimeSelectProps) {
  return (
    <Select
      items={ITENS}
      value={value}
      onValueChange={(novo) => {
        if (typeof novo === "string") onChange(novo);
      }}
    >
      <SelectTrigger
        aria-label={ariaLabel}
        className={cn("h-9 w-full justify-between bg-card", className)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {OPCOES_HORARIO.map((hora) => (
          <SelectItem key={hora} value={hora}>
            {hora}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
