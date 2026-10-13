const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
}

export async function api<T = unknown>(
  path: string,
  { method = "GET", body, auth = true }: ApiOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null as T;

  const data = await res.json().catch(() => null);

  // token expirado ou inválido: limpa a sessão e volta para o login
  if (res.status === 401 && auth && typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("session");
    window.location.href = "/login";
  }

  if (!res.ok)
    throw new ApiError(res.status, data?.message ?? "Erro inesperado");
  return data as T;
}
