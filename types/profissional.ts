export interface Profissional {
  id: string;
  nome: string;
  especialidade: string;
  fotoUrl?: string;
  /**
   * Telefone no formato internacional, somente dígitos (DDI + DDD + número).
   * Ex: "5547999990001". Usado para montar o link https://wa.me/<whatsapp>.
   */
  whatsapp: string;
}