import { api } from "@/lib/api/client";
import { getProfessionalId } from "@/lib/auth/session";
import type { Service, ServiceInput } from "@/types/service";

/** Limite de fotos por serviço (igual ao MAX_PHOTOS do backend). */
export const MAX_FOTOS_SERVICO = 5;

interface ServiceOfferingResponseDTO {
  id: number;
  professionalId: number;
  name: string;
  imageUrl: string | null;
  photos?: string[];
  price: number;
  description: string | null;
  durationMinutes: number;
  acceptsInspiration: boolean;
}

interface ServiceOfferingRequestDTO {
  name: string;
  imageUrl: string | null;
  photos: string[];
  price: number;
  description: string;
  durationMinutes: number;
  acceptsInspiration: boolean;
}

function toService(dto: ServiceOfferingResponseDTO): Service {
  return {
    id: String(dto.id),
    name: dto.name,
    description: dto.description ?? "",
    price: dto.price,
    durationMin: dto.durationMinutes,
    // Serviços antigos só têm imageUrl; os novos têm a lista completa em photos.
    photos: dto.photos?.length ? dto.photos : dto.imageUrl ? [dto.imageUrl] : [],
    acceptsInspiration: dto.acceptsInspiration ?? false,
  };
}

function toRequest(dados: ServiceInput): ServiceOfferingRequestDTO {
  return {
    name: dados.name.trim(),
    description: dados.description.trim(),
    price: dados.price,
    durationMinutes: dados.durationMin,
    imageUrl: dados.photos[0] ?? null,
    photos: dados.photos.slice(0, MAX_FOTOS_SERVICO),
    // RF06: o profissional define, serviço a serviço, se aceita inspiração.
    acceptsInspiration: dados.acceptsInspiration,
  };
}

export async function getServices(): Promise<Service[]> {
  const professionalId = getProfessionalId();
  const data = await api<ServiceOfferingResponseDTO[]>(
    `/professionals/${professionalId}/services`
  );
  return data.map(toService);
}

/**
 * Serviços de um profissional escolhido pelo CLIENTE (fluxo público, sem
 * login). Diferente de getServices(), que lê o profissional da sessão.
 */
export async function getServicesByProfessional(
  professionalId: string | null
): Promise<Service[]> {
  if (!professionalId) {
    throw new Error("Profissional não informado.");
  }

  const data = await api<ServiceOfferingResponseDTO[]>(
    `/professionals/${encodeURIComponent(professionalId)}/services`,
    // Rota pública: não manda token (um token vencido atrapalharia o cliente).
    { auth: false }
  );
  return data.map(toService);
}

export async function criarServico(dados: ServiceInput): Promise<Service> {
  const professionalId = getProfessionalId();
  const saved = await api<ServiceOfferingResponseDTO>(
    `/professionals/${professionalId}/services`,
    { method: "POST", body: toRequest(dados) }
  );
  return toService(saved);
}

export async function atualizarServico(id: string, dados: ServiceInput): Promise<Service> {
  const professionalId = getProfessionalId();
  const updated = await api<ServiceOfferingResponseDTO>(
    `/professionals/${professionalId}/services/${id}`,
    { method: "PUT", body: toRequest(dados) }
  );
  return toService(updated);
}

export async function excluirServico(id: string): Promise<void> {
  const professionalId = getProfessionalId();
  await api<void>(`/professionals/${professionalId}/services/${id}`, {
    method: "DELETE",
  });
}