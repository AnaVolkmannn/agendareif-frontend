"use client";

import { useState } from "react";
import { ChevronDown, Images } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Service } from "@/types/service";

interface ServiceCardProps {
  service: Service;
  selected: boolean;
  onSelect: (service: Service) => void;
  onVerFotos: (service: Service) => void;
}

export function ServiceCard({
  service,
  selected,
  onSelect,
  onVerFotos,
}: ServiceCardProps) {
  const [descricaoAberta, setDescricaoAberta] = useState(false);

  const descricao = service.description?.trim();
  const totalFotos = service.photos?.length ?? 0;

  return (
    <div className="rounded-2xl bg-card p-4 text-card-foreground shadow-sm">
      {/* Só o bloco nome/preço + indicador seleciona: o chevron e o "Ver
          fotos" são controles próprios e não podem ficar dentro de um botão. */}
      <Button
        type="button"
        variant="ghost"
        onClick={() => onSelect(service)}
        aria-pressed={selected}
        className="h-auto w-full items-start justify-between gap-4 whitespace-normal p-0 text-left hover:bg-transparent"
      >
        <span className="min-w-0">
          <span className="block font-glacial text-lg font-bold">{service.name}</span>
          <span className="mt-0.5 block text-[15px] font-normal text-muted-foreground">
            {formatPrice(service.price)}
          </span>
        </span>

        <span
          aria-hidden="true"
          className={cn(
            "mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-primary transition",
            selected ? "bg-primary" : "bg-transparent"
          )}
        >
          {selected && <span className="size-2 rounded-full bg-card" />}
        </span>
      </Button>

      {descricao && (
        <div className="mt-2 flex items-start gap-2">
          <p
            className={cn(
              "min-w-0 flex-1 text-[13px] leading-snug text-muted-foreground",
              !descricaoAberta && "line-clamp-2"
            )}
          >
            {descricao}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setDescricaoAberta((atual) => !atual)}
            aria-expanded={descricaoAberta}
            aria-label={
              descricaoAberta
                ? `Recolher descrição de ${service.name}`
                : `Ver descrição completa de ${service.name}`
            }
            className="shrink-0 text-muted-foreground"
          >
            <ChevronDown
              className={cn("size-4 transition-transform", descricaoAberta && "rotate-180")}
            />
          </Button>
        </div>
      )}

      {totalFotos > 0 && (
        <Button
          type="button"
          variant="ghost"
          onClick={() => onVerFotos(service)}
          className="mt-3 h-8 gap-1.5 rounded-lg bg-primary/10 px-3 text-[13px] font-normal text-primary hover:bg-primary/20 hover:text-primary"
        >
          <Images className="size-4" />
          Ver fotos
        </Button>
      )}
    </div>
  );
}
