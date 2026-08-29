"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { autenticar } from "@/lib/api/auth";
import { validarEmail } from "@/lib/validations";

// Mesmo padrão do formulário de confirmação: campo sempre branco,
// independente do tema, pra se destacar do fundo #FBF6F7/preto.
const CAMPO_CLASS =
  "h-12 rounded-xl border-black/10 bg-white pl-10 text-sm text-neutral-900 placeholder:text-neutral-500 dark:border-black/10 dark:bg-white dark:text-neutral-900 dark:placeholder:text-neutral-500";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!validarEmail(email)) {
      setErro("Informe um e-mail válido.");
      return;
    }

    setErro(null);
    setCarregando(true);

    const resultado = await autenticar(email, senha);

    setCarregando(false);

    if (!resultado.sucesso) {
      setErro(resultado.mensagem ?? "Não foi possível entrar. Tente novamente.");
      return;
    }

    if (resultado.papel === "admin") {
      router.push("/pages/admin/manage-professionals");
    } else {
      const params = resultado.profissionalId
        ? `?profissionalId=${resultado.profissionalId}`
        : "";
      router.push(`/pages/professional/dashboard${params}`);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-10 text-foreground">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-barbra text-5xl text-secondary">Reif</h1>
          <p className="font-barbra text-sm tracking-widest">BEAUTY STUDIO</p>
        </div>

        <h2 className="font-glacial text-xl font-extrabold">Bem-vindo(a)!!</h2>
        <p className="mb-6 text-[13px] text-foreground/70">
          Faça seu login para acessar a área de administrador
        </p>

        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">
              E-mail
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="profissional@gmail.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={!!erro}
                className={CAMPO_CLASS}
              />
            </div>
          </div>

          <div>
            <label htmlFor="senha" className="mb-1.5 block text-sm font-semibold">
              Senha
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />
              <Input
                id="senha"
                type={mostrarSenha ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                aria-invalid={!!erro}
                className={`${CAMPO_CLASS} pr-10`}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((atual) => !atual)}
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 transition hover:text-neutral-700"
              >
                {mostrarSenha ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <div className="mt-1.5 text-right">
              <button
                type="button"
                className="text-xs text-foreground/60 underline-offset-2 hover:underline"
              >
                Esqueci minha senha
              </button>
            </div>
          </div>
        </div>

        {erro && (
          <p className="mt-4 text-[13px] text-destructive" role="alert">
            {erro}
          </p>
        )}

        <Button
          type="submit"
          disabled={carregando}
          className="mt-6 h-12 w-full gap-2 rounded-xl text-[15px] font-semibold"
        >
          {carregando ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Entrando…
            </>
          ) : (
            "Entrar"
          )}
        </Button>
      </form>
    </main>
  );
}