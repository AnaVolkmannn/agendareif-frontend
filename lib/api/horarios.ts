import { api } from "@/lib/api/client";
import { getProfessionalId } from "@/lib/auth/session";
import type {
  DiaHorario,
  Excecao,
  HorarioPadrao,
  NovaExcecaoInput,
} from "@/types/horario";

/* -------------------------------------------------------------------------- */
/*  Constantes usadas pela tela                                               */
/* -------------------------------------------------------------------------- */

/** Opções de horário do dia, de 30 em 30 minutos ("00:00" … "23:30"). */
export const OPCOES_HORARIO: string[] = Array.from({ length: 48 }, (_, i) => {
  const hora = String(Math.floor(i / 2)).padStart(2, "0");
  const minuto = i % 2 === 0 ? "00" : "30";
  return `${hora}:${minuto}`;
});

/** Opções do campo "Descanso entre clientes", em minutos. */
export const OPCOES_DESCANSO = [
  { valor: 0, label: "Sem descanso" },
  { valor: 5, label: "5 minutos" },
  { valor: 10, label: "10 minutos" },
  { valor: 15, label: "15 minutos" },
  { valor: 20, label: "20 minutos" },
  { valor: 30, label: "30 minutos" },
];

const NOMES_DIAS = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export function getNomeDia(diaSemana: number): string {
  return NOMES_DIAS[diaSemana];
}

/* -------------------------------------------------------------------------- */
/*  Formato que a API usa (DTOs do backend)                                   */
/* -------------------------------------------------------------------------- */

interface WeeklyScheduleDTO {
  id: number;
  professionalId: number;
  dayOfWeek: number; // 0 = domingo … 6 = sábado
  active: boolean;
  startTime: string | null; // "HH:mm"
  endTime: string | null; // "HH:mm"
}

interface PauseWeeklyDTO {
  id: number;
  weeklyScheduleId: number;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
}

interface BreakBetweenDTO {
  id: number;
  professionalId: number;
  breakDuration: number | null;
}

interface PauseExceptionDTO {
  id: number;
  scheduleExceptionId: number;
  startTime: string; // "2026-10-30T12:00:00"
  endTime: string;
}

interface ScheduleExceptionDTO {
  id: number;
  professionalId: number;
  type: "DAY_OFF" | "SPECIAL";
  startTime: string; // "2026-10-30T09:00:00"
  endTime: string;
  pauses: PauseExceptionDTO[];
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

/** "HH:mm" ou "HH:mm:ss" -> "HH:mm". */
function hhmm(valor: string): string {
  return valor.slice(0, 5);
}

/** "2026-10-30T09:00:00" -> "2026-10-30". */
function soData(dataHora: string): string {
  return dataHora.slice(0, 10);
}

/** "2026-10-30T09:00:00" -> "09:00". */
function soHora(dataHora: string): string {
  return dataHora.slice(11, 16);
}

/* -------------------------------------------------------------------------- */
/*  Horário padrão (semana + descanso + intervalos)                           */
/* -------------------------------------------------------------------------- */

async function getDescanso(professionalId: number): Promise<number> {
  try {
    const dto = await api<BreakBetweenDTO>(
      `/api/break-between/professional/${professionalId}`
    );
    return dto.breakDuration ?? 0;
  } catch {
    // Profissional que nunca configurou descanso ainda não tem registro.
    // O back responde com erro (que o Spring Security pode transformar em
    // 403), então qualquer falha aqui vira "Sem descanso". Se o problema for
    // a sessão, as outras chamadas da tela falham e o erro aparece lá.
    return 0;
  }
}

async function salvarDescanso(professionalId: number, minutos: number) {
  const body = { professionalId, breakDuration: minutos };
  try {
    await api<BreakBetweenDTO>(`/api/break-between/professional/${professionalId}`, {
      method: "PUT",
      body,
    });
  } catch {
    // Ainda não existia registro: cria.
    await api<BreakBetweenDTO>("/api/break-between", { method: "POST", body });
  }
}

export async function getHorarioPadrao(): Promise<HorarioPadrao> {
  const professionalId = getProfessionalId();

  const [semana, descansoMinutos] = await Promise.all([
    api<WeeklyScheduleDTO[]>(`/professionals/${professionalId}/weekly-schedules`),
    getDescanso(professionalId),
  ]);

  // Os intervalos (almoço etc.) ficam em outro endpoint, um por dia aberto.
  const pausasPorDia = new Map<number, PauseWeeklyDTO[]>();
  await Promise.all(
    semana
      .filter((dia) => dia.active)
      .map(async (dia) => {
        const pausas = await api<PauseWeeklyDTO[]>(
          `/weekly-schedules/${dia.id}/pauses`
        );
        pausasPorDia.set(dia.dayOfWeek, pausas);
      })
  );

  // A tela sempre trabalha com os 7 dias. Dia que a API não devolveu
  // (profissional novo) aparece fechado, com um turno padrão sugerido.
  const dias: DiaHorario[] = NOMES_DIAS.map((_, diaSemana) => {
    const dto = semana.find((d) => d.dayOfWeek === diaSemana);
    return {
      diaSemana,
      aberto: dto?.active ?? false,
      inicio: dto?.startTime ? hhmm(dto.startTime) : "09:00",
      fim: dto?.endTime ? hhmm(dto.endTime) : "19:00",
      intervalos: (pausasPorDia.get(diaSemana) ?? []).map((p) => ({
        id: String(p.id),
        inicio: hhmm(p.startTime),
        fim: hhmm(p.endTime),
      })),
    };
  });

  return { descansoMinutos, dias };
}

/**
 * Confere o que dá pra conferir antes de chamar a API. Devolve a mensagem de
 * erro, ou null se está tudo certo.
 */
export function validarHorario(horario: HorarioPadrao): string | null {
  for (const dia of horario.dias) {
    if (!dia.aberto) continue;
    const nome = getNomeDia(dia.diaSemana);

    if (dia.inicio >= dia.fim) {
      return `${nome}: o início do turno deve ser anterior ao fim.`;
    }

    if (dia.intervalos.some((i) => !i.inicio || !i.fim)) {
      return `${nome}: preencha o início e o fim de todos os intervalos.`;
    }
    if (dia.intervalos.some((i) => i.inicio! >= i.fim!)) {
      return `${nome}: o início do intervalo deve ser anterior ao fim.`;
    }
    if (dia.intervalos.some((i) => i.inicio! < dia.inicio || i.fim! > dia.fim)) {
      return `${nome}: os intervalos precisam ficar entre ${dia.inicio} e ${dia.fim}.`;
    }

    const ordenados = [...dia.intervalos].sort((a, b) =>
      a.inicio!.localeCompare(b.inicio!)
    );
    if (ordenados.some((i, idx) => idx > 0 && i.inicio! < ordenados[idx - 1].fim!)) {
      return `${nome}: os intervalos não podem se sobrepor.`;
    }
  }
  return null;
}

/**
 * Salva a semana inteira. A API não aceita intervalos dentro do PUT da semana,
 * então o salvamento acontece em etapas:
 *   1. apaga os intervalos que saíram ou mudaram (a API recusa mudar o turno
 *      se um intervalo antigo não couber mais);
 *   2. grava os 7 dias de uma vez (PUT em lote);
 *   3. cria os intervalos novos;
 *   4. grava o descanso entre clientes.
 * No fim recarrega tudo, para a tela ficar com os ids reais da API.
 */
export async function salvarHorarioPadrao(
  horario: HorarioPadrao
): Promise<HorarioPadrao> {
  const professionalId = getProfessionalId();
  const base = `/professionals/${professionalId}/weekly-schedules`;

  // 1) Intervalos que já existem na API mas não estão mais iguais na tela.
  const mantidos = new Set<string>(); // ids de intervalos que continuam valendo
  const atuais = await api<WeeklyScheduleDTO[]>(base);

  await Promise.all(
    atuais.map(async (diaApi) => {
      const dia = horario.dias.find((d) => d.diaSemana === diaApi.dayOfWeek);
      // Dia fechado não pode ter intervalo: tudo que existe sai.
      const desejados = dia?.aberto ? dia.intervalos : [];

      const pausas = await api<PauseWeeklyDTO[]>(
        `/weekly-schedules/${diaApi.id}/pauses`
      );

      const obsoletas = pausas.filter(
        (p) =>
          !desejados.some(
            (i) =>
              i.id === String(p.id) &&
              i.inicio === hhmm(p.startTime) &&
              i.fim === hhmm(p.endTime)
          )
      );
      pausas
        .filter((p) => !obsoletas.includes(p))
        .forEach((p) => mantidos.add(String(p.id)));

      await Promise.all(
        obsoletas.map((p) =>
          api<void>(`/weekly-schedules/${diaApi.id}/pauses/${p.id}`, {
            method: "DELETE",
          })
        )
      );
    })
  );

  // 2) Os 7 dias de uma vez.
  const salvos = await api<WeeklyScheduleDTO[]>(base, {
    method: "PUT",
    body: {
      days: horario.dias.map((dia) => ({
        dayOfWeek: dia.diaSemana,
        active: dia.aberto,
        startTime: dia.inicio,
        endTime: dia.fim,
      })),
    },
  });

  // 3) Intervalos novos (ou alterados, que foram apagados no passo 1).
  await Promise.all(
    salvos.map(async (salvo) => {
      const dia = horario.dias.find((d) => d.diaSemana === salvo.dayOfWeek);
      if (!dia?.aberto) return;

      // Um de cada vez: a API confere sobreposição contra o que já está salvo.
      for (const intervalo of dia.intervalos) {
        if (mantidos.has(intervalo.id)) continue;
        await api<PauseWeeklyDTO>(`/weekly-schedules/${salvo.id}/pauses`, {
          method: "POST",
          body: { startTime: intervalo.inicio, endTime: intervalo.fim },
        });
      }
    })
  );

  // 4) Descanso entre clientes.
  await salvarDescanso(professionalId, horario.descansoMinutos);

  return getHorarioPadrao();
}

/* -------------------------------------------------------------------------- */
/*  Exceções (folga / horário especial)                                       */
/* -------------------------------------------------------------------------- */

function toExcecao(dto: ScheduleExceptionDTO): Excecao {
  const especial = dto.type === "SPECIAL";

  return {
    id: String(dto.id),
    data: soData(dto.startTime),
    tipo: especial ? "horario-especial" : "folga",
    ...(especial
      ? {
          inicio: soHora(dto.startTime),
          fim: soHora(dto.endTime),
          intervalos: dto.pauses.map((p) => ({
            id: String(p.id),
            inicio: soHora(p.startTime),
            fim: soHora(p.endTime),
          })),
        }
      : {}),
  };
}

export async function getExcecoes(): Promise<Excecao[]> {
  const professionalId = getProfessionalId();
  const dados = await api<ScheduleExceptionDTO[]>(
    `/professionals/${professionalId}/schedule-exceptions`
  );
  return dados.map(toExcecao).sort((a, b) => a.data.localeCompare(b.data));
}

export async function criarExcecao(dados: NovaExcecaoInput): Promise<Excecao> {
  const professionalId = getProfessionalId();
  const base = `/professionals/${professionalId}/schedule-exceptions`;
  const especial = dados.tipo === "horario-especial";

  if (especial && (!dados.inicio || !dados.fim)) {
    throw new Error("Informe o início e o fim do horário especial.");
  }

  // A tela trabalha com "uma exceção por data" (a nova substitui a anterior),
  // mas a API recusa datas que se sobrepõem. Então apago a antiga primeiro.
  const existentes = await api<ScheduleExceptionDTO[]>(base);
  await Promise.all(
    existentes
      .filter((e) => soData(e.startTime) === dados.data)
      .map((e) => api<void>(`${base}/${e.id}`, { method: "DELETE" }))
  );

  const criada = await api<ScheduleExceptionDTO>(base, {
    method: "POST",
    body: {
      type: especial ? "SPECIAL" : "DAY_OFF",
      startTime: `${dados.data}T${especial ? dados.inicio : "00:00"}:00`,
      // Folga ocupa o dia todo: a API calcula o fim sozinha.
      endTime: especial ? `${dados.data}T${dados.fim}:00` : null,
    },
  });

  if (!especial) return toExcecao(criada);

  // Intervalos do horário especial: um POST para cada.
  const pausas: PauseExceptionDTO[] = [];
  try {
    for (const intervalo of dados.intervalos ?? []) {
      const pausa = await api<PauseExceptionDTO>(
        `/schedule-exceptions/${criada.id}/pauses`,
        {
          method: "POST",
          body: {
            startTime: `${dados.data}T${intervalo.inicio}:00`,
            endTime: `${dados.data}T${intervalo.fim}:00`,
          },
        }
      );
      pausas.push(pausa);
    }
  } catch (erro) {
    // Não deixa uma exceção "pela metade" (sem os intervalos) salva na API.
    await api<void>(`${base}/${criada.id}`, { method: "DELETE" }).catch(() => {});
    throw erro;
  }

  return toExcecao({ ...criada, pauses: pausas });
}

export async function excluirExcecao(id: string): Promise<void> {
  const professionalId = getProfessionalId();
  await api<void>(`/professionals/${professionalId}/schedule-exceptions/${id}`, {
    method: "DELETE",
  });
}