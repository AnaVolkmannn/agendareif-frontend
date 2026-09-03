"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AppointmentRow } from "@/components/sections/appointment/appointment-row";
import { CancelAppointmentModal } from "@/components/sections/appointment/cancel-appointment-modal";
import {
  cancelarAgendamento,
  getAgendaDoDia,
  type Appointment,
} from "@/lib/api/agenda";

type Periodo = "hoje" | "semana" | "mes";

const PERIODOS: { value: Periodo; label: string }[] = [
  { value: "hoje", label: "Hoje" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mês" },
];

export default function DashboardPage() {
  const [periodo, setPeriodo] = useState<Periodo>("hoje");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selecionado, setSelecionado] = useState<Appointment | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const hoje = new Date();

  const dataExibida = hoje
    .toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    })
    .replace(/^\w/, (c) => c.toUpperCase())
    .replace(" de ", " ");

  const dataFormatada = hoje.toLocaleDateString("pt-BR");

  useEffect(() => {
    setIsLoading(true);
    getAgendaDoDia().then((data) => {
      setAppointments(data);
      setIsLoading(false);
    });
  }, [periodo]);

  async function handleConfirmarCancelamento() {
    if (!selecionado) return;

    setIsCancelling(true);
    try {
      await cancelarAgendamento(selecionado.id);
      setAppointments((atual) =>
        atual.map((a) =>
          a.id === selecionado.id
            ? { ...a, status: "disponivel", service: null, client: null }
            : a
        )
      );
      setSelecionado(null);
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <SidebarInset>
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/95 px-4 pb-3 pt-4 backdrop-blur supports-backdrop-filter:bg-background/80 md:px-8">
        <div className="flex items-center justify-center">
          <h1 className="text-center font-glacial text-2xl font-extrabold md:text-3xl">
            Agenda
          </h1>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-2xl flex-col px-4 py-5 md:px-8 md:py-8">
        <div className="mb-5 flex justify-center gap-2">
          {PERIODOS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPeriodo(p.value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                periodo === p.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-muted/70"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <p className="mb-3 text-sm font-semibold text-foreground">{dataExibida}</p>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {appointments.map((appointment) => (
              <AppointmentRow
                key={appointment.id}
                appointment={appointment}
                onDeleteClick={setSelecionado}
              />
            ))}
          </div>
        )}

        <div className="sticky bottom-0 z-20 -mx-4 mt-auto border-t border-border/60 bg-background/95 px-4 py-4 backdrop-blur supports-backdrop-filter:bg-background/80 md:-mx-8 md:px-8">
          <Button
            variant="secondary"
            render={<Link href="/pages/professional/schedule" />}
            className="h-11 w-full rounded-lg text-[15px] font-semibold"
          >
            Ajustar horários
          </Button>
        </div>
      </main>

      {selecionado && (
        <CancelAppointmentModal
          appointment={selecionado}
          formattedDate={dataFormatada}
          onClose={() => setSelecionado(null)}
          onConfirm={handleConfirmarCancelamento}
          isCancelling={isCancelling}
        />
      )}
    </SidebarInset>
  );
}