export interface Service {
  id: string;
  name: string;
  /**
   * Preço em reais (BRL). Ex: 150 => "R$ 150,00".
   * Formate na UI com formatPrice() de "@/lib/format".
   */
  price: number;
  /** Duração estimada em minutos. Opcional — reservado para uso futuro. */
  durationMin?: number;
}
