import type { Profissional } from "@/types/profissional";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MOCK_PROFISSIONAIS: Profissional[] = [
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
  },
];

export async function getProfissionais(): Promise<Profissional[]> {
  await delay(400);
  return MOCK_PROFISSIONAIS;
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