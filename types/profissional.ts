export interface Profissional {
  id: string;
  nome: string;
  especialidade: string;
  fotoUrl?: string;
  
  whatsapp: string;
  email?: string;
}

export interface NovoProfissionalInput {
  nome: string;
  email: string;
  whatsapp: string;
  foto?: File | null;
}

export interface EditarProfissionalInput {
  nome: string;
  especialidade: string;
  foto?: File | null;
}