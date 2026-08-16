import type { CamposInvalidos, DadosCliente } from "@/types/agendamento";

// Aceita apenas o formato (ddd) 9xxxx-xxxx, ex: (47) 99999-9999
const TELEFONE_REGEX = /^\(\d{2}\) 9\d{4}-\d{4}$/;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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