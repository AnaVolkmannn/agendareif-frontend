/** Intervalo dentro de um dia de trabalho (almoço, descanso etc). */
export interface Intervalo {
  id: string;
  /** "HH:MM" — null enquanto o profissional ainda não escolheu. */
  inicio: string | null;
  fim: string | null;
}

export interface DiaHorario {
  /** 0 = domingo … 6 = sábado */
  diaSemana: number;
  /** false = fechado, o dia não aceita agendamento. */
  aberto: boolean;
  /** Turno de trabalho, "HH:MM". */
  inicio: string;
  fim: string;
  intervalos: Intervalo[];
}

export interface HorarioPadrao {
  /** Minutos de descanso entre um cliente e outro. 0 = sem descanso. */
  descansoMinutos: number;
  dias: DiaHorario[];
}

export type TipoExcecao = "folga" | "horario-especial";

/** Folga ou horário diferente do padrão em uma data específica. */
export interface Excecao {
  id: string;
  /** ISO "yyyy-mm-dd". */
  data: string;
  tipo: TipoExcecao;
  /** Preenchidos apenas quando tipo === "horario-especial". */
  inicio?: string;
  fim?: string;
  /** Intervalos dentro do horário especial (almoço, café etc). */
  intervalos?: Intervalo[];
}

export interface NovaExcecaoInput {
  data: string;
  tipo: TipoExcecao;
  inicio?: string;
  fim?: string;
  intervalos?: Intervalo[];
}
