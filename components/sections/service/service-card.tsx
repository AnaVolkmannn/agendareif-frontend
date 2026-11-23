"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Service } from "@/types/service";

interface ServiceCardProps {
  service: Service;
  selected: boolean;
  onSelect: (service: Service) => void;
  /** Abre a foto de índice `index` ampliada. */
  onAbrirFoto: (service: Service, index: number) => void;
}

export function ServiceCard({
  service,
  selected,
  onSelect,
  onAbrirFoto,
}: ServiceCardProps) {
  const [descricaoAberta, setDescricaoAberta] = useState(false);
  const [descricaoCortada, setDescricaoCortada] = useState(false);
  const descricaoRef = useRef<HTMLParagraphElement>(null);

  const descricao = service.description?.trim();
  const fotos = service.photos ?? [];

  // Descrição curta cabe nas duas linhas e não tem o que expandir, então a
  // seta só aparece quando o texto está mesmo cortado. Medimos só enquanto
  // está recolhido: aberto, o elemento cresce e nunca sobra nada.
  useEffect(() => {
    const elemento = descricaoRef.current;
    if (!elemento || descricaoAberta) return;

    // O primeiro disparo do observer já serve de medição inicial, e os
    // seguintes cobrem a troca de largura da tela (o corte muda com ela).
    const observer = new ResizeObserver(() => {
      setDescricaoCortada(elemento.scrollHeight > elemento.clientHeight + 1);
    });
    observer.observe(elemento);
    return () => observer.disconnect();
  }, [descricao, descricaoAberta]);

  // Aberta, a seta precisa continuar lá para dar como recolher.
  const mostrarSeta = descricaoCortada || descricaoAberta;

  return (
    <div className="rounded-2xl bg-card p-4 text-card-foreground shadow-sm">
      {/* Só o bloco nome/preço + indicador seleciona: o chevron e as
          miniaturas são controles próprios e não podem ficar dentro de um botão. */}
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
            ref={descricaoRef}
            className={cn(
              "min-w-0 flex-1 text-[13px] leading-snug text-muted-foreground",
              !descricaoAberta && "line-clamp-2"
            )}
          >
            {descricao}
          </p>
          {mostrarSeta && (
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
          )}
        </div>
      )}

      {fotos.length > 0 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {fotos.map((url, index) => (
            <li key={url} className="shrink-0">
              <button
                type="button"
                onClick={() => onAbrirFoto(service, index)}
                aria-label={`Ampliar foto ${index + 1} de ${fotos.length} do serviço ${service.name}`}
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
    </div>
  );
}