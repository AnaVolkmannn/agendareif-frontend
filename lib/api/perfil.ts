import { api } from "@/lib/api/client";
import { uploadImagem } from "@/lib/api/upload";
import type {
  AtualizarPerfilInput,
  ModoAgendamento,
  Profissional,
} from "@/types/profissional";

export interface ProfessionalResponse {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  profilePicture: string | null;
  description: string | null;
  scheduleMode: ModoAgendamento;
}

export function toProfissional(p: ProfessionalResponse): Profissional {
  return {
    id: String(p.id),
    nome: p.name,
    especialidade: p.description ?? "",
    fotoUrl: p.profilePicture ?? undefined,
    whatsapp: p.phone ?? "",
    email: p.email,
    modoAgendamento: p.scheduleMode,
  };
}

export async function getPerfilLogado(
  professionalId: number,
): Promise<Profissional> {
  const data = await api<ProfessionalResponse>(
    `/professionals/${professionalId}`,
  );
  return toProfissional(data);
}

export async function atualizarPerfilLogado(
  professionalId: number,
  dados: AtualizarPerfilInput,
): Promise<Profissional> {
  // A máscara garante 11 dígitos (ddd + 9 dígitos). Sempre prefixa o 55:
  // checar startsWith("55") erraria para o DDD 55.
  const phone = `55${dados.whatsapp.replace(/\D/g, "")}`;

  const profilePicture = dados.foto
    ? await uploadImagem("profiles", dados.foto)
    : (dados.fotoUrlAtual ?? null);

  const data = await api<ProfessionalResponse>(
    `/professionals/${professionalId}`,
    {
      method: "PUT",
      body: {
        name: dados.nome.trim(),
        email: dados.email.trim(),
        phone,
        profilePicture,
        description: dados.descricao.trim(),
        scheduleMode: dados.modoAgendamento,
      },
    },
  );
  return toProfissional(data);
}