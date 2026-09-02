"use client";

interface WeekStripProps {
  weekStart: Date;
  selectedDate: Date;
  diasComAgendamento: number[];
  onSelectDay: (date: Date) => void;
}

const DIAS_SEMANA = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

export function WeekStrip({
  weekStart,
  selectedDate,
  diasComAgendamento,
  onSelectDay,
}: WeekStripProps) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  return (
    <div className="mb-4 flex justify-center gap-2 overflow-x-auto pb-1">
      {days.map((date) => {
        const isSelected = date.toDateString() === selectedDate.toDateString();
        return (
          <button
            key={date.toISOString()}
            type="button"
            onClick={() => onSelectDay(date)}
            className={`relative flex w-11 shrink-0 flex-col items-center rounded-xl py-2 transition ${
              isSelected
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground hover:bg-muted"
            }`}
          >
            <span
              className={`text-[10px] ${
                isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
              }`}
            >
              {DIAS_SEMANA[date.getDay()]}
            </span>
            <span className="text-sm font-semibold">{date.getDate()}</span>
          </button>
        );
      })}
    </div>
  );
}