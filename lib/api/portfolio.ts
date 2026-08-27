export interface PortfolioPhoto {
  id: string;
  url: string;
}

/**
 * TODO: substituir pela chamada real.
 * Endpoint esperado: GET /api/portfolio
 */
export async function getPortfolioPhotos(): Promise<PortfolioPhoto[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  // MOCK — remove quando ligar na API real
  return Array.from({ length: 6 }, (_, i) => ({
    id: `mock-${i}`,
    url: "",
  }));
}

/**
 * TODO: substituir pela chamada real.
 * Endpoint esperado: POST /api/portfolio (multipart/form-data)
 */
export async function uploadPortfolioPhoto(file: File): Promise<PortfolioPhoto> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    id: crypto.randomUUID(),
    url: URL.createObjectURL(file), // MOCK — troque pela URL retornada pelo backend
  };
}

/**
 * TODO: substituir pela chamada real.
 * Endpoint esperado: DELETE /api/portfolio/:id
 */
export async function deletePortfolioPhoto(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200));
}

/**
 * TODO: substituir pela chamada real.
 * Endpoint esperado: PATCH /api/portfolio/reorder  body: { orderedIds: string[] }
 */
export async function reorderPortfolioPhotos(orderedIds: string[]): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200));
}