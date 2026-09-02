export function formatarDataHora(dataIso: string | null, hora: string | null): string {
  if (!dataIso) return hora ?? "—";

  const [ano, mes, dia] = dataIso.split("-");
  if (!ano || !mes || !dia) return hora ?? dataIso;

  const dataFormatada = `${dia}/${mes}/${ano}`;
  return hora ? `${dataFormatada} - ${hora}` : dataFormatada;
}

export function formatPrice(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

const DIAS_SEMANA_CURTO = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

export function getDiaSemanaCurto(dataIso: string): (typeof DIAS_SEMANA_CURTO)[number] {
  const [ano, mes, dia] = dataIso.split("-").map(Number);
  const data = new Date(ano, mes - 1, dia);
  return DIAS_SEMANA_CURTO[data.getDay()];
}

export function formatDiaSemanaCompleto(dataIso: string): string {
  const [ano, mes, dia] = dataIso.split("-").map(Number);
  const data = new Date(ano, mes - 1, dia);
  const diaSemana = data.toLocaleDateString("pt-BR", { weekday: "long" });
  const mesNome = data.toLocaleDateString("pt-BR", { month: "long" });
  const diaSemanaCapitalizado = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
  return `${diaSemanaCapitalizado}, ${dia} de ${mesNome.charAt(0).toUpperCase()}${mesNome.slice(1)}`;
}

export function formatDiaMesAbreviado(dataIso: string): { dia: string; mes: string } {
  const [, mes, dia] = dataIso.split("-");
  const data = new Date(Number(dataIso.slice(0, 4)), Number(mes) - 1, Number(dia));
  const mesAbrev = data.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
  return { dia, mes: mesAbrev.toUpperCase() };
}

export function toIsoDate(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

/** "2026-05-27" => "27 de maio de 2026". */
export function formatDataPorExtenso(dataIso: string): string {
  const [ano, mes, dia] = dataIso.split("-").map(Number);
  const data = new Date(ano, mes - 1, dia);
  const mesNome = data.toLocaleDateString("pt-BR", { month: "long" });
  return `${dia} de ${mesNome} de ${ano}`;
}

export function formatDataCurta(dataIso: string): string {
  const [ano, mes, dia] = dataIso.split("-");
  return `${dia}/${mes}/${ano}`;
}