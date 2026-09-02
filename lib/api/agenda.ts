export interface Appointment {
  id: string;
  time: string;
  service: string | null;
  client: string | null;
  status: "ocupado" | "disponivel";
}

/**
 * TODO: substituir pela chamada real.
 * Endpoint esperado: GET /api/agenda?data=2026-05-13
 */
export async function getAgendaDoDia(): Promise<Appointment[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  // MOCK — remove quando ligar na API real
  return [
    { id: "1", time: "09:00", service: "Alongamento de unhas", client: "Bruna Lacerda", status: "ocupado" },
    { id: "2", time: "10:00", service: "Manutenção", client: "Luana Maria", status: "ocupado" },
    { id: "3", time: "11:00", service: "Manutenção", client: "Eduarda Meier", status: "ocupado" },
    { id: "4", time: "14:00", service: null, client: null, status: "disponivel" },
    { id: "5", time: "15:00", service: "Esmaltação em gel", client: "Sofia Koche", status: "ocupado" },
    { id: "6", time: "16:00", service: "Esmaltação em gel", client: "Mariana dos Santos", status: "ocupado" },
    { id: "7", time: "17:00", service: "Alongamento de unhas", client: "Juliana Castilhos", status: "ocupado" },
  ];
}

/**
 * TODO: substituir pela chamada real.
 * Endpoint esperado: DELETE /api/agenda/:id
 */
export async function cancelarAgendamento(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200));
}

/**
 * TODO: substituir pela chamada real.
 * Endpoint esperado: GET /api/agenda?data=2026-09-08
 */
export async function getAgendaPorData(date: Date): Promise<Appointment[]> {
   await new Promise((resolve) => setTimeout(resolve, 300));

   // MOCK — dia 1 de setembro fica sem nenhum agendamento
   const isPrimeiroDeSetembro = date.getDate() === 1 && date.getMonth() === 8;
   if (isPrimeiroDeSetembro) return [];
   return getAgendaDoDia(); // MOCK — reaproveita a mesma lista de exemplo pros demais dias
}

/**
 * TODO: substituir pela chamada real.
 * Endpoint esperado: GET /api/agenda/dias-com-agendamento?year=2026&month=8
 */
export async function getDiasComAgendamento(
  year: number,
  month: number
): Promise<number[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => i + 1).filter(
    (d) => d % 2 === 0 // MOCK — remove quando ligar na API real
  );
}