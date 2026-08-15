export interface TimeSlot {
  time: string;
  available: boolean;
}

/**
 * TODO: substituir pela chamada real quando o backend estiver pronto.
 * Endpoint esperado: GET /api/agenda/dias-disponiveis?year=2026&month=5
 * Deve retornar os dias do mês que têm ao menos um horário livre.
 *
 * Por enquanto (mock): todo dia a partir de hoje está disponível;
 * dias, meses e anos anteriores ao atual ficam bloqueados.
 */
export async function getAvailableDays(
  year: number,
  month: number
): Promise<number[]> {
  await new Promise((resolve) => setTimeout(resolve, 300)); // simula latência

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, i) => i + 1).filter((day) => {
    const data = new Date(year, month, day);
    return data >= hoje;
  });
}

/**
 * TODO: substituir pela chamada real.
 * Endpoint esperado: GET /api/agenda/horarios?date=2026-05-27
 */
export async function getAvailableTimes(date: Date): Promise<string[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
}