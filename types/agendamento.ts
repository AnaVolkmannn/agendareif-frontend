export interface ResumoAgendamento {
  profissionalNome: string;
  servico: string;
  dataHora: string;
  inspiracaoLabel: string;
  imagemUrl?: string;
}
 
export interface DadosCliente {
  nomeCompleto: string;
  email: string;
  telefone: string;
  observacao: string;
}
 
export interface CamposInvalidos {
  nomeCompleto?: string;
  email?: string;
  telefone?: string;
}
 
export type StatusConfirmacao = "idle" | "enviando" | "sucesso" | "erro";