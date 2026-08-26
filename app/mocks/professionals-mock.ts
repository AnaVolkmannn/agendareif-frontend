import type {
  EditarProfissionalInput,
  NovoProfissionalInput,
  Profissional,
} from "@/types/profissional";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let MOCK_PROFISSIONAIS: Profissional[] = [
  {
    id: "1",
    nome: "Mari Reif",
    especialidade: "Especialista em cílios fox eyes & efeito molhado",
    whatsapp: "5547999990001",
  },
  {
    id: "2",
    nome: "Renan Lucas",
    especialidade: "Especialista em tranças, cortes e locs",
    whatsapp: "5547999990002",
  },
  {
    id: "3",
    nome: "Malu Oliveira",
    especialidade: "Especialista na técnica de fibra de vidro & nail arts",
    whatsapp: "5547999990003",
    email: "malu.oliveira@gmail.com",
  },
];

export async function getProfissionais(): Promise<Profissional[]> {
  await delay(400);
  return MOCK_PROFISSIONAIS;
}

/**
 * TODO: substituir pela chamada real quando o backend estiver pronto.
 * Endpoint esperado: POST /api/profissionais
 * Deve criar o profissional e disparar o e-mail de convite (RF26/RF27 —
 * fluxo de convite em si é fora do escopo do FE-ADMIN03).
 */
export async function criarProfissional(dados: NovoProfissionalInput): Promise<Profissional> {
  await delay(600);

  const digitosWhatsapp = dados.whatsapp.replace(/\D/g, "");
  const novo: Profissional = {
    id: crypto.randomUUID(),
    nome: dados.nome.trim(),
    email: dados.email.trim(),
    whatsapp: `55${digitosWhatsapp}`,
    especialidade: "",
    fotoUrl: dados.foto ? URL.createObjectURL(dados.foto) : undefined,
  };

  MOCK_PROFISSIONAIS = [...MOCK_PROFISSIONAIS, novo];
  return novo;
}

/**
 * TODO: substituir pela chamada real quando o backend estiver pronto.
 * Endpoint esperado: PATCH /api/profissionais/:id
 */
export async function atualizarProfissional(
  id: string,
  dados: EditarProfissionalInput
): Promise<Profissional> {
  await delay(600);

  let atualizado: Profissional | undefined;
  MOCK_PROFISSIONAIS = MOCK_PROFISSIONAIS.map((profissional) => {
    if (profissional.id !== id) return profissional;
    atualizado = {
      ...profissional,
      nome: dados.nome.trim(),
      especialidade: dados.especialidade.trim(),
      fotoUrl: dados.foto ? URL.createObjectURL(dados.foto) : profissional.fotoUrl,
    };
    return atualizado;
  });

  if (!atualizado) {
    throw new Error("Profissional não encontrado.");
  }
  return atualizado;
}

export interface UploadInspiracaoResult {
  url: string;
}

export async function uploadImagemInspiracao(
  file: File
): Promise<UploadInspiracaoResult> {
  await delay(600);
  return { url: URL.createObjectURL(file) };
}

export async function excluirProfissional(id: string): Promise<void> {
  await delay(400);
  MOCK_PROFISSIONAIS = MOCK_PROFISSIONAIS.filter((profissional) => profissional.id !== id);
}