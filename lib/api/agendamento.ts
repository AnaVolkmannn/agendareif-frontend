import { api, ApiError } from "@/lib/api/client";
import { getAvailableSlots } from "@/lib/api/scheduling";
import type { DadosCliente } from "@/types/agendamento";

interface ClientRequestDTO {
  name: string;
  email: string;
  phone: string;
  observation: string | null;
}

interface ClientResponseDTO {
  id: number;
  name: string;
  email: string;
  phone: string;
  observation: string | null;
}

interface SchedulingRequestDTO {
  clientId: number;
  professionalId: number;
  serviceId: number;
  scheduledAt: string;
}

interface SchedulingResponseDTO {
  id: number;
  clientId: number;
  professionalId: number;
  serviceId: number;
  scheduledAt: string;
  canceled: boolean;
}

/** O que foi escolhido nas telas anteriores (chega pela URL). */
export interface AgendamentoSelecionado {
  professionalId: string;
  serviceId: string;
  /** "2026-10-27T09:00:00" — valor exato devolvido por /schedulings/available-slots */
  scheduledAt: string;
}

export interface ConfirmarAgendamentoResult {
  sucesso: boolean;
  mensagem?: string;
}

function toClientRequest(dados: DadosCliente): ClientRequestDTO {
  const observacao = dados.observacao.trim();
  return {
    name: dados.nomeCompleto.trim(),
    email: dados.email.trim(),
    // Diferente do profissional (perfil.ts), o cliente NÃO leva o 55: o
    // backend valida o formato "(DDD) 90000-0000", que é o da máscara.
    phone: dados.telefone,
    observation: observacao || null,
  };
}

/**
 * Cliente já cadastrado nesta tentativa. Se o POST /schedulings falhar e a
 * pessoa clicar de novo sem mudar os dados, reaproveita o mesmo cliente em
 * vez de criar um duplicado.
 */
let clienteCriado: { chave: string; id: number } | null = null;

async function obterClienteId(request: ClientRequestDTO): Promise<number> {
  const chave = JSON.stringify(request);
  if (clienteCriado?.chave === chave) return clienteCriado.id;

  // POST /clients — precisa estar liberado sem login no SecurityConfig.
  const cliente = await api<ClientResponseDTO>("/clients", {
    method: "POST",
    body: request,
    auth: false,
  });
  clienteCriado = { chave, id: cliente.id };
  return cliente.id;
}

/**
 * O horário pode ter sido reservado por outra pessoa enquanto o cliente
 * preenchia o formulário. O backend recusa o conflito, mas sem uma mensagem
 * que o front consiga mostrar — então checamos antes, com a mesma rota
 * pública usada na tela de horários.
 */
async function horarioAindaLivre(agendamento: AgendamentoSelecionado): Promise<boolean> {
  const slots = await getAvailableSlots(
    Number(agendamento.professionalId),
    Number(agendamento.serviceId),
    new Date(agendamento.scheduledAt)
  );
  const alvo = agendamento.scheduledAt.slice(0, 16);
  return slots.some((slot) => slot.isoDateTime.slice(0, 16) === alvo);
}

function mensagemDeErro(erro: unknown): string {
  if (erro instanceof ApiError) {
    if (erro.status === 400) {
      return "Confira nome, e-mail e telefone e tente novamente.";
    }
    if (erro.status === 401 || erro.status === 403) {
      return "Não foi possível concluir seu cadastro agora. Tente novamente mais tarde.";
    }
  }
  return "Não foi possível confirmar o agendamento. Tente novamente.";
}

/**
 * POST /clients → POST /schedulings (as duas rotas são do fluxo público).
 * O backend envia o e-mail de confirmação ao criar o agendamento.
 */
export async function confirmarAgendamento(
  dados: DadosCliente,
  agendamento: AgendamentoSelecionado
): Promise<ConfirmarAgendamentoResult> {
  try {
    if (!(await horarioAindaLivre(agendamento))) {
      return {
        sucesso: false,
        mensagem: "Esse horário acabou de ser reservado. Volte e escolha outro horário.",
      };
    }

    const clientId = await obterClienteId(toClientRequest(dados));

    const body: SchedulingRequestDTO = {
      clientId,
      professionalId: Number(agendamento.professionalId),
      serviceId: Number(agendamento.serviceId),
      scheduledAt: agendamento.scheduledAt,
    };

    await api<SchedulingResponseDTO>("/schedulings", {
      method: "POST",
      body,
      auth: false,
    });

    clienteCriado = null;
    return { sucesso: true };
  } catch (erro) {
    console.error("[confirmarAgendamento]", erro);
    return { sucesso: false, mensagem: mensagemDeErro(erro) };
  }
}
