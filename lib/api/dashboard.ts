import { api } from "@/lib/api/client";
import type {
  AgendamentoDashboard,
  StatusAgendamento,
} from "@/types/dashboard";

/** Formato que o backend devolve em /schedulings/professional/{id}. */
interface SchedulingResponse {
  id: number;
  clientId: number;
  clientName: string;
  professionalId: number;
  professionalName: string;
  serviceId: number;
  serviceName: string;
  scheduledAt: string; // "2026-05-13T09:00:00" (sem fuso)
  createdAt: string;
  canceled: boolean;
  imageUrl: string | null;
}

function calcularStatus(
  item: SchedulingResponse,
  agora: Date,
): StatusAgendamento {
  if (item.canceled) return "cancelado";
  // sem fuso na string, o Date interpreta como horário local (o que queremos)
  return new Date(item.scheduledAt) < agora ? "finalizado" : "agendado";
}

export async function getAgendamentosDashboard(
  professionalId: number,
): Promise<AgendamentoDashboard[]> {
  const data = await api<SchedulingResponse[]>(
    `/schedulings/professional/${professionalId}`,
  );

  const agora = new Date();

  return data.map((item) => ({
    id: String(item.id),
    dataIso: item.scheduledAt.slice(0, 10), // "2026-05-13"
    hora: item.scheduledAt.slice(11, 16), // "09:00"
    servico: item.serviceName,
    clienteNome: item.clientName,
    status: calcularStatus(item, agora),
  }));
}
