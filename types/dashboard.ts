export type StatusAgendamento = "agendado" | "finalizado" | "cancelado";

export interface AgendamentoDashboard {
  id: string;
  /** Data do agendamento no formato ISO (YYYY-MM-DD). */
  dataIso: string;
  /** Horário no formato HH:MM. */
  hora: string;
  servico: string;
  clienteNome: string;
  status: StatusAgendamento;
}

export type PeriodoDashboard = "hoje" | "semana" | "mes" | "personalizado";