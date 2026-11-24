import { api, ApiError } from "@/lib/api/client";

const USAR_MOCK = process.env.NEXT_PUBLIC_MOCK_RESET_SENHA === "true";
export const CODIGO_MOCK = "123456";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const modoSimulado = USAR_MOCK;

export async function solicitarCodigoRedefinicao(email: string): Promise<void> {
  if (USAR_MOCK) {
    await delay(700);
    return;
  }
  await api<void>("/auth/admin/forgot-password", {
    method: "POST",
    body: { email: email.trim().toLowerCase() },
    auth: false,
  });
}

export async function verificarCodigoRedefinicao(
  email: string,
  code: string,
): Promise<void> {
  if (USAR_MOCK) {
    await delay(600);
    if (code !== CODIGO_MOCK) throw new ApiError("Código inválido ou expirado.", 400);
    return;
  }
  await api<void>("/auth/admin/verify-reset-code", {
    method: "POST",
    body: { email: email.trim().toLowerCase(), code },
    auth: false,
  });
}

export async function redefinirSenha(
  email: string,
  code: string,
  newPassword: string,
): Promise<void> {
  if (USAR_MOCK) {
    await delay(800);
    if (code !== CODIGO_MOCK) throw new ApiError("Código inválido ou expirado.", 400);
    return;
  }
  await api<void>("/auth/admin/reset-password", {
    method: "POST",
    body: { email: email.trim().toLowerCase(), code, newPassword },
    auth: false,
  });
}
