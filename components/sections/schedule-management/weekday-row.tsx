"use client";

import { Clock, Coffee, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TimeSelect } from "@/components/sections/schedule-management/time-select";
import { getNomeDia } from "@/lib/api/horarios";
import { cn } from "@/lib/utils";
import type { DiaHorario, Intervalo } from "@/types/horario";

interface WeekdayRowProps {
  dia: DiaHorario;
  onChange: (dia: DiaHorario) => void;
}

export function WeekdayRow({ dia, onChange }: WeekdayRowProps) {
  const nome = getNomeDia(dia.diaSemana);

  function alternarAberto(aberto: boolean) {
    onChange({ ...dia, aberto });
  }

  function adicionarIntervalo() {
    const novo: Intervalo = { id: crypto.randomUUID(), inicio: null, fim: null };
    onChange({ ...dia, intervalos: [...dia.intervalos, novo] });
  }

  function atualizarIntervalo(id: string, campo: "inicio" | "fim", valor: string) {
    onChange({
      ...dia,
      intervalos: dia.intervalos.map((intervalo) =>
        intervalo.id === id ? { ...intervalo, [campo]: valor } : intervalo
      ),
    });
  }

  function removerIntervalo(id: string) {
    onChange({
      ...dia,
      intervalos: dia.intervalos.filter((intervalo) => intervalo.id !== id),
    });
  }

  return (
    <li
      className={cn(
        "rounded-xl px-3 py-2.5 transition",
        dia.aberto
          ? "border border-primary/30 bg-primary/5 px-4 py-4"
          : "border border-transparent"
      )}
    >
      <div className="flex items-center gap-3">
        <Switch
          checked={dia.aberto}
          onCheckedChange={alternarAberto}
          aria-label={`${nome} — ${dia.aberto ? "aberto" : "fechado"}`}
        />
        <span
          className={cn(
            "min-w-0 flex-1 text-[15px]",
            dia.aberto ? "font-bold text-primary" : "text-muted-foreground"
          )}
        >
          {nome}
        </span>

        {dia.aberto ? (
          <Button
            type="button"
            variant="outline"
            onClick={adicionarIntervalo}
            className="h-8 shrink-0 gap-1 rounded-lg px-2.5 text-xs font-semibold text-primary"
          >
            <Plus className="size-3.5" />
            Intervalo
          </Button>
        ) : (
          <span className="shrink-0 text-[13px] text-muted-foreground">Fechado</span>
        )}
      </div>

      {dia.aberto && (
        <div className="mt-3 flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <span className="flex w-11 shrink-0 flex-col items-center gap-0.5 text-[10px] text-muted-foreground">
              <Clock className="size-4" />
              Turno
            </span>
            <TimeSelect
              value={dia.inicio}
              onChange={(valor) => onChange({ ...dia, inicio: valor })}
              placeholder="Início"
              ariaLabel={`Início do turno de ${nome}`}
            />
            <span className="shrink-0 text-[13px] text-muted-foreground">até</span>
            <TimeSelect
              value={dia.fim}
              onChange={(valor) => onChange({ ...dia, fim: valor })}
              placeholder="Fim"
              ariaLabel={`Fim do turno de ${nome}`}
            />
            {/* Espaçador para alinhar com a lixeira das linhas de intervalo */}
            <span className="size-8 shrink-0" aria-hidden="true" />
          </div>

          {dia.intervalos.map((intervalo) => (
            <div key={intervalo.id} className="flex items-center gap-2">
              <span className="flex w-11 shrink-0 flex-col items-center gap-0.5 text-[10px] text-muted-foreground">
                <Coffee className="size-4" />
                Intervalo
              </span>
              <TimeSelect
                value={intervalo.inicio}
                onChange={(valor) => atualizarIntervalo(intervalo.id, "inicio", valor)}
                placeholder="Início"
                ariaLabel={`Início do intervalo de ${nome}`}
              />
              <span className="shrink-0 text-[13px] text-muted-foreground">até</span>
              <TimeSelect
                value={intervalo.fim}
                onChange={(valor) => atualizarIntervalo(intervalo.id, "fim", valor)}
                placeholder="Fim"
                ariaLabel={`Fim do intervalo de ${nome}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removerIntervalo(intervalo.id)}
                aria-label={`Remover intervalo de ${nome}`}
                className="shrink-0 text-destructive hover:text-destructive/70"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </li>
  );
}
