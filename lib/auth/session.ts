export interface Session {
  id: number;
  token?: string;
}

export function getProfessionalId(): number {
  if (typeof window === "undefined") {
    throw new Error("Sessão indisponível");
  }

  const raw = localStorage.getItem("session");
  if (!raw) {
    throw new Error("Sessão não encontrada. Faça login novamente.");
  }

  const session = JSON.parse(raw) as Session;
  if (!session.id) {
    throw new Error("ID do profissional não encontrado na sessão.");
  }

  return session.id;
}