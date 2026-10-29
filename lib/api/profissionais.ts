import { api, ApiError } from "@/lib/api/client";
import { toProfissional, type ProfessionalResponse } from "@/lib/api/perfil";
import { uploadImagem } from "@/lib/api/upload";
import type {
  EditarProfissionalInput,
  ModoAgendamento,
  NovoProfissionalInput,
  Profissional,
} from "@/types/profissional";

interface ProfessionalRequestDTO {
  name: string;
  email: string;
  phone: string;
  profilePicture: string | null;
  description: string | null;
  scheduleMode: ModoAgendamento;
}

interface ProfessionalRegisterResponseDTO {
  professional: ProfessionalResponse;
  /** Só aparece nesta resposta — não dá para consultar depois. */
  temporaryPassword: string;
}

export interface ProfissionalCriado {
  profissional: Profissional;
  senhaTemporaria: string;
}

/**
 * GET /schedulings é só de ADMIN: responde 200 enquanto a sessão do admin vale.
 */
async function sessaoAdminValida(): Promise<boolean> {
  try {
    await api<unknown>("/schedulings");
    return true;
  } catch {
    return false;
  }
}

/**
 * O backend não tem tratamento global de erros: e-mail repetido, exclusão
 * bloqueada etc. viram 500, e o Spring Security entrega esse 500 como 403
 * (a rota /error exige login). Por isso um 403 só é tratado como sessão
 * expirada depois de confirmar que o token do admin deixou de valer.
 */
async function erroAmigavel(erro: unknown, padrao: string): Promise<Error> {
  if (erro instanceof ApiError) {
    if (erro.status === 401 || erro.status === 403) {
      if (!(await sessaoAdminValida())) {
        return new Error("Sua sessão expirou. Entre novamente como administrador.");
      }
      return new Error(padrao);
    }
    if (erro.status === 400) {
      return new Error("Confira os dados preenchidos e tente novamente.");
    }
  }
  return new Error(padrao);
}

/** Mesmo padrão de perfil.ts: a máscara garante 11 dígitos e sempre prefixa o 55. */
function toPhone(whatsapp: string): string {
  return `55${whatsapp.replace(/\D/g, "")}`;
}

async function enviarFoto(foto: File): Promise<string> {
  try {
    return await uploadImagem("profiles", foto);
  } catch {
    throw new Error("Não foi possível enviar a foto. Tente novamente ou salve sem foto.");
  }
}

/**
 * GET /professionals — rota pública: o cliente escolhe o profissional sem
 * login. Não manda token (um token vencido atrapalharia o cliente).
 */
export async function getProfissionais(): Promise<Profissional[]> {
  const data = await api<ProfessionalResponse[]>("/professionals", { auth: false });
  return data.map(toProfissional);
}

/**
 * POST /professionals — só ADMIN (RF26/RF27). O backend gera a senha
 * temporária; o profissional cria a definitiva no primeiro acesso (RF28).
 */
export async function criarProfissional(
  dados: NovoProfissionalInput
): Promise<ProfissionalCriado> {
  const email = dados.email.trim();

  // O backend recusa e-mail repetido, mas sem mensagem (500). Checamos antes
  // para conseguir dizer o motivo.
  const existentes = await getProfissionais().catch(() => []);
  if (existentes.some((p) => p.email?.toLowerCase() === email.toLowerCase())) {
    throw new Error("Já existe um profissional cadastrado com esse e-mail.");
  }

  // A foto sobe antes: se falhar, nada é criado pela metade.
  const profilePicture = dados.foto ? await enviarFoto(dados.foto) : null;

  const body: ProfessionalRequestDTO = {
    name: dados.nome.trim(),
    email,
    phone: toPhone(dados.whatsapp),
    profilePicture,
    description: dados.descricao.trim() || null,
    // O admin não escolhe o modo; o próprio profissional muda no perfil (RF03).
    scheduleMode: "ONLINE",
  };

  try {
    const data = await api<ProfessionalRegisterResponseDTO>("/professionals", {
      method: "POST",
      body,
    });
    return {
      profissional: toProfissional(data.professional),
      senhaTemporaria: data.temporaryPassword,
    };
  } catch (erro) {
    throw await erroAmigavel(erro, "Não foi possível cadastrar o profissional. Tente novamente.");
  }
}

/**
 * PUT /professionals/{id} — substitui o registro inteiro e exige phone e
 * email. A tela só edita nome, descrição e foto, então buscamos o registro
 * atual e mantemos o resto (senão apagaria telefone, foto e modo).
 */
export async function atualizarProfissional(
  id: string,
  dados: EditarProfissionalInput
): Promise<Profissional> {
  try {
    const atual = await api<ProfessionalResponse>(`/professionals/${id}`);

    const profilePicture = dados.foto ? await enviarFoto(dados.foto) : atual.profilePicture;

    const body: ProfessionalRequestDTO = {
      name: dados.nome.trim(),
      email: atual.email,
      phone: atual.phone ?? "",
      profilePicture,
      description: dados.especialidade.trim() || null,
      scheduleMode: atual.scheduleMode,
    };

    const data = await api<ProfessionalResponse>(`/professionals/${id}`, {
      method: "PUT",
      body,
    });
    return toProfissional(data);
  } catch (erro) {
    if (erro instanceof Error && !(erro instanceof ApiError)) throw erro;
    throw await erroAmigavel(erro, "Não foi possível salvar as alterações. Tente novamente.");
  }
}

/** DELETE /professionals/{id} — só ADMIN. */
export async function excluirProfissional(id: string): Promise<void> {
  try {
    await api<void>(`/professionals/${id}`, { method: "DELETE" });
  } catch (erro) {
    // Serviços, horários, portfólio e agendamentos apontam para o
    // profissional sem cascade, então o banco bloqueia a exclusão.
    throw await erroAmigavel(
      erro,
      "Não foi possível excluir. Se o profissional tiver serviços, horários ou agendamentos cadastrados, remova-os antes."
    );
  }
}
