"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadError } from "@/components/sections/schedule-management/load-error";
import { WeekdayRow } from "@/components/sections/schedule-management/weekday-row";
import { ExceptionsSection } from "@/components/sections/schedule-management/exceptions-section";
import { ExceptionDialog } from "@/components/sections/schedule-management/exception-dialog";
import {
  OPCOES_DESCANSO,
  excluirExcecao,
  getExcecoes,
  getHorarioPadrao,
  salvarHorarioPadrao,
} from "@/lib/api/horarios";
import type { DiaHorario, Excecao, HorarioPadrao } from "@/types/horario";

type Status = "loading" | "success" | "error";

const ITENS_DESCANSO = OPCOES_DESCANSO.map((opcao) => ({
  label: opcao.label,
  value: String(opcao.valor),
}));

export default function SchedulePage() {
  const [horario, setHorario] = useState<HorarioPadrao | null>(null);
  const [statusHorario, setStatusHorario] = useState<Status>("loading");

  const [excecoes, setExcecoes] = useState<Excecao[]>([]);
  const [statusExcecoes, setStatusExcecoes] = useState<Status>("loading");

  const [dialogAberto, setDialogAberto] = useState(false);
  const [temAlteracao, setTemAlteracao] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // Os loaders não mexem no status: o estado inicial já é "loading" e o
  // retry cuida do próprio reset (mesmo padrão da tela de select-service).
  const carregarHorario = useCallback(() => {
    getHorarioPadrao()
      .then((dados) => {
        setHorario(dados);
        setTemAlteracao(false);
        setStatusHorario("success");
      })
      .catch(() => setStatusHorario("error"));
  }, []);

  const carregarExcecoes = useCallback(() => {
    getExcecoes()
      .then((dados) => {
        setExcecoes(dados);
        setStatusExcecoes("success");
      })
      .catch(() => setStatusExcecoes("error"));
  }, []);

  useEffect(() => carregarHorario(), [carregarHorario]);
  useEffect(() => carregarExcecoes(), [carregarExcecoes]);

  function tentarHorarioDeNovo() {
    setStatusHorario("loading");
    carregarHorario();
  }


  function atualizarDia(diaAtualizado: DiaHorario) {
    setHorario((atual) =>
      atual
        ? {
            ...atual,
            dias: atual.dias.map((dia) =>
              dia.diaSemana === diaAtualizado.diaSemana ? diaAtualizado : dia
            ),
          }
        : atual
    );
    setTemAlteracao(true);
  }

  function atualizarDescanso(minutos: number) {
    setHorario((atual) => (atual ? { ...atual, descansoMinutos: minutos } : atual));
    setTemAlteracao(true);
  }

  async function handleSalvar() {
    if (!horario) return;

    setSalvando(true);
    try {
      await salvarHorarioPadrao(horario);
      setTemAlteracao(false);
    } finally {
      setSalvando(false);
    }
  }

  function handleExcecaoCriada(nova: Excecao) {
    // A API substitui a exceção anterior da mesma data — o estado segue a regra.
    setExcecoes((atual) =>
      [...atual.filter((e) => e.data !== nova.data), nova].sort((a, b) =>
        a.data.localeCompare(b.data)
      )
    );
  }

  async function handleExcluirExcecao(excecao: Excecao) {
    setExcecoes((atual) => atual.filter((e) => e.id !== excecao.id));
    await excluirExcecao(excecao.id);
  }

  return (
    <SidebarInset>
      <header className="sticky top-0 z-30 bg-primary px-4 pb-3 pt-4 text-primary-foreground md:px-8">
        <div className="relative flex items-center justify-center">
          <SidebarTrigger className="absolute left-0 size-9 shrink-0 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground md:hidden" />
          <div className="text-center">
            <p className="font-barbra text-2xl leading-tight md:text-3xl">
              Reif Beauty Studio
            </p>
            <p className="text-[13px] text-primary-foreground/80">
              Painel de horários
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-5 md:px-8 md:py-8">
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-[13px] font-bold uppercase tracking-wide">
              Horário padrão
            </h2>
            <p className="text-[13px] text-muted-foreground">
              Dias e horários que se repetem toda semana
            </p>
          </div>

          {statusHorario === "loading" && (
            <p className="text-sm text-muted-foreground" role="status">
              Carregando horários…
            </p>
          )}

          {statusHorario === "error" && (
            <LoadError
              mensagem="Não foi possível carregar os horários!"
              onRetry={tentarHorarioDeNovo}
            />
          )}

          {statusHorario === "success" && horario && (
            <>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3">
                <span className="text-[13px]">Descanso entre clientes</span>
                <Select
                  items={ITENS_DESCANSO}
                  value={String(horario.descansoMinutos)}
                  onValueChange={(valor) => {
                    if (typeof valor === "string") atualizarDescanso(Number(valor));
                  }}
                >
                  <SelectTrigger
                    aria-label="Descanso entre clientes"
                    className="h-9 shrink-0"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPCOES_DESCANSO.map((opcao) => (
                      <SelectItem key={opcao.valor} value={String(opcao.valor)}>
                        {opcao.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="mb-2 text-[13px] font-bold uppercase tracking-wide">
                  Dias da semana
                </h3>
                <ul className="flex flex-col gap-1.5">
                  {horario.dias.map((dia) => (
                    <WeekdayRow
                      key={dia.diaSemana}
                      dia={dia}
                      onChange={atualizarDia}
                    />
                  ))}
                </ul>
              </div>

              {temAlteracao && (
                <Button
                  type="button"
                  onClick={handleSalvar}
                  disabled={salvando}
                  className="h-11 w-full gap-2 rounded-xl text-[15px] font-semibold"
                >
                  {salvando ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Salvando…
                    </>
                  ) : (
                    "Salvar horários"
                  )}
                </Button>
              )}
            </>
          )}
        </section>

        <div className="mt-6">
          <ExceptionsSection
            excecoes={excecoes}
            status={statusExcecoes}
            onCadastrar={() => setDialogAberto(true)}
            onExcluir={handleExcluirExcecao}
          />
        </div>

        <ExceptionDialog
          open={dialogAberto}
          onOpenChange={setDialogAberto}
          onCriada={handleExcecaoCriada}
        />
      </main>
    </SidebarInset>
  );
}
