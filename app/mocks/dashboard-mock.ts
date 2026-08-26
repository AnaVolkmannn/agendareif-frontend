import type { AgendamentoDashboard } from "@/types/dashboard";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const HOJE_REF = new Date(2026, 4, 13); // quarta-feira, 13/05/2026

const MOCK_AGENDAMENTOS: AgendamentoDashboard[] = [
  { id: "1", dataIso: "2026-05-11", hora: "09:00", servico: "Alongamento de unhas", clienteNome: "Bruna Lacerda", status: "finalizado" },
  { id: "2", dataIso: "2026-05-11", hora: "10:30", servico: "Manutenção", clienteNome: "Luana Maria", status: "finalizado" },
  { id: "3", dataIso: "2026-05-12", hora: "15:00", servico: "Alongamento de unhas", clienteNome: "Eduarda Meier", status: "finalizado" },
  { id: "4", dataIso: "2026-05-12", hora: "16:30", servico: "Alongamento de cílios", clienteNome: "Bruna Lacerda", status: "cancelado" },
  { id: "5", dataIso: "2026-05-13", hora: "09:00", servico: "Alongamento de unhas", clienteNome: "Bruna Lacerda", status: "finalizado" },
  { id: "6", dataIso: "2026-05-13", hora: "10:30", servico: "Manutenção", clienteNome: "Luana Maria", status: "agendado" },
  { id: "7", dataIso: "2026-05-13", hora: "11:00", servico: "Alongamento de unhas", clienteNome: "Eduarda Meier", status: "cancelado" },
  { id: "8", dataIso: "2026-05-13", hora: "14:30", servico: "Alongamento de unhas", clienteNome: "Bruna Lacerda", status: "cancelado" },
  { id: "9", dataIso: "2026-05-13", hora: "15:30", servico: "Manutenção", clienteNome: "Luana Maria", status: "agendado" },
  { id: "10", dataIso: "2026-05-13", hora: "17:00", servico: "Alongamento de unhas", clienteNome: "Eduarda Meier", status: "agendado" },
  { id: "11", dataIso: "2026-05-14", hora: "11:00", servico: "Alongamento de unhas", clienteNome: "Eduarda Meier", status: "cancelado" },
  { id: "12", dataIso: "2026-05-14", hora: "14:30", servico: "Alongamento de cílios", clienteNome: "Bruna Lacerda", status: "agendado" },
  { id: "13", dataIso: "2026-05-15", hora: "09:00", servico: "Alongamento de unhas", clienteNome: "Bruna Lacerda", status: "finalizado" },
  { id: "14", dataIso: "2026-05-15", hora: "14:30", servico: "Manutenção", clienteNome: "Luana Maria", status: "agendado" },
  { id: "15", dataIso: "2026-05-05", hora: "09:30", servico: "Alongamento de unhas", clienteNome: "Luana Maria", status: "finalizado" },
  { id: "16", dataIso: "2026-05-20", hora: "10:00", servico: "Manutenção", clienteNome: "Eduarda Meier", status: "agendado" },
  { id: "17", dataIso: "2026-05-25", hora: "16:00", servico: "Alongamento de cílios", clienteNome: "Bruna Lacerda", status: "finalizado" },
];

export async function getAgendamentosDashboard(): Promise<AgendamentoDashboard[]> {
  await delay(400);
  return MOCK_AGENDAMENTOS;
}