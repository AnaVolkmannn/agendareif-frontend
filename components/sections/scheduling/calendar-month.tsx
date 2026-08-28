"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function getMonthMatrix(year: number, month: number) {
  const startWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const matrix: (number | null)[][] = [];
  let week: (number | null)[] = new Array(startWeekday).fill(null);

  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      matrix.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    matrix.push(week);
  }
  return matrix;
}

interface CalendarMonthProps {
  year: number;
  month: number;
  availableDays: number[];
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  isLoading?: boolean;
}

export function CalendarMonth({
  year,
  month,
  availableDays,
  selectedDay,
  onSelectDay,
  onPrevMonth,
  onNextMonth,
  isLoading,
}: CalendarMonthProps) {
  const matrix = getMonthMatrix(year, month);

  return (
    <div className="rounded-2xl bg-card p-4 text-card-foreground">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onPrevMonth}
          aria-label="Mês anterior"
          className="rounded-full p-1 transition hover:bg-muted"
        >
          <ChevronLeft className="size-5" />
        </button>
        <span className="font-medium">
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={onNextMonth}
          aria-label="Próximo mês"
          className="rounded-full p-1 transition hover:bg-muted"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-2 text-center text-xs text-muted-foreground">
        {WEEKDAYS.map((day, i) => (
          <span key={i}>{day}</span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-y-2 text-center text-sm">
        {matrix.flat().map((day, i) => {
          if (day === null) return <span key={i} />;

          const isAvailable = availableDays.includes(day);
          const isSelected = selectedDay === day;

          return (
            <button
              key={i}
              disabled={!isAvailable || isLoading}
              onClick={() => onSelectDay(day)}
              className={`mx-auto flex size-8 items-center justify-center rounded-full transition ${
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : isAvailable
                    ? "cursor-pointer text-foreground hover:bg-muted"
                    : "cursor-default text-muted-foreground/40"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}