import type { DadosCliente } from "@/types/agendamento";

/**
 * TODO: substituir pela chamada real quando o backend estiver pronto.
 * Ainda não existe etapa de seleção de serviço no fluxo (só profissional,
 * inspiração e data/hora), então o serviço contratado fica mockado aqui.
 * Endpoint esperado: GET /api/agenda/servico?profissionalId=...
 */
export async function getServicoContratado(): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return "Alongamento de unhas";
}

export interface ConfirmarAgendamentoResult {
  sucesso: boolean;
  mensagem?: string;
}

/**
 * TODO: substituir pela chamada real quando o backend estiver pronto.
 * Endpoint esperado: POST /api/agendamentos
 * Deve criar o agendamento e disparar o e-mail de confirmação pro cliente.
 */
export async function confirmarAgendamento(
  dados: DadosCliente
): Promise<ConfirmarAgendamentoResult> {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  console.log("[mock] Enviando e-mail de confirmação para:", dados.email);

  return { sucesso: true };
}