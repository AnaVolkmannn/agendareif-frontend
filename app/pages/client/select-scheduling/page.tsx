"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { BackButton } from "@/components/sections/booking/back-button";
import { BookingShell } from "@/components/sections/booking/booking-shell";
import { Button } from "@/components/ui/button";
import { CalendarMonth } from "@/components/sections/scheduling/calendar-month";
import { TimeSlotGrid } from "@/components/sections/scheduling/time-slot-grid";
import { markNavigatedWithinApp } from "@/lib/app-nav-state";
import { getAvailableDays, getAvailableTimes } from "@/lib/api/schedule";

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

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [availableDays, setAvailableDays] = useState<number[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isLoadingDays, setIsLoadingDays] = useState(true);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);

  useEffect(() => {
    setIsLoadingDays(true);
    setSelectedDay(null);
    setSelectedTime(null);
    setAvailableTimes([]);

    getAvailableDays(year, month).then((days) => {
      setAvailableDays(days);
      setIsLoadingDays(false);
    });
  }, [year, month]);

  useEffect(() => {
    if (selectedDay === null) return;

    setIsLoadingTimes(true);
    setSelectedTime(null);

    const date = new Date(year, month, selectedDay);
    getAvailableTimes(date).then((times) => {
      setAvailableTimes(times);
      setIsLoadingTimes(false);
    });
  }, [selectedDay, year, month]);

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
    if (!selectedDay || !selectedTime) return;

    // Preserva os params vindos das etapas anteriores (profissional, serviços).
    const params = new URLSearchParams(searchParams.toString());

    const dataAgendada = new Date(year, month, selectedDay);
    params.set("data", dataAgendada.toISOString().split("T")[0]); // YYYY-MM-DD
    params.set("hora", selectedTime);

    markNavigatedWithinApp();
    router.push(`/pages/client/addinspiration?${params.toString()}`);
  }

  const formattedSelectedDate = selectedDay
    ? `${String(selectedDay).padStart(2, "0")}/${String(month + 1).padStart(2, "0")}`
    : null;

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
        isLoading={isLoadingDays}
      />

      {selectedDay && (
        <div className="mt-8">
          <h2 className="mb-3 font-glacial text-sm font-bold text-foreground">
            Horários disponíveis — {formattedSelectedDate}
          </h2>
          <TimeSlotGrid
            times={availableTimes}
            selectedTime={selectedTime}
            onSelectTime={setSelectedTime}
            isLoading={isLoadingTimes}
          />
        </div>
      )}

      <div className="mt-auto pt-10 md:pt-16">
        <Button
          type="button"
          onClick={handleContinue}
          disabled={!selectedTime}
          className="h-11 w-full rounded-2xl text-[15px] font-semibold disabled:opacity-40 md:w-auto md:px-10"
        >
          Continuar
        </Button>
      </div>
    </BookingShell>
  );
}
