"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AppointmentRow } from "@/components/sections/appointment/appointment-row";
import { CancelAppointmentModal } from "@/components/sections/appointment/cancel-appointment-modal";
import { WeekStrip } from "@/components/sections/appointment/week-strip";
import { MonthCalendar } from "@/components/sections/appointment/month-calendar";
import {
  cancelarAgendamento,
  getAgendaPorData,
  getDiasComAgendamento,
  type Appointment,
} from "@/lib/api/agenda";

type Periodo = "hoje" | "semana" | "mes";

const PERIODOS: { value: Periodo; label: string }[] = [
  { value: "hoje", label: "Hoje" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mês" },
];

function inicioDaSemana(date: Date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function formatarData(date: Date) {
  return date
    .toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    })
    .replace(/^\w/, (c) => c.toUpperCase())
    .replace(" de ", " ");
}

export default function DashboardPage() {
  const [periodo, setPeriodo] = useState<Periodo>("hoje");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [diasComAgendamento, setDiasComAgendamento] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
  const [selecionado, setSelecionado] = useState<Appointment | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const weekStart = useMemo(() => inicioDaSemana(selectedDate), [selectedDate]);

  useEffect(() => {
    setIsLoading(true);
    getAgendaPorData(selectedDate).then((data) => {
      setAppointments(data);
      setIsLoading(false);
    });
  }, [selectedDate]);

  useEffect(() => {
    if (periodo !== "mes") return;
    setIsLoadingCalendar(true);
    getDiasComAgendamento(calendarYear, calendarMonth).then((dias) => {
      setDiasComAgendamento(dias);
      setIsLoadingCalendar(false);
    });
  }, [periodo, calendarYear, calendarMonth]);

  function handlePrevMonth() {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((y) => y - 1);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  }

  function handleNextMonth() {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((y) => y + 1);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  }

  async function handleConfirmarCancelamento() {
    if (!selecionado) return;

    setIsCancelling(true);
    try {
      await cancelarAgendamento(selecionado.id);
      setAppointments((atual) =>
        atual.map((a) =>
          a.id === selecionado.id
            ? { ...a, status: "disponivel", service: null, client: null }
            : a,
        ),
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
            <Button
              key={p.value}
              type="button"
              variant={periodo === p.value ? "default" : "secondary"}
              onClick={() => setPeriodo(p.value)}
              className="rounded-full px-4 py-2 text-sm font-semibold"
            >
              {p.label}
            </Button>
          ))}
        </div>

        {periodo === "semana" && (
          <WeekStrip
            weekStart={weekStart}
            selectedDate={selectedDate}
            diasComAgendamento={diasComAgendamento}
            onSelectDay={setSelectedDate}
          />
        )}

        {periodo === "mes" && (
          <MonthCalendar
            year={calendarYear}
            month={calendarMonth}
            diasComAgendamento={diasComAgendamento}
            selectedDay={selectedDate.getDate()}
            onSelectDay={(day) =>
              setSelectedDate(new Date(calendarYear, calendarMonth, day))
            }
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            isLoading={isLoadingCalendar}
          />
        )}

        <p className="mb-3 text-sm font-semibold text-foreground">
          {formatarData(selectedDate)}
        </p>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Sem nenhum agendamento
          </p>
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
            render={
              <Link href="/pages/professional/schedule">Ajustar horários</Link>
            }
            className="h-11 w-full rounded-lg text-[15px] font-semibold"
          />
        </div>
      </main>

      {selecionado && (
        <CancelAppointmentModal
          appointment={selecionado}
          formattedDate={selectedDate.toLocaleDateString("pt-BR")}
          onClose={() => setSelecionado(null)}
          onConfirm={handleConfirmarCancelamento}
          isCancelling={isCancelling}
        />
      )}
    </SidebarInset>
  );
}
