"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Appointment } from "@/lib/api/agenda";

interface CancelAppointmentModalProps {
  appointment: Appointment;
  formattedDate: string; // ex: "13/05/2026"
  onClose: () => void;
  onConfirm: () => void;
  isCancelling: boolean;
}

export function CancelAppointmentModal({
  appointment,
  formattedDate,
  onClose,
  onConfirm,
  isCancelling,
}: CancelAppointmentModalProps) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-2xl bg-white p-5 text-black shadow-xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 text-primary/70 transition hover:text-primary"
        >
          <X className="size-4" />
        </button>

        <h2 className="mb-3 pr-6 font-glacial text-base font-extrabold text-primary">Cancelar agendamento</h2>

        <p className="text-sm">
          {appointment.client} — {formattedDate} às {appointment.time}
        </p>
        <p className="text-sm">{appointment.service}</p>

        <Button
          type="button"
          onClick={onConfirm}
          disabled={isCancelling}
          className="mt-5 h-11 w-full rounded-lg text-[15px] font-semibold"
        >
          {isCancelling ? "Cancelando..." : "Confirmar cancelamento"}
        </Button>
      </div>
    </div>
  );
}