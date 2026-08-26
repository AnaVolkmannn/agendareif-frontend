"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarRange, Search } from "lucide-react";

import { AdminShell } from "@/components/sections/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  formatDataCurta,
  formatDiaMesAbreviado,
  formatDiaSemanaCompleto,
  getDiaSemanaCurto,
  toIsoDate,
} from "@/lib/format";
import { getAgendamentosDashboard, HOJE_REF } from "@/app/mocks/dashboard-mock";
import type { AgendamentoDashboard, StatusAgendamento } from "@/types/dashboard";

type Status = "loading" | "success" | "error";
type Aba = "hoje" | "semana" | "mes" | "periodo";

const DIAS_SEMANA_FILTRO = [
  { valor: "todos", label: "Todos" },
  { valor: "Seg", label: "Seg" },
  { valor: "Ter", label: "Ter" },
  { valor: "Qua", label: "Qua" },
  { valor: "Qui", label: "Qui" },
  { valor: "Sex", label: "Sex" },
  { valor: "Sáb", label: "Sáb" },
] as const;

const HOJE_ISO = toIsoDate(HOJE_REF);
const MES_ATUAL_PREFIXO = HOJE_ISO.slice(0, 7);

const CAMPO_ROSADO =
  "rounded-full border-secondary/25 bg-rose-50 text-neutral-900 placeholder:text-neutral-500 dark:border-input dark:bg-input/30 dark:text-foreground dark:placeholder:text-muted-foreground";

function getInicioSemana(referencia: Date): Date {
  const dia = referencia.getDay();
  const diffParaSegunda = dia === 0 ? -6 : 1 - dia;
  const inicio = new Date(referencia);
  inicio.setDate(referencia.getDate() + diffParaSegunda);
  return inicio;
}

function getPrimeiroDiaMes(referencia: Date): Date {
  return new Date(referencia.getFullYear(), referencia.getMonth(), 1);
}

function getUltimoDiaMes(referencia: Date): Date {
  return new Date(referencia.getFullYear(), referencia.getMonth() + 1, 0);
}

function subDias(data: Date, dias: number): Date {
  const nova = new Date(data);
  nova.setDate(data.getDate() - dias);
  return nova;
}

const INICIO_SEMANA_ISO = toIsoDate(getInicioSemana(HOJE_REF));
const FIM_SEMANA_ISO = toIsoDate(subDias(getInicioSemana(HOJE_REF), -5));
const PERIODO_PADRAO_INICIO = toIsoDate(getPrimeiroDiaMes(HOJE_REF));
const PERIODO_PADRAO_FIM = toIsoDate(getUltimoDiaMes(HOJE_REF));

export default function DashboardPage() {
  const [agendamentos, setAgendamentos] = useState<AgendamentoDashboard[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [aba, setAba] = useState<Aba>("hoje");

  const [diaSemanaFiltro, setDiaSemanaFiltro] = useState<string>("todos");
  const [buscaTexto, setBuscaTexto] = useState("");
  const [periodoInicio, setPeriodoInicio] = useState(PERIODO_PADRAO_INICIO);
  const [periodoFim, setPeriodoFim] = useState(PERIODO_PADRAO_FIM);

  useEffect(() => {
    let ativo = true;
    setStatus("loading");
    getAgendamentosDashboard()
      .then((dados) => {
        if (!ativo) return;
        setAgendamentos(dados);
        setStatus("success");
      })
      .catch(() => {
        if (!ativo) return;
        setStatus("error");
      });
    return () => {
      ativo = false;
    };
  }, []);

  const filtrados = useMemo(() => {
    const ordenados = [...agendamentos].sort((a, b) =>
      `${a.dataIso}${a.hora}`.localeCompare(`${b.dataIso}${b.hora}`)
    );

    switch (aba) {
      case "hoje":
        return ordenados.filter((a) => a.dataIso === HOJE_ISO);

      case "semana": {
        const naSemana = ordenados.filter(
          (a) => a.dataIso >= INICIO_SEMANA_ISO && a.dataIso <= FIM_SEMANA_ISO
        );
        if (diaSemanaFiltro === "todos") return naSemana;
        return naSemana.filter((a) => getDiaSemanaCurto(a.dataIso) === diaSemanaFiltro);
      }

      case "mes": {
        const noMes = ordenados.filter((a) => a.dataIso.startsWith(MES_ATUAL_PREFIXO));
        const termo = buscaTexto.trim().toLowerCase();
        if (!termo) return noMes;
        return noMes.filter(
          (a) =>
            a.clienteNome.toLowerCase().includes(termo) ||
            a.servico.toLowerCase().includes(termo)
        );
      }

      case "periodo":
        return ordenados.filter((a) => a.dataIso >= periodoInicio && a.dataIso <= periodoFim);

      default:
        return ordenados;
    }
  }, [agendamentos, aba, diaSemanaFiltro, buscaTexto, periodoInicio, periodoFim]);

  const stats = useMemo(
    () => ({
      agendados: filtrados.filter((a) => a.status === "agendado").length,
      cancelados: filtrados.filter((a) => a.status === "cancelado").length,
      finalizados: filtrados.filter((a) => a.status === "finalizado").length,
    }),
    [filtrados]
  );

  const presetAtivo: "7" | "15" | "mes" | null = (() => {
    if (periodoFim === HOJE_ISO && periodoInicio === toIsoDate(subDias(HOJE_REF, 6))) return "7";
    if (periodoFim === HOJE_ISO && periodoInicio === toIsoDate(subDias(HOJE_REF, 14))) return "15";
    if (periodoInicio === PERIODO_PADRAO_INICIO && periodoFim === PERIODO_PADRAO_FIM) return "mes";
    return null;
  })();

  function limparFiltro() {
    setDiaSemanaFiltro("todos");
    setBuscaTexto("");
    setPeriodoInicio(PERIODO_PADRAO_INICIO);
    setPeriodoFim(PERIODO_PADRAO_FIM);
  }

  function aplicarPreset(dias: number | "mes") {
    if (dias === "mes") {
      setPeriodoInicio(PERIODO_PADRAO_INICIO);
      setPeriodoFim(PERIODO_PADRAO_FIM);
      return;
    }
    setPeriodoInicio(toIsoDate(subDias(HOJE_REF, dias - 1)));
    setPeriodoFim(HOJE_ISO);
  }

  return (
    <AdminShell title="Dashboard">
      <Tabs value={aba} onValueChange={(valor) => setAba(valor as Aba)}>
        <TabsList>
          <TabsTab value="hoje">Hoje</TabsTab>
          <TabsTab value="semana">Semana</TabsTab>
          <TabsTab value="mes">Mês atual</TabsTab>
          <TabsTab value="periodo">Período</TabsTab>
        </TabsList>

        {aba === "periodo" && (
          <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <label
                  htmlFor="periodo-inicio"
                  className="mb-1 block text-xs font-semibold text-muted-foreground"
                >
                  De
                </label>
                <Input
                  id="periodo-inicio"
                  type="date"
                  value={periodoInicio}
                  max={periodoFim}
                  onChange={(e) => setPeriodoInicio(e.target.value)}
                  className={cn("h-10 text-sm", CAMPO_ROSADO)}
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor="periodo-fim"
                  className="mb-1 block text-xs font-semibold text-muted-foreground"
                >
                  Até
                </label>
                <Input
                  id="periodo-fim"
                  type="date"
                  value={periodoFim}
                  min={periodoInicio}
                  onChange={(e) => setPeriodoFim(e.target.value)}
                  className={cn("h-10 text-sm", CAMPO_ROSADO)}
                />
              </div>
            </div>
            <div className="flex flex-nowrap gap-2 overflow-x-auto">
              <Button
                type="button"
                size="sm"
                variant={presetAtivo === "7" ? "default" : "outline"}
                onClick={() => aplicarPreset(7)}
                className="shrink-0 whitespace-nowrap rounded-full"
              >
                Últimos 7 dias
              </Button>
              <Button
                type="button"
                size="sm"
                variant={presetAtivo === "15" ? "default" : "outline"}
                onClick={() => aplicarPreset(15)}
                className="shrink-0 whitespace-nowrap rounded-full"
              >
                Últimos 15 dias
              </Button>
              <Button
                type="button"
                size="sm"
                variant={presetAtivo === "mes" ? "default" : "outline"}
                onClick={() => aplicarPreset("mes")}
                className="shrink-0 whitespace-nowrap rounded-full"
              >
                <CalendarRange className="size-3.5" />
                Mês inteiro
              </Button>
            </div>
          </div>
        )}

        <div className="mt-1 flex gap-3">
          <StatCard label="Agendamentos" value={stats.agendados} tone="warning" />
          <StatCard label="Cancelamentos" value={stats.cancelados} tone="destructive" />
          <StatCard label="Finalizados" value={stats.finalizados} tone="success" />
        </div>

        <TabsPanel value="hoje" className="mt-5">
          <h2 className="font-glacial text-lg font-bold">Agenda Geral - Hoje</h2>
          <p className="mb-4 text-[13px] text-muted-foreground">
            {formatDiaSemanaCompleto(HOJE_ISO)}
          </p>
          <ListaAgendamentos aba="hoje" itens={filtrados} status={status} />
        </TabsPanel>

        <TabsPanel value="semana" className="mt-5">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {DIAS_SEMANA_FILTRO.map((dia) => (
              <button
                key={dia.valor}
                type="button"
                onClick={() => setDiaSemanaFiltro(dia.valor)}
                className={cn(
                  "h-8 shrink-0 rounded-full border px-3 text-[13px] font-semibold transition",
                  diaSemanaFiltro === dia.valor
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-transparent text-foreground/70 hover:bg-muted"
                )}
              >
                {dia.label}
              </button>
            ))}
          </div>
          <ContadorResultados total={filtrados.length} onLimpar={limparFiltro} />
          <ListaAgendamentos aba="semana" itens={filtrados} status={status} />
        </TabsPanel>

        <TabsPanel value="mes" className="mt-5">
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />
            <Input
              id="busca-mes"
              value={buscaTexto}
              onChange={(e) => setBuscaTexto(e.target.value)}
              placeholder="Buscar por cliente ou serviço"
              className={cn("h-10 pl-9", CAMPO_ROSADO)}
            />
          </div>
          <ContadorResultados total={filtrados.length} onLimpar={limparFiltro} />
          <ListaAgendamentos aba="mes" itens={filtrados} status={status} />
        </TabsPanel>

        <TabsPanel value="periodo" className="mt-5">
          <ContadorResultados
            total={filtrados.length}
            onLimpar={limparFiltro}
            sufixo={`${formatDataCurta(periodoInicio)} a ${formatDataCurta(periodoFim)}`}
          />
          <ListaAgendamentos aba="periodo" itens={filtrados} status={status} />
        </TabsPanel>
      </Tabs>
    </AdminShell>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "warning" | "destructive" | "success";
}) {
  const toneClasses =
    tone === "warning"
      ? "text-amber-500 dark:text-amber-400"
      : tone === "destructive"
        ? "text-destructive"
        : "text-emerald-600 dark:text-emerald-400";

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl border border-border/60 bg-card px-3 py-4 text-center shadow-sm">
      <span className={cn("font-glacial text-3xl font-extrabold", toneClasses)}>{value}</span>
      <span className="text-[12px] font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

interface StatusConfig {
  label: string;
  variant: "warning" | "success" | "destructive";
}

const STATUS_CONFIG: Record<StatusAgendamento, StatusConfig> = {
  agendado: { label: "Agendado", variant: "warning" },
  finalizado: { label: "Finalizado", variant: "success" },
  cancelado: { label: "Cancelado", variant: "destructive" },
};

function StatusBadge({ status }: { status: StatusAgendamento }) {
  const config = STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function ContadorResultados({
  total,
  onLimpar,
  sufixo,
}: {
  total: number;
  onLimpar: () => void;
  sufixo?: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between text-[13px]">
      <span className="text-muted-foreground">
        {total} {total === 1 ? "resultado" : "resultados"}
        {sufixo ? ` · ${sufixo}` : ""}
      </span>
      <button
        type="button"
        onClick={onLimpar}
        className="font-semibold text-destructive hover:underline"
      >
        Limpar filtro
      </button>
    </div>
  );
}

function ListaAgendamentos({
  aba,
  itens,
  status,
}: {
  aba: Aba;
  itens: AgendamentoDashboard[];
  status: Status;
}) {
  if (status === "loading") {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Carregando agenda…
      </p>
    );
  }

  if (status === "error") {
    return (
      <p className="text-sm text-destructive" role="alert">
        Não foi possível carregar os agendamentos agora. Tente novamente em instantes.
      </p>
    );
  }

  if (itens.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum agendamento encontrado.</p>;
  }

  const usaDiaMes = aba === "mes" || aba === "periodo";

  return (
    <ul className="flex flex-col gap-2">
      {itens.map((item) => {
        const { dia, mes } = formatDiaMesAbreviado(item.dataIso);
        const dateTopLabel = usaDiaMes ? dia : getDiaSemanaCurto(item.dataIso).toUpperCase();
        const dateBottomLabel = usaDiaMes ? mes : undefined;

        return (
          <li
            key={item.id}
            className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-3 py-3 shadow-sm"
          >
            <div className="flex w-[68px] shrink-0 items-center justify-center gap-1 whitespace-nowrap text-center">
              <span className="text-[11px] font-bold uppercase text-muted-foreground">
                {dateTopLabel}
              </span>
              {dateBottomLabel && (
                <span className="text-[10px] font-medium uppercase text-muted-foreground/70">
                  {dateBottomLabel}
                </span>
              )}
              <span className="text-[13px] font-semibold text-foreground">{item.hora}</span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-foreground">
                {item.servico}
              </p>
              <p className="truncate text-[13px] text-muted-foreground">{item.clienteNome}</p>
            </div>

            <StatusBadge status={item.status} />
          </li>
        );
      })}
    </ul>
  );
}