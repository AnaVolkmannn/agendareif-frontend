import { getProfissionais } from "@/app/mocks/professionals-mock";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// TODO: substituir por autenticação real (JWT/sessão) quando o backend
// estiver pronto. Por enquanto, "admin" é identificado por um e-mail fixo
// e "profissional" por bater com o e-mail cadastrado em professionals-mock.
const ADMIN_EMAIL = "admin@reifbeautystudio.com";

export type PapelUsuario = "admin" | "profissional";

export interface LoginResult {
  sucesso: boolean;
  papel?: PapelUsuario;
  profissionalId?: string;
  mensagem?: string;
}

export async function autenticar(email: string, senha: string): Promise<LoginResult> {
  await delay(700);

  if (!senha.trim()) {
    return { sucesso: false, mensagem: "Informe sua senha." };
  }

  const emailNormalizado = email.trim().toLowerCase();

  if (emailNormalizado === ADMIN_EMAIL) {
    return { sucesso: true, papel: "admin" };
  }

  const profissionais = await getProfissionais();
  const profissional = profissionais.find(
    (item) => item.email?.toLowerCase() === emailNormalizado
  );

  if (profissional) {
    return { sucesso: true, papel: "profissional", profissionalId: profissional.id };
  }

  return { sucesso: false, mensagem: "E-mail não encontrado. Confira e tente novamente." };
}