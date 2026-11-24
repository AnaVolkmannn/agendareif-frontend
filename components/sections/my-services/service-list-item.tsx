"use client";

import { useState } from "react";
import { ChevronDown, Clock, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Service } from "@/types/service";

interface ServiceListItemProps {
  servico: Service;
  onEditar: (servico: Service) => void;
  onExcluir: (servico: Service) => void;
  /** Abre a foto de índice `index` ampliada. */
  onAbrirFoto: (servico: Service, index: number) => void;
}

export function ServiceListItem({
  servico,
  onEditar,
  onExcluir,
  onAbrirFoto,
}: ServiceListItemProps) {
  const [descricaoAberta, setDescricaoAberta] = useState(false);

  const descricao = servico.description?.trim();
  const fotos = servico.photos ?? [];

  return (
    <li className="flex items-start gap-3 rounded-xl border border-border/60 bg-card px-4 py-4 shadow-sm">
      <div className="min-w-0 flex-1">
        <p className="font-glacial text-[15px] font-bold">{servico.name}</p>

        <div className="mt-1 flex items-start gap-2">
          {/* whitespace-pre-line preserva as quebras de linha digitadas no
              cadastro; break-words evita estouro com palavras longas. */}
          <p
            className={cn(
              "min-w-0 flex-1 whitespace-pre-line break-words text-[13px] uppercase leading-snug text-muted-foreground",
              !descricaoAberta && "line-clamp-2"
            )}
          >
            {descricao || "Sem descrição cadastrada"}
          </p>

          {descricao && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setDescricaoAberta((atual) => !atual)}
              aria-expanded={descricaoAberta}
              aria-label={
                descricaoAberta
                  ? `Recolher descrição de ${servico.name}`
                  : `Ver descrição completa de ${servico.name}`
              }
              className="-mt-1 shrink-0 text-muted-foreground"
            >
              <ChevronDown
                className={cn("size-4 transition-transform", descricaoAberta && "rotate-180")}
              />
            </Button>
          )}
        </div>

        {fotos.length > 0 && (
          <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {fotos.map((url, index) => (
              <li key={url} className="shrink-0">
                <button
                  type="button"
                  onClick={() => onAbrirFoto(servico, index)}
                  aria-label={`Ampliar foto ${index + 1} de ${fotos.length} do serviço ${servico.name}`}
                  className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- URL externa (Azure), sem loader do next/image */}
                  <img
                    src={url}
                    alt=""
                    loading="lazy"
                    className="size-16 rounded-lg border border-border/60 object-cover transition hover:opacity-80 md:size-20"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-[15px] font-semibold">{formatPrice(servico.price)}</p>
          {servico.durationMin ? (
            <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <Clock className="size-4 text-primary" />
              {servico.durationMin}min
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-start gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onEditar(servico)}
          aria-label={`Editar ${servico.name}`}
          className="text-muted-foreground hover:text-secondary-hover"
        >
          <Pencil className="size-4.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onExcluir(servico)}
          aria-label={`Excluir ${servico.name}`}
          className="text-destructive hover:text-destructive/70"
        >
          <Trash2 className="size-4.5" />
        </Button>
      </div>
    </li>
  );
}