import type { Service, ServiceInput } from "@/types/service";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * MOCK — quadrado cinza no lugar da foto real, no mesmo espírito dos
 * placeholders do mural de inspirações. Cada URL precisa ser única porque ela
 * é usada como key da lista e como id no arrastar-para-reordenar.
 * Remover quando a API devolver as URLs de verdade.
 */
function fotoPlaceholder(numero: number): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">` +
    `<rect width="400" height="400" fill="#d9d9d9"/>` +
    `<text x="200" y="212" text-anchor="middle" font-family="sans-serif" ` +
    `font-size="30" fill="#9b9b9b">Foto ${numero}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

let MOCK_SERVICES: Service[] = [
  {
    id: "1",
    name: "Alongamento de unhas",
    description:
      "Alongamento em fibra de vidro ou acrigel, com acabamento em formato quadrado, oval ou stiletto. Inclui cutilagem e esmaltação em gel na cor escolhida.",
    durationMin: 90,
    price: 150,
    photos: [1, 2, 3, 4].map(fotoPlaceholder),
  },
  {
    id: "2",
    name: "Manutenção",
    description:
      "Manutenção do alongamento já existente, com preenchimento do crescimento, reequilíbrio da curvatura e nova esmaltação.",
    durationMin: 60,
    price: 80,
    photos: [5, 6].map(fotoPlaceholder),
  },
  {
    id: "3",
    name: "Esmaltação em gel",
    description:
      "Esmaltação em gel na unha natural, com cutilagem e finalização em cabine de LED. Durabilidade de até três semanas.",
    durationMin: 60,
    price: 90,
    photos: [7, 8, 9].map(fotoPlaceholder),
  },
  {
    id: "4",
    name: "Blindagem de unhas",
    description:
      "Camada protetora aplicada sobre a unha natural para reforçar unhas fracas ou quebradiças, com brilho e acabamento natural.",
    durationMin: 45,
    price: 70,
    photos: [],
  },
  {
    id: "5",
    name: "Spa dos pés",
    description:
      "Esfoliação, hidratação profunda e massagem relaxante nos pés, com cutilagem e esmaltação inclusas.",
    durationMin: 75,
    price: 120,
    photos: [],
  },
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

/**
 * TODO: substituir por POST /api/servicos quando o backend existir.
 * As fotos chegam aqui como object URLs criadas no navegador; a API real
 * vai receber os arquivos e devolver as URLs definitivas.
 */
export async function criarServico(dados: ServiceInput): Promise<Service> {
  await delay(600);

  const novo: Service = {
    id: crypto.randomUUID(),
    name: dados.name.trim(),
    description: dados.description.trim(),
    durationMin: dados.durationMin,
    price: dados.price,
    photos: dados.photos,
  };

  MOCK_SERVICES = [...MOCK_SERVICES, novo];
  return novo;
}

/** TODO: substituir por PUT /api/servicos/:id quando o backend existir. */
export async function atualizarServico(id: string, dados: ServiceInput): Promise<Service> {
  await delay(600);

  let atualizado: Service | undefined;
  MOCK_SERVICES = MOCK_SERVICES.map((servico) => {
    if (servico.id !== id) return servico;
    atualizado = {
      ...servico,
      name: dados.name.trim(),
      description: dados.description.trim(),
      durationMin: dados.durationMin,
      price: dados.price,
      photos: dados.photos,
    };
    return atualizado;
  });

  if (!atualizado) {
    throw new Error("Serviço não encontrado.");
  }
  return atualizado;
}

/** TODO: substituir por DELETE /api/servicos/:id quando o backend existir. */
export async function excluirServico(id: string): Promise<void> {
  await delay(400);
  MOCK_SERVICES = MOCK_SERVICES.filter((servico) => servico.id !== id);
}
