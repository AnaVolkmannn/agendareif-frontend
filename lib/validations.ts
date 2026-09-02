import type { CamposInvalidos, DadosCliente } from "@/types/agendamento";

// Aceita apenas o formato (ddd) 9xxxx-xxxx, ex: (47) 99999-9999
const TELEFONE_REGEX = /^\(\d{2}\) 9\d{4}-\d{4}$/;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const OBSERVACAO_MAX_LENGTH = 300;

/**
 * Aplica a máscara (ddd) 9xxxx-xxxx enquanto o usuário digita,
 * removendo qualquer caractere que não seja número.
 */
export function mascararTelefone(valorBruto: string): string {
  const numeros = valorBruto.replace(/\D/g, "").slice(0, 11);

  if (numeros.length === 0) return "";
  if (numeros.length <= 2) return `(${numeros}`;
  if (numeros.length <= 7) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
}

/**
 * Aplica a máscara de preço em reais enquanto o usuário digita. Trabalha em
 * centavos: cada dígito novo entra pela direita, então "8000" vira "80,00".
 * O símbolo "R$" fica fora do input (é exibido como prefixo do campo).
 */
export function mascararPreco(valorBruto: string): string {
  const numeros = valorBruto.replace(/\D/g, "").slice(0, 9);
  if (numeros.length === 0) return "";

  const centavos = numeros.padStart(3, "0");
  const inteiros = Number(centavos.slice(0, -2));
  return `${inteiros.toLocaleString("pt-BR")},${centavos.slice(-2)}`;
}

/** Converte o preço mascarado ("1.250,00") para número (1250). */
export function precoParaNumero(valorMascarado: string): number {
  const numeros = valorMascarado.replace(/\D/g, "");
  return numeros ? Number(numeros) / 100 : 0;
}

/** Converte o número vindo da API (80) para o formato do input ("80,00"). */
export function numeroParaPreco(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Conta quantos dígitos existem antes de uma posição do texto. */
export function contarDigitos(valor: string): number {
  return (valor.match(/\d/g) ?? []).length;
}

/**
 * Dado o telefone já mascarado, encontra a posição do cursor logo após
 * o N-ésimo dígito. Usado para manter o cursor no lugar certo quando o
 * usuário digita/apaga no meio do número (sem isso, o cursor "pula"
 * pro final toda vez que a máscara é recalculada).
 */
export function posicaoAposNDigitos(mascarado: string, n: number): number {
  if (n <= 0) {
    const indice = mascarado.search(/\d/);
    return indice === -1 ? mascarado.length : indice;
  }
  let contagem = 0;
  for (let i = 0; i < mascarado.length; i++) {
    if (/\d/.test(mascarado[i])) {
      contagem++;
      if (contagem === n) return i + 1;
    }
  }
  return mascarado.length;
}

/** Remove números e símbolos, mantendo apenas letras (com acento), espaço, hífen e apóstrofo. */
export function sanitizarNome(valor: string): string {
  return valor.replace(/[^\p{L}\s'-]/gu, "");
}

// Detecta URLs (http/https/www) e domínios "soltos" tipo instagram.com/fulano
const LINK_REGEX =
  /\b((https?:\/\/|www\.)\S+|\S+\.(com|com\.br|net|org|io|co|app|dev|xyz|info|link|shop|store|me|gg)(\/\S*)?)\b/gi;

/** Remove qualquer link/URL do texto. */
export function removerLinks(texto: string): string {
  return texto.replace(LINK_REGEX, "").replace(/\s{2,}/g, " ");
}

/** Aplica remoção de links e limite de caracteres na observação do cliente. */
export function sanitizarObservacao(valor: string): string {
  return removerLinks(valor).slice(0, OBSERVACAO_MAX_LENGTH);
}

export function validarEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function validarTelefone(telefone: string): boolean {
  return TELEFONE_REGEX.test(telefone.trim());
}

export function validarNomeCompleto(nome: string): boolean {
  const partes = nome.trim().split(/\s+/).filter((parte) => parte.length >= 2);
  return partes.length >= 2;
}

/**
 * Valida o formulário inteiro e retorna as mensagens de erro por campo.
 * Objeto vazio = formulário válido.
 */
export function validarFormulario(dados: DadosCliente): CamposInvalidos {
  const erros: CamposInvalidos = {};

  if (!dados.nomeCompleto.trim()) {
    erros.nomeCompleto = "Informe seu nome completo.";
  } else if (!validarNomeCompleto(dados.nomeCompleto)) {
    erros.nomeCompleto = "Informe nome e sobrenome.";
  }

  if (!dados.email.trim()) {
    erros.email = "Informe seu e-mail.";
  } else if (!validarEmail(dados.email)) {
    erros.email = "E-mail inválido.";
  }

  if (!dados.telefone.trim()) {
    erros.telefone = "Informe seu telefone/WhatsApp.";
  } else if (!validarTelefone(dados.telefone)) {
    erros.telefone = "Use o formato (ddd) 9xxxx-xxxx.";
  }

  return erros;
}