/**
 * Os telefones chegam do banco em formatos diferentes: uns já com o código do
 * país ("5547999990003"), outros só com DDD + número ("47999999999"), e podem
 * vir mascarados ("(47) 99999-9999"). O link do wa.me exige o número completo
 * com código do país — mandar "47999999999" faria o WhatsApp ler o 47 como
 * Noruega e abrir uma conversa com o número errado.
 */

/** Pega só os dígitos, descartando máscara, espaços e o "+". */
const SOMENTE_DIGITOS = /\D/g;

/** 55 + DDD (2) + número (8 ou 9) = 12 ou 13 dígitos. */
const COM_CODIGO_PAIS = /^55\d{2}9?\d{8}$/;

/** DDD (2) + número (8 ou 9) = 10 ou 11 dígitos. */
const SEM_CODIGO_PAIS = /^\d{2}9?\d{8}$/;

/**
 * Normaliza para o formato que o wa.me espera (55DDDNÚMERO).
 * Devolve null quando o número não dá para aproveitar, para a interface
 * poder esconder o botão em vez de abrir um link quebrado.
 */
export function normalizarTelefoneWhatsapp(telefone: string): string | null {
  const digitos = telefone.replace(SOMENTE_DIGITOS, "");

  if (COM_CODIGO_PAIS.test(digitos)) return digitos;
  if (SEM_CODIGO_PAIS.test(digitos)) return `55${digitos}`;

  return null;
}

/** Link de conversa no WhatsApp, ou null se o telefone não for utilizável. */
export function linkWhatsapp(telefone: string | null | undefined): string | null {
  if (!telefone) return null;

  const numero = normalizarTelefoneWhatsapp(telefone);
  return numero ? `https://wa.me/${numero}` : null;
}
