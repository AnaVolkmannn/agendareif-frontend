export interface Service {
  id: string;
  name: string;
  /** Descrição exibida no card do serviço. */
  description?: string;
  /**
   * Preço em reais (BRL). Ex: 150 => "R$ 150,00".
   * Formate na UI com formatPrice() de "@/lib/format".
   */
  price: number;
  /** URLs das fotos do serviço, na ordem em que devem aparecer. */
  photos?: string[];
  /** Duração estimada em minutos. Ex: 90 => "90min". */
  durationMin?: number;
}

/** Dados do formulário de cadastro/edição de serviço. */
export interface ServiceInput {
  name: string;
  description: string;
  durationMin: number;
  price: number;
  photos: string[];
}
