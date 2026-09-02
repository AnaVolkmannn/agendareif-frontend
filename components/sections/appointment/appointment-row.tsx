"use client";

import { Trash2 } from "lucide-react";
import type { Appointment } from "@/lib/api/agenda";

interface AppointmentRowProps {
  appointment: Appointment;
  onDeleteClick: (appointment: Appointment) => void;
}

export function AppointmentRow({ appointment, onDeleteClick }: AppointmentRowProps) {
  const isDisponivel = appointment.status === "disponivel";

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