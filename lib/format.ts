/**
 * Recebe a data no formato ISO (YYYY-MM-DD, como a etapa de agendamento
 * envia) e o horário (HH:MM) e retorna "DD/MM/YYYY - HH:MM" para exibição.
 */
export function formatarDataHora(dataIso: string | null, hora: string | null): string {
  if (!dataIso) return hora ?? "—";

  const [ano, mes, dia] = dataIso.split("-");
  if (!ano || !mes || !dia) return hora ?? dataIso;

  const dataFormatada = `${dia}/${mes}/${ano}`;
  return hora ? `${dataFormatada} - ${hora}` : dataFormatada;
}

/**
 * Formata um valor em reais para o padrão brasileiro. Ex: 150 => "R$ 150,00".
 */
export function formatPrice(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
