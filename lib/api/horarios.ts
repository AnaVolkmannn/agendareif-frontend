import type {
  Excecao,
  HorarioPadrao,
  NovaExcecaoInput,
} from "@/types/horario";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Opções de horário do dia, de 30 em 30 minutos ("00:00" … "23:30"). */
export const OPCOES_HORARIO: string[] = Array.from({ length: 48 }, (_, i) => {
  const hora = String(Math.floor(i / 2)).padStart(2, "0");
  const minuto = i % 2 === 0 ? "00" : "30";
  return `${hora}:${minuto}`;
});

/** Opções do campo "Descanso entre clientes", em minutos. */
export const OPCOES_DESCANSO = [
  { valor: 0, label: "Sem descanso" },
  { valor: 5, label: "5 minutos" },
  { valor: 10, label: "10 minutos" },
  { valor: 15, label: "15 minutos" },
  { valor: 20, label: "20 minutos" },
  { valor: 30, label: "30 minutos" },
];

const NOMES_DIAS = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export function getNomeDia(diaSemana: number): string {
  return NOMES_DIAS[diaSemana];
}

let MOCK_HORARIO: HorarioPadrao = {
  descansoMinutos: 0,
  dias: NOMES_DIAS.map((_, diaSemana) => ({
    diaSemana,
    // Segunda a sexta abertos por padrão, fim de semana fechado.
    aberto: diaSemana >= 1 && diaSemana <= 5,
    inicio: "09:00",
    fim: "19:00",
    intervalos: [],
  })),
};

let MOCK_EXCECOES: Excecao[] = [];

/**
 * TODO: substituir pela chamada real.
 * Endpoint esperado: GET /api/profissional/horario-padrao
 */
export async function getHorarioPadrao(): Promise<HorarioPadrao> {
  await delay(400);
  return MOCK_HORARIO;
}

/**
 * TODO: substituir pela chamada real.
 * Endpoint esperado: PUT /api/profissional/horario-padrao
 */
export async function salvarHorarioPadrao(
  horario: HorarioPadrao
): Promise<HorarioPadrao> {
  await delay(600);
  MOCK_HORARIO = horario;
  return MOCK_HORARIO;
}

/**
 * TODO: substituir pela chamada real.
 * Endpoint esperado: GET /api/profissional/excecoes
 */
export async function getExcecoes(): Promise<Excecao[]> {
  await delay(400);
  return MOCK_EXCECOES;
}

/**
 * TODO: substituir pela chamada real.
 * Endpoint esperado: POST /api/profissional/excecoes
 */
export async function criarExcecao(dados: NovaExcecaoInput): Promise<Excecao> {
  await delay(600);

  const nova: Excecao = {
    id: crypto.randomUUID(),
    data: dados.data,
    tipo: dados.tipo,
    inicio: dados.tipo === "horario-especial" ? dados.inicio : undefined,
    fim: dados.tipo === "horario-especial" ? dados.fim : undefined,
  };

  // Uma data só pode ter uma exceção: a nova substitui a anterior.
  MOCK_EXCECOES = [...MOCK_EXCECOES.filter((e) => e.data !== nova.data), nova].sort(
    (a, b) => a.data.localeCompare(b.data)
  );
  return nova;
}

/**
 * TODO: substituir pela chamada real.
 * Endpoint esperado: DELETE /api/profissional/excecoes/:id
 */
export async function excluirExcecao(id: string): Promise<void> {
  await delay(400);
  MOCK_EXCECOES = MOCK_EXCECOES.filter((excecao) => excecao.id !== id);
}
