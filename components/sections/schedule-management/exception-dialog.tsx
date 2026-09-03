"use client";

import { useMemo, useState } from "react";
import { CalendarCheck2, Clock, Coffee, Loader2, Moon, Plus, Trash2, X } from "lucide-react";

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
import type { Excecao, Intervalo, TipoExcecao } from "@/types/horario";

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
  const [intervalos, setIntervalos] = useState<Intervalo[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  // Só é preenchido depois que a API confirma. É o que dispara a mensagem de
  // sucesso — antes disso ela não aparece, senão parece já ter sido salva.
  const [salva, setSalva] = useState<Excecao | null>(null);

  const diasSelecionaveis = useMemo(
    () => getDiasSelecionaveis(ano, mes),
    [ano, mes]
  );

  const dataIso = diaSelecionado
    ? toIsoDate(new Date(ano, mes, diaSelecionado))
    : null;

  /**
   * Qualquer edição no formulário derruba a confirmação da exceção anterior:
   * senão a mensagem de sucesso fica valendo para dados que não são mais os
   * da tela, e o botão de salvar continua escondido.
   */
  function editando() {
    setSalva(null);
  }

  function escolherDia(dia: number) {
    setDiaSelecionado(dia);
    editando();
  }

  function escolherTipo(novoTipo: TipoExcecao) {
    setTipo(novoTipo);
    editando();
  }

  function escolherInicio(valor: string) {
    setInicio(valor);
    editando();
  }

  function escolherFim(valor: string) {
    setFim(valor);
    editando();
  }

  function irParaMesAnterior() {
    setDiaSelecionado(null);
    editando();
    if (mes === 0) {
      setMes(11);
      setAno((atual) => atual - 1);
      return;
    }
    setMes((atual) => atual - 1);
  }

  function irParaProximoMes() {
    setDiaSelecionado(null);
    editando();
    if (mes === 11) {
      setMes(0);
      setAno((atual) => atual + 1);
      return;
    }
    setMes((atual) => atual + 1);
  }

  function adicionarIntervalo() {
    setIntervalos((atual) => [
      ...atual,
      { id: crypto.randomUUID(), inicio: null, fim: null },
    ]);
    editando();
  }

  function atualizarIntervalo(id: string, campo: "inicio" | "fim", valor: string) {
    setIntervalos((atual) =>
      atual.map((i) => (i.id === id ? { ...i, [campo]: valor } : i))
    );
    editando();
  }

  function removerIntervalo(id: string) {
    setIntervalos((atual) => atual.filter((i) => i.id !== id));
    editando();
  }

  function resetForm() {
    setAno(hoje.getFullYear());
    setMes(hoje.getMonth());
    setDiaSelecionado(null);
    setTipo("folga");
    setInicio("12:00");
    setFim("20:00");
    setIntervalos([]);
    setErro(null);
    setSalva(null);
  }

  /** Fecha limpando o formulário. O botão não pode chamar onOpenChange
   *  direto, senão pula o reset e o modal reabre com o estado anterior. */
  function fechar() {
    resetForm();
    onOpenChange(false);
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

      if (intervalos.some((i) => !i.inicio || !i.fim)) {
        setErro("Preencha o início e o fim de todos os intervalos.");
        return;
      }
      if (intervalos.some((i) => i.inicio! >= i.fim!)) {
        setErro("O início do intervalo deve ser anterior ao fim.");
        return;
      }
      if (intervalos.some((i) => i.inicio! < inicio || i.fim! > fim)) {
        setErro(`Os intervalos precisam ficar entre ${inicio} e ${fim}.`);
        return;
      }

      // Dois intervalos não podem se sobrepor: ordena por início e confere se
      // cada um começa depois do fim do anterior.
      const ordenados = [...intervalos].sort((a, b) =>
        a.inicio!.localeCompare(b.inicio!)
      );
      if (ordenados.some((i, idx) => idx > 0 && i.inicio! < ordenados[idx - 1].fim!)) {
        setErro("Os intervalos não podem se sobrepor.");
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
        intervalos,
      });
      onCriada(criada);
      // Não fecha na hora: o modal fica mostrando a confirmação até o
      // profissional fechar.
      setSalva(criada);
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
              onSelectDay={escolherDia}
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
                onClick={() => escolherTipo("folga")}
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
                onClick={() => escolherTipo("horario-especial")}
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
            <div className="flex flex-col gap-3 rounded-lg border border-border px-3 py-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Início</span>
                  <TimeSelect
                    value={inicio}
                    onChange={escolherInicio}
                    placeholder="Início"
                    ariaLabel="Início do horário especial"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Fim</span>
                  <TimeSelect
                    value={fim}
                    onChange={escolherFim}
                    placeholder="Fim"
                    ariaLabel="Fim do horário especial"
                  />
                </div>
              </div>

              {intervalos.map((intervalo) => (
                <div key={intervalo.id} className="flex items-center gap-2">
                  <span className="flex w-11 shrink-0 flex-col items-center gap-0.5 text-[10px] text-muted-foreground">
                    <Coffee className="size-4" />
                    Intervalo
                  </span>
                  <TimeSelect
                    value={intervalo.inicio}
                    onChange={(v) => atualizarIntervalo(intervalo.id, "inicio", v)}
                    placeholder="Início"
                    ariaLabel="Início do intervalo"
                  />
                  <span className="shrink-0 text-[13px] text-muted-foreground">até</span>
                  <TimeSelect
                    value={intervalo.fim}
                    onChange={(v) => atualizarIntervalo(intervalo.id, "fim", v)}
                    placeholder="Fim"
                    ariaLabel="Fim do intervalo"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removerIntervalo(intervalo.id)}
                    aria-label="Remover intervalo"
                    className="shrink-0 text-destructive hover:text-destructive/70"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={adicionarIntervalo}
                className="h-8 gap-1 self-start rounded-lg px-2.5 text-xs font-semibold text-primary"
              >
                <Plus className="size-3.5" />
                Intervalo
              </Button>
            </div>
          )}

          {salva && (
            <p
              role="status"
              className="flex items-center gap-2 rounded-lg bg-emerald-100 px-3 py-2 text-[13px] text-emerald-900"
            >
              <CalendarCheck2 className="size-5 shrink-0 text-emerald-700" />
              {salva.tipo === "folga"
                ? `Folga cadastrada para ${formatDataPorExtenso(salva.data)}`
                : `Horário especial cadastrado: ${salva.inicio} às ${salva.fim}, dia ${formatDataPorExtenso(salva.data)}`}
            </p>
          )}

          {erro && (
            <p className="text-[13px] font-semibold text-destructive" role="alert">
              {erro}
            </p>
          )}

          <div className="flex flex-col gap-2">
            {/* Depois de salva não faz sentido oferecer "Salvar" de novo nem
                "Cancelar" algo que já foi gravado: sobra só o fechar. */}
            {!salva && (
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
            )}
            <Button
              type="button"
              variant="outline"
              onClick={fechar}
              className="h-11 w-full rounded-lg border-foreground/70 text-[15px] font-semibold"
            >
              {salva ? "Fechar" : "Cancelar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
