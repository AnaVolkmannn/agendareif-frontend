import type { Service } from "@/types/service";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MOCK_SERVICES: Service[] = [
  { id: "1", name: "Alongamento de unhas", price: 150 },
  { id: "2", name: "Manutenção", price: 80 },
  { id: "3", name: "Esmaltação em gel", price: 90 },
  { id: "4", name: "Blindagem de unhas", price: 70 },
  { id: "5", name: "Spa dos pés", price: 120 },
];

/**
 * TODO: substituir pela chamada real quando o backend estiver pronto.
 * Endpoint esperado: GET /api/servicos?profissionalId=...
 * Deve retornar os serviços oferecidos (id, nome e preço).
 *
 * Por enquanto (mock): lista fixa simulando a latência da requisição. O
 * professionalId já é recebido aqui pra que a troca pelo fetch real não
 * precise mudar a assinatura nem a tela que chama.
 */
export async function getServices(professionalId?: string | null): Promise<Service[]> {
  await delay(400); // simula latência
  void professionalId; // o mock ignora, a API real vai filtrar por profissional
  return MOCK_SERVICES;
}
