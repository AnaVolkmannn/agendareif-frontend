export interface ResumoAgendamento {
  profissionalNome: string;
  servico: string;
  dataHora: string;
  inspiracaoLabel: string;
}
 
export interface DadosCliente {
  nomeCompleto: string;
  email: string;
  telefone: string;
}
 
export interface CamposInvalidos {
  nomeCompleto?: string;
  email?: string;
  telefone?: string;
}
 
export type StatusConfirmacao = "idle" | "enviando" | "sucesso" | "erro";