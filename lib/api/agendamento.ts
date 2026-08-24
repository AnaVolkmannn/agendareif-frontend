import type { DadosCliente } from "@/types/agendamento";

/**
 * Fallback do serviço contratado.
 *
 * O fluxo já tem a etapa de seleção de serviço (/pages/service), então a
 * confirmação normalmente recebe o serviço escolhido pela URL
 * (param `serviceName`). Esta função só é usada quando esse dado não
 * chegam (ex.: acesso direto à tela de confirmação), pra não quebrar a UI.
 *
 * TODO: substituir pela chamada real quando o backend estiver pronto.
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
