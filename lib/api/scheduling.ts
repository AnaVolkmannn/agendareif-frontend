import { api } from "@/lib/api/client";

export interface AvailableSlot {
  /** "09:00" — para exibir no grid de horários */
  time: string;
  /** "2026-10-27T09:00:00" — valor exato devolvido pelo backend, para enviar adiante */
  isoDateTime: string;
}

/** Quantos meses à frente de hoje o cliente pode agendar. */
const MAX_MONTHS_AHEAD = 3;

function toDateParam(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

/**
 * GET /schedulings/available-slots — rota pública (não exige login).
 * O backend já calcula os horários livres considerando a duração do
 * serviço e os agendamentos existentes daquele profissional no dia.
 * Aqui, filtramos também os horários que já passaram (relevante quando
 * o dia selecionado é hoje).
 */
export async function getAvailableSlots(
  professionalId: number,
  serviceId: number,
  date: Date
): Promise<AvailableSlot[]> {
  const params = new URLSearchParams({
    professionalId: String(professionalId),
    serviceId: String(serviceId),
    date: toDateParam(date),
  });

  const data = await api<string[]>(`/schedulings/available-slots?${params.toString()}`, {
    auth: false,
  });

  const now = new Date();

  return data
    .map((iso) => ({ isoDateTime: iso, time: iso.slice(11, 16) }))
    .filter((slot) => new Date(slot.isoDateTime) > now)
    .sort((a, b) => a.time.localeCompare(b.time));
}

/**
 * GET /schedulings/available-days — rota pública. Devolve os dias do mês
 * em que sobra pelo menos um horário livre, numa única chamada.
 *
 * É o que permite marcar os dias com vaga e desabilitar o resto antes de
 * o cliente clicar. Checar dia a dia pelo getAvailableSlots custaria ~30
 * requisições a cada troca de mês.
 */
export async function getDiasComHorario(
  professionalId: number,
  serviceId: number,
  year: number,
  /** 0-11, como no Date do JavaScript. */
  month: number,
): Promise<number[]> {
  const params = new URLSearchParams({
    professionalId: String(professionalId),
    serviceId: String(serviceId),
    year: String(year),
    // O backend espera 1-12.
    month: String(month + 1),
  });

  return api<number[]>(`/schedulings/available-days?${params.toString()}`, {
    auth: false,
  });
}

/**
 * Dias selecionáveis: de hoje até 3 meses à frente. Aplica só a janela de
 * tempo permitida; quais desses dias têm vaga vem do getDiasComHorario.
 */
export function getSelectableDays(year: number, month: number): number[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxDate = new Date(today);
  maxDate.setMonth(maxDate.getMonth() + MAX_MONTHS_AHEAD);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => i + 1).filter((day) => {
    const date = new Date(year, month, day);
    return date >= today && date <= maxDate;
  });
}