import type {
  AlterarSenhaInput,
  AlterarSenhaResult,
  AtualizarPerfilInput,
  Profissional,
} from "@/types/profissional";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// MOCK — remove quando ligar na API real. Representa o profissional logado
// (viria do token/sessão de autenticação).
let PERFIL_LOGADO: Profissional = {
  id: "3",
  nome: "Malu Oliveira",
  especialidade: "Especialista na técnica de fibra de vidro & nail arts",
  whatsapp: "5547999990003",
  email: "malu.oliveira@gmail.com",
};

/**
 * TODO: substituir pela chamada real quando o backend estiver pronto.
 * Endpoint esperado: GET /api/perfil/me
 */
export async function getPerfilLogado(): Promise<Profissional> {
  await delay(400);
  return PERFIL_LOGADO;
}

/**
 * TODO: substituir pela chamada real quando o backend estiver pronto.
 * Endpoint esperado: PUT /api/perfil/me
 */
export async function atualizarPerfilLogado(
  dados: AtualizarPerfilInput
): Promise<Profissional> {
  await delay(600);

  const digitosWhatsapp = dados.whatsapp.replace(/\D/g, "");

  PERFIL_LOGADO = {
    ...PERFIL_LOGADO,
    nome: dados.nome.trim(),
    email: dados.email.trim(),
    whatsapp: digitosWhatsapp.startsWith("55")
      ? digitosWhatsapp
      : `55${digitosWhatsapp}`,
    fotoUrl: dados.foto ? URL.createObjectURL(dados.foto) : PERFIL_LOGADO.fotoUrl,
  };

  return PERFIL_LOGADO;
}

/**
 * TODO: substituir pela chamada real quando o backend estiver pronto.
 * Endpoint esperado: POST /api/perfil/me/senha
 */
export async function alterarSenha(
  dados: AlterarSenhaInput
): Promise<AlterarSenhaResult> {
  await delay(600);

  if (dados.senhaAtual.length < 6) {
    return { sucesso: false, mensagem: "Senha atual incorreta." };
  }

  console.log("[mock] Senha alterada para o perfil:", PERFIL_LOGADO.id);

  return { sucesso: true };
}
