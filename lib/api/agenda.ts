import { api } from "@/lib/api/client";

export interface Appointment {
  id: string;
  time: string;
  service: string | null;
  client: string | null;
  status: "ocupado" | "disponivel";
}

interface SchedulingResponse {
  id: number;
  clientId: number;
  clientName: string;
  professionalId: number;
  professionalName: string;
  serviceId: number;
  serviceName: string;
  scheduledAt: string;
  createdAt: string;
  canceled: boolean;
  imageUrl: string | null;
}

/**
 * Obtém o ID do profissional a partir da sessão
 * salva pelo AuthContext no localStorage.
 */
function getProfessionalId(): number {
  if (typeof window === "undefined") {
    throw new Error("Sessão indisponível");
  }

  const raw = localStorage.getItem("session");

  if (!raw) {
    throw new Error("Sessão não encontrada");
  }

  const session = JSON.parse(raw) as { id: number };

  if (!session.id) {
    throw new Error("ID do profissional não encontrado");
  }

  return session.id;
}

/**
 * Converte a resposta da API para o formato
 * utilizado pela interface da agenda.
 */
function converterAgendamento(item: SchedulingResponse): Appointment {
  return {
    id: String(item.id),
    time: item.scheduledAt.slice(11, 16),
    service: item.serviceName,
    client: item.clientName,
    status: item.canceled ? "disponivel" : "ocupado",
  };
}

/**
 * Busca os agendamentos do profissional
 * para uma data específica.
 */
export async function getAgendaPorData(date: Date): Promise<Appointment[]> {
  const professionalId = getProfessionalId();

  const dataIso = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

  const data = await api<SchedulingResponse[]>(
    `/schedulings/professional/${professionalId}`,
  );

  return data
    .filter(
      (item) => !item.canceled && item.scheduledAt.slice(0, 10) === dataIso,
    )
    .map(converterAgendamento)
    .sort((a, b) => a.time.localeCompare(b.time));
}

/**
 * Cancela um agendamento existente.
 */
export async function cancelarAgendamento(id: string): Promise<void> {
  await api<void>(`/schedulings/${id}/cancel`, {
    method: "PATCH",
  });
}

/**
 * Retorna os dias do mês que possuem
 * pelo menos um agendamento não cancelado.
 *
 * O parâmetro month começa em zero:
 * janeiro = 0, fevereiro = 1, etc.
 */
export async function getDiasComAgendamento(
  year: number,
  month: number,
): Promise<number[]> {
  const professionalId = getProfessionalId();

  const data = await api<SchedulingResponse[]>(
    `/schedulings/professional/${professionalId}`,
  );

  const dias = new Set<number>();

  data.forEach((item) => {
    if (item.canceled) return;

    const dataIso = item.scheduledAt.slice(0, 10);
    const [ano, mes, dia] = dataIso.split("-").map(Number);

    if (ano === year && mes === month + 1) {
      dias.add(dia);
    }
  });

  return Array.from(dias).sort((a, b) => a - b);
}
