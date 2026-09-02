"use client";

import { useMemo, useState } from "react";
import { CalendarCheck2, Clock, Loader2, Moon, X } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarMonth } from "@/components/sections/scheduling/calendar-month";
import { TimeSelect } from "@/components/sections/schedule-management/time-select";
import { criarExcecao } from "@/lib/api/horarios";
import { formatDataPorExtenso, toIsoDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Excecao, TipoExcecao } from "@/types/horario";

interface ExceptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCriada: (excecao: Excecao) => void;
}

/** Dias do mês que ainda podem receber exceção (de hoje em diante). */
function getDiasSelecionaveis(ano: number, mes: number): number[] {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  return Array.from({ length: diasNoMes }, (_, i) => i + 1).filter(
    (dia) => new Date(ano, mes, dia) >= hoje
  );
}

const TIPO_BUTTON_BASE =
  "h-14 gap-2 rounded-lg border-primary text-[13px] font-semibold whitespace-normal";

export function ExceptionDialog({
  open,
  onOpenChange,
  onCriada,
}: ExceptionDialogProps) {
  const hoje = useMemo(() => new Date(), []);

  const [ano, setAno] = useState(hoje.getFullYear());
  const [mes, setMes] = useState(hoje.getMonth());
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null);
  const [tipo, setTipo] = useState<TipoExcecao>("folga");
  const [inicio, setInicio] = useState<string | null>("12:00");
  const [fim, setFim] = useState<string | null>("20:00");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const diasSelecionaveis = useMemo(
    () => getDiasSelecionaveis(ano, mes),
    [ano, mes]
  );

  const dataIso = diaSelecionado
    ? toIsoDate(new Date(ano, mes, diaSelecionado))
    : null;

  const horarioInvalido =
    tipo === "horario-especial" && !!inicio && !!fim && inicio >= fim;

  function irParaMesAnterior() {
    setDiaSelecionado(null);
    if (mes === 0) {
      setMes(11);
      setAno((atual) => atual - 1);
      return;
    }
    setMes((atual) => atual - 1);
  }

  function irParaProximoMes() {
    setDiaSelecionado(null);
    if (mes === 11) {
      setMes(0);
      setAno((atual) => atual + 1);
      return;
    }
    setMes((atual) => atual + 1);
  }

  function resetForm() {
    setAno(hoje.getFullYear());
    setMes(hoje.getMonth());
    setDiaSelecionado(null);
    setTipo("folga");
    setInicio("12:00");
    setFim("20:00");
    setErro(null);
  }

  async function handleSalvar() {
    if (!dataIso) {
      setErro("Selecione o dia da exceção.");
      return;
    }
    if (tipo === "horario-especial") {
      if (!inicio || !fim) {
        setErro("Informe o início e o fim do horário especial.");
        return;
      }
      if (inicio >= fim) {
        setErro("O horário de início deve ser anterior ao de fim.");
        return;
      }
    }

    setErro(null);
    setSalvando(true);
    try {
      const criada = await criarExcecao({
        data: dataIso,
        tipo,
        inicio: inicio ?? undefined,
        fim: fim ?? undefined,
      });
      onCriada(criada);
      resetForm();
      onOpenChange(false);
    } catch {
      setErro("Não foi possível salvar a exceção. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(novoEstado) => {
        if (!novoEstado) resetForm();
        onOpenChange(novoEstado);
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-h-[90vh] overflow-y-auto rounded-2xl p-0"
      >
        <DialogHeader className="relative mb-0 rounded-t-2xl bg-primary px-5 py-4 pr-14 text-primary-foreground">
          <DialogTitle className="text-left text-xl text-primary-foreground">
            Nova exceção
          </DialogTitle>
          <DialogDescription className="text-left text-[13px] text-primary-foreground/90">
            Folga ou horário especial
          </DialogDescription>
          <DialogClose
            aria-label="Fechar"
            className="absolute right-4 top-4 flex size-6 cursor-pointer items-center justify-center rounded-full bg-foreground/70 text-background outline-none transition hover:bg-foreground focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="size-3.5" />
          </DialogClose>
        </DialogHeader>

        <div className="flex flex-col gap-4 px-5 pb-5 pt-4">
          <section className="flex flex-col gap-1">
            <h3 className="text-xs uppercase tracking-wide text-muted-foreground">
              1. Selecione o dia
            </h3>
            <CalendarMonth
              year={ano}
              month={mes}
              availableDays={diasSelecionaveis}
              selectedDay={diaSelecionado}
              onSelectDay={setDiaSelecionado}
              onPrevMonth={irParaMesAnterior}
              onNextMonth={irParaProximoMes}
              className="bg-transparent px-0 py-2"
            />
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-xs uppercase tracking-wide text-muted-foreground">
              2. Tipo
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {/* A variante muda junto com a seleção: forçar só a cor por
                  className não funciona, porque o `dark:bg-input/30` da
                  variante outline sobrevive ao merge e vence no dark mode. */}
              <Button
                type="button"
                variant={tipo === "folga" ? "default" : "outline"}
                aria-pressed={tipo === "folga"}
                onClick={() => setTipo("folga")}
                className={cn(
                  TIPO_BUTTON_BASE,
                  tipo !== "folga" && "text-primary"
                )}
              >
                <Moon className="size-4" />
                Folga
              </Button>
              <Button
                type="button"
                variant={tipo === "horario-especial" ? "default" : "outline"}
                aria-pressed={tipo === "horario-especial"}
                onClick={() => setTipo("horario-especial")}
                className={cn(
                  TIPO_BUTTON_BASE,
                  tipo !== "horario-especial" && "text-primary"
                )}
              >
                <Clock className="size-4" />
                Horário especial
              </Button>
            </div>
          </section>

          {tipo === "horario-especial" && (
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-border px-3 py-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Início</span>
                <TimeSelect
                  value={inicio}
                  onChange={setInicio}
                  placeholder="Início"
                  ariaLabel="Início do horário especial"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Fim</span>
                <TimeSelect
                  value={fim}
                  onChange={setFim}
                  placeholder="Fim"
                  ariaLabel="Fim do horário especial"
                />
              </div>
            </div>
          )}

          {dataIso && !horarioInvalido && (
            <p className="flex items-center gap-2 rounded-lg bg-emerald-100 px-3 py-2 text-[13px] text-emerald-900">
              <CalendarCheck2 className="size-5 shrink-0 text-emerald-700" />
              {tipo === "folga"
                ? `Folga cadastrada para ${formatDataPorExtenso(dataIso)}`
                : `Horário especial cadastrado: ${inicio} às ${fim}, dia ${formatDataPorExtenso(dataIso)}`}
            </p>
          )}

          {erro && (
            <p className="text-[13px] font-semibold text-destructive" role="alert">
              {erro}
            </p>
          )}

          <div className="flex flex-col gap-2">
            <Button
              type="button"
              onClick={handleSalvar}
              disabled={salvando}
              className="h-11 w-full gap-2 rounded-lg text-[15px] font-semibold"
            >
              {salvando ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Salvando…
                </>
              ) : (
                "Salvar exceção"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-11 w-full rounded-lg border-foreground/70 text-[15px] font-semibold"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
