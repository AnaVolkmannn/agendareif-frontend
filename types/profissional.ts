export type ModoAgendamento = "ONLINE" | "MANUAL";

export interface Profissional {
  id: string;
  nome: string;
  especialidade: string;
  fotoUrl?: string;
  whatsapp: string;
  email?: string;
  /** ONLINE = cliente agenda pelo site; MANUAL = redireciona para o WhatsApp. */
  modoAgendamento?: ModoAgendamento;
}

export interface NovoProfissionalInput {
  nome: string;
  email: string;
  whatsapp: string;
  descricao: string;
  foto?: File | null;
}

export interface EditarProfissionalInput {
  nome: string;
  especialidade: string;
  foto?: File | null;
}

export interface AtualizarPerfilInput {
  nome: string;
  email: string;
  whatsapp: string;
  descricao: string;
  modoAgendamento: ModoAgendamento;
  foto?: File | null;
  /** Foto já salva, reenviada quando o usuário não troca a imagem. */
  fotoUrlAtual?: string;
}