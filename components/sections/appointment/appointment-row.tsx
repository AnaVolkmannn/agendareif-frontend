"use client";

import { useState } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import type { Appointment } from "@/lib/api/agenda";
import { PhotoViewer } from "@/components/sections/portfolio-professionals/photo-viewer";

interface AppointmentRowProps {
  appointment: Appointment;
  onDeleteClick: (appointment: Appointment) => void;
}

/** Acima disso (ou com quebra de linha) o texto passa de 2 linhas e ganha a seta. */
const LIMITE_OBSERVACAO_CURTA = 70;

export function AppointmentRow({ appointment, onDeleteClick }: AppointmentRowProps) {
  const isDisponivel = appointment.status === "disponivel";
  const [ampliada, setAmpliada] = useState(false);
  const [observacaoAberta, setObservacaoAberta] = useState(false);

  // Horário cancelado volta a ficar livre, então não mostra inspiração nem observação.
  const inspiracaoUrl = isDisponivel ? null : appointment.inspiracaoUrl;
  const observacao = isDisponivel ? null : appointment.observacao?.trim() || null;
  const observacaoLonga =
    !!observacao &&
    (observacao.length > LIMITE_OBSERVACAO_CURTA || observacao.includes("\n"));

  return (
    <div className="rounded-xl bg-card px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="w-12 shrink-0 text-sm font-semibold text-foreground">
          {appointment.time}
        </span>

        <div className="min-w-0 flex-1">
          {isDisponivel ? (
            <span className="text-sm font-semibold text-emerald-600">Disponível</span>
          ) : (
            <>
              <p className="text-sm font-semibold text-foreground">{appointment.service}</p>
              <p className="text-xs text-muted-foreground">{appointment.client}</p>
            </>
          )}
        </div>

        {inspiracaoUrl && (
          <button
            type="button"
            onClick={() => setAmpliada(true)}
            aria-label="Ver imagem de inspiração do cliente"
            title="Imagem de inspiração"
            className="size-10 shrink-0 overflow-hidden rounded-lg ring-1 ring-border transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- URL do Azure Blob, sem domínio configurado em next.config.ts */}
            <img src={inspiracaoUrl} alt="" className="h-full w-full object-cover" />
          </button>
        )}

        {ampliada && inspiracaoUrl && (
          <PhotoViewer url={inspiracaoUrl} onClose={() => setAmpliada(false)} />
        )}

        <button
          type="button"
          onClick={() => onDeleteClick(appointment)}
          disabled={isDisponivel}
          aria-label={isDisponivel ? "Sem agendamento" : "Cancelar agendamento"}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-foreground/60 transition hover:bg-muted hover:text-destructive disabled:pointer-events-none disabled:opacity-30"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {observacao && (
        <div className="mt-2 flex items-start gap-2 border-t border-border/60 pt-2 sm:pl-15">
          <p
            className={`min-w-0 flex-1 whitespace-pre-line break-words text-xs text-foreground/80 ${
              observacaoAberta ? "" : "line-clamp-2"
            }`}
          >
            <span className="font-semibold text-foreground">Obs.: </span>
            {observacao}
          </p>

          {observacaoLonga && (
            <button
              type="button"
              onClick={() => setObservacaoAberta((aberta) => !aberta)}
              aria-expanded={observacaoAberta}
              aria-label={observacaoAberta ? "Recolher observação" : "Ver observação completa"}
              className="flex size-6 shrink-0 items-center justify-center rounded-md text-foreground/60 transition hover:bg-muted"
            >
              <ChevronDown
                className={`size-4 transition-transform ${observacaoAberta ? "rotate-180" : ""}`}
              />
            </button>
          )}
        </div>
      )}
    </div>
  );
}