"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { BackButton } from "@/components/sections/booking/back-button";
import { BookingShell } from "@/components/sections/booking/booking-shell";
import { Button } from "@/components/ui/button";
import { CalendarMonth } from "@/components/sections/scheduling/calendar-month";
import { TimeSlotGrid } from "@/components/sections/scheduling/time-slot-grid";
import { markNavigatedWithinApp } from "@/lib/app-nav-state";
import { getAvailableSlots, getSelectableDays, type AvailableSlot } from "@/lib/api/scheduling";

export default function SchedulingPage() {
  return (
    <Suspense fallback={null}>
      <SchedulingContent />
    </Suspense>
  );
}

function SchedulingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const profissionalNome = searchParams.get("profissionalNome");

  // TODO: confirme com as telas de seleção de profissional/serviço qual
  // nome de parâmetro elas realmente usam — aceita os dois formatos por
  // segurança, mas o ideal é padronizar em um só.
  const professionalIdParam =
    searchParams.get("profissionalId") ?? searchParams.get("professionalId");
  const serviceIdParam = searchParams.get("servicoId") ?? searchParams.get("serviceId");

  const professionalId = professionalIdParam ? Number(professionalIdParam) : null;
  const serviceId = serviceIdParam ? Number(serviceIdParam) : null;
  const missingParams = !professionalId || !serviceId;

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);

  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const availableDays = getSelectableDays(year, month);

  useEffect(() => {
    setSelectedDay(null);
    setSelectedSlot(null);
    setSlots([]);
  }, [year, month]);

  useEffect(() => {
    if (selectedDay === null || missingParams || !professionalId || !serviceId) return;

    setIsLoadingTimes(true);
    setSelectedSlot(null);
    setLoadError(null);

    const date = new Date(year, month, selectedDay);

    getAvailableSlots(professionalId, serviceId, date)
      .then((data) => setSlots(data))
      .catch(() => setLoadError("Não foi possível carregar os horários. Tente novamente."))
      .finally(() => setIsLoadingTimes(false));
  }, [selectedDay, year, month, professionalId, serviceId, missingParams]);

  function handlePrevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function handleNextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  function handleContinue() {
    if (!selectedSlot) return;

    const params = new URLSearchParams(searchParams.toString());
    // Horário exato devolvido pelo backend — já considera duração/conflitos.
    params.set("scheduledAt", selectedSlot.isoDateTime);
    params.set("data", selectedSlot.isoDateTime.slice(0, 10));
    params.set("hora", selectedSlot.time);

    markNavigatedWithinApp();
    router.push(`/pages/client/addinspiration?${params.toString()}`);
  }

  const formattedSelectedDate = selectedDay
    ? `${String(selectedDay).padStart(2, "0")}/${String(month + 1).padStart(2, "0")}`
    : null;

  if (missingParams) {
    return (
      <BookingShell>
        <header className="mb-2 flex items-center">
          <BackButton fallbackHref="/pages/client/select-service" />
        </header>
        <p className="mt-10 text-sm text-destructive" role="alert">
          Profissional ou serviço não informado. Volte e selecione novamente.
        </p>
      </BookingShell>
    );
  }

  return (
    <BookingShell>
      <header className="mb-2 flex items-center">
        <BackButton fallbackHref="/pages/client/select-service" />
      </header>

      <h1 className="mb-0.5 mt-2 font-glacial text-xl font-extrabold md:text-2xl">
        Escolha a data e hora
      </h1>
      <p className="mb-6 text-[13px] text-foreground/70 md:text-sm">
        {profissionalNome
          ? `Verifique a disponibilidade de ${profissionalNome}`
          : "Verifique a disponibilidade"}
      </p>

      <CalendarMonth
        year={year}
        month={month}
        availableDays={availableDays}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        isLoading={false}
      />

      {selectedDay && (
        <div className="mt-8">
          <h2 className="mb-3 font-glacial text-sm font-bold text-foreground">
            Horários disponíveis — {formattedSelectedDate}
          </h2>

          {loadError ? (
            <p className="text-sm text-destructive" role="alert">
              {loadError}
            </p>
          ) : !isLoadingTimes && slots.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum horário disponível para esse dia.
            </p>
          ) : (
            <TimeSlotGrid
              times={slots.map((s) => s.time)}
              selectedTime={selectedSlot?.time ?? null}
              onSelectTime={(time) =>
                setSelectedSlot(slots.find((s) => s.time === time) ?? null)
              }
              isLoading={isLoadingTimes}
            />
          )}
        </div>
      )}

      <div className="mt-auto pt-10 md:pt-16">
        <Button
          type="button"
          onClick={handleContinue}
          disabled={!selectedSlot}
          className="h-11 w-full rounded-2xl text-[15px] font-semibold disabled:opacity-40 md:w-auto md:px-10"
        >
          Continuar
        </Button>
      </div>
    </BookingShell>
  );
}