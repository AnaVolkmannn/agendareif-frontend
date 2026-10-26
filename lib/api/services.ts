import { api } from "@/lib/api/client";
import { getProfessionalId } from "@/lib/auth/session";
import type { Service, ServiceInput } from "@/types/service";

interface ServiceOfferingResponseDTO {
  id: number;
  professionalId: number;
  name: string;
  imageUrl: string | null;
  price: number;
  description: string | null;
  durationMinutes: number;
  acceptsInspiration: boolean;
}

interface ServiceOfferingRequestDTO {
  name: string;
  imageUrl: string | null;
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
    // MOCK — o backend só guarda uma imagem (imageUrl); enquanto a
    // persistência real de múltiplas fotos não existe, tratamos essa
    // única URL como a primeira (e única) foto do serviço.
    photos: dto.imageUrl ? [dto.imageUrl] : [],
  };
}

function toRequest(dados: ServiceInput): ServiceOfferingRequestDTO {
  return {
    name: dados.name.trim(),
    description: dados.description.trim(),
    price: dados.price,
    durationMinutes: dados.durationMin,
    // MOCK — ver nota acima: só a primeira foto é enviada.
    imageUrl: dados.photos[0] ?? null,
    // TODO: expor esse campo na tela quando o fluxo de "aceita inspiração"
    // do serviço for definido no frontend.
    acceptsInspiration: false,
  };
}

export async function getServices(): Promise<Service[]> {
  const professionalId = getProfessionalId();
  const data = await api<ServiceOfferingResponseDTO[]>(
    `/professionals/${professionalId}/services`
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