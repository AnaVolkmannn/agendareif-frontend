"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { Appointment } from "@/lib/api/agenda";
import { PhotoViewer } from "@/components/sections/portfolio-professionals/photo-viewer";

interface AppointmentRowProps {
  appointment: Appointment;
  onDeleteClick: (appointment: Appointment) => void;
}

export function AppointmentRow({ appointment, onDeleteClick }: AppointmentRowProps) {
  const isDisponivel = appointment.status === "disponivel";
  const [ampliada, setAmpliada] = useState(false);

  // Horário cancelado volta a ficar livre, então não mostra inspiração.
  const inspiracaoUrl = isDisponivel ? null : appointment.inspiracaoUrl;

  return (
    <div className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 shadow-sm">
      <span className="w-12 shrink-0 text-sm font-semibold text-foreground">
        {appointment.time}
      </span>

      <div className="flex-1">
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
  );
}