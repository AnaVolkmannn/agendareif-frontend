"use client";

interface TimeSlotGridProps {
  times: string[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  isLoading?: boolean;
}

export function TimeSlotGrid({
  times,
  selectedTime,
  onSelectTime,
  isLoading,
}: TimeSlotGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-11 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (times.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum horário disponível para esse dia.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {times.map((time) => {
        const isSelected = selectedTime === time;
        return (
          <button
            key={time}
            onClick={() => onSelectTime(time)}
            className={`h-11 rounded-xl border text-sm font-medium transition ${
              isSelected
                ? "border-primary bg-primary text-primary-foreground"
                : "cursor-pointer border-border bg-input text-foreground hover:border-primary/50"
            }`}
          >
            {time}
          </button>
        );
      })}
    </div>
  );
}