"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { autenticar } from "@/lib/api/auth";
import { validarEmail } from "@/lib/validations";

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
          <h1 className="font-barbra text-5xl text-primary">Reif</h1>
          <p className="font-barbra text-sm tracking-widest">BEAUTY STUDIO</p>
        </div>

        <h2 className="font-glacial text-xl font-extrabold">Bem-vindo(a)!</h2>
        <p className="mb-6 text-[13px] text-foreground/70">
          Faça login para ter acesso ao seu espaço
        </p>

        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="email" className="mb-1.5 block text-sm font-semibold">
              E-mail
            </Label>
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
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="senha" className="mb-1.5 block text-sm font-semibold">
              Senha
            </Label>
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
                className="px-9"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setMostrarSenha((atual) => !atual)}
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                className="absolute right-1 top-1/2 size-7 -translate-y-1/2 text-neutral-500 hover:bg-transparent hover:text-neutral-700"
              >
                {mostrarSenha ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
            </div>
            <div className="mt-1.5 text-right">
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-xs text-foreground/60"
              >
                Esqueci minha senha
              </Button>
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