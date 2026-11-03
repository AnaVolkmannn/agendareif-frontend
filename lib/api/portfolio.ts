import { api } from "@/lib/api/client";
import { getProfessionalId } from "@/lib/auth/session";
import { uploadImagem } from "@/lib/api/upload";

export interface PortfolioPhoto {
  id: string;
  url: string;
}

interface PortfolioResponseDTO {
  id: number;
  professionalId: number;
  imageUrl: string;
  sortOrder: number;
}

function toPhoto(dto: PortfolioResponseDTO): PortfolioPhoto {
  return { id: String(dto.id), url: dto.imageUrl };
}

/** Fotos do profissional logado (já vêm ordenadas por sortOrder). */
export async function getPortfolioPhotos(): Promise<PortfolioPhoto[]> {
  const professionalId = getProfessionalId();
  const data = await api<PortfolioResponseDTO[]>(
    `/professionals/${professionalId}/portfolio`,
  );
  return data.map(toPhoto);
}

/**
 * Sobe os arquivos pro Azure e registra todos de uma vez no /batch.
 * Importante ser em lote: se fossem vários POST em paralelo, o backend
 * calcularia o mesmo sortOrder para todos (nextSortOrder não é atômico).
 */
export async function uploadPortfolioPhotos(
  files: File[],
): Promise<PortfolioPhoto[]> {
  const professionalId = getProfessionalId();

  const urls = await Promise.all(
    files.map((file) => uploadImagem("portfolio", file)),
  );

  const data = await api<PortfolioResponseDTO[]>(
    `/professionals/${professionalId}/portfolio/batch`,
    { method: "POST", body: { imageUrls: urls } },
  );
  return data.map(toPhoto);
}

export async function deletePortfolioPhoto(id: string): Promise<void> {
  const professionalId = getProfessionalId();
  await api<void>(`/professionals/${professionalId}/portfolio/${id}`, {
    method: "DELETE",
  });
}

/** O backend exige TODAS as fotos do profissional, sem repetição. */
export async function reorderPortfolioPhotos(
  orderedIds: string[],
): Promise<void> {
  const professionalId = getProfessionalId();
  await api<PortfolioResponseDTO[]>(
    `/professionals/${professionalId}/portfolio/reorder`,
    { method: "PATCH", body: { orderedIds: orderedIds.map(Number) } },
  );
}

/**
 * Mural público da home (sem login): junta o portfólio de todos os
 * profissionais, intercalando as fotos para não ficar um bloco de cada.
 */
export async function getMuralPhotos(): Promise<PortfolioPhoto[]> {
  const profissionais = await api<{ id: number }[]>("/professionals", {
    auth: false,
  });

  const listas = await Promise.all(
    profissionais.map(
      (p) =>
        api<PortfolioResponseDTO[]>(`/professionals/${p.id}/portfolio`, {
          auth: false,
        })
          .then((dados) => dados.map(toPhoto))
          .catch(() => [] as PortfolioPhoto[]), // um profissional com erro não derruba o mural
    ),
  );

  const intercaladas: PortfolioPhoto[] = [];
  const maior = Math.max(0, ...listas.map((l) => l.length));
  for (let i = 0; i < maior; i++) {
    for (const lista of listas) {
      if (lista[i]) intercaladas.push(lista[i]);
    }
  }
  return intercaladas;
}
