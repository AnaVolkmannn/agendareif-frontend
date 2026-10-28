"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Circle, CircleCheck, Eye, EyeOff, Loader2, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/auth/AuthContext";
import { ApiError } from "@/lib/api/client";
import { requisitosDaSenha, senhaValida } from "@/lib/validations";

function mensagemDeErro(err: unknown, pediuSenhaProvisoria: boolean): string {
  if (err instanceof ApiError) {
    // A API lança IllegalArgumentException("Senha atual incorreta") sem nenhum
    // @ControllerAdvice para tratá-la, então o Spring cai no /error e, por a
    // sessão ser STATELESS, devolve 403 de corpo vazio. Aqui isso só pode ser
    // a senha provisória recusada: o id enviado é o do próprio usuário.
    if (err.status === 403)
      return pediuSenhaProvisoria
        ? "Senha provisória incorreta. Confira a senha enviada no e-mail."
        : "Não foi possível confirmar seu acesso. Faça login novamente.";
    return err.message;
  }
  // fetch lança TypeError quando a API está fora do ar ou o CORS bloqueou
  return "Não foi possível conectar ao servidor. Tente novamente.";
}

interface CampoSenhaProps {
  id: string;
  label: string;
  value: string;
  onChange: (valor: string) => void;
  autoComplete: string;
  invalido?: boolean;
}

function CampoSenha({
  id,
  label,
  value,
  onChange,
  autoComplete,
  invalido,
}: CampoSenhaProps) {
  const [visivel, setVisivel] = useState(false);

  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </Label>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />
        <Input
          id={id}
          type={visivel ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder="••••••••"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={invalido}
          className="h-12 rounded-xl border-transparent bg-card px-9 shadow-sm"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setVisivel((atual) => !atual)}
          aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
          className="absolute right-2 top-1/2 size-7 -translate-y-1/2 text-neutral-500 hover:bg-transparent hover:text-neutral-700"
        >
          {visivel ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </Button>
      </div>
    </div>
  );
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const { changePassword, temSenhaEmMemoria } = useAuth();

  const [senhaProvisoria, setSenhaProvisoria] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  // No fluxo normal a senha provisória veio do login e não é pedida de novo.
  // Depois de um F5 ela se perde da memória, e aí o campo precisa aparecer.
  const pedirSenhaProvisoria = !temSenhaEmMemoria;

  const requisitos = requisitosDaSenha(novaSenha, confirmacao);
  const podeSalvar =
    (!pedirSenhaProvisoria || !!senhaProvisoria) &&
    senhaValida(novaSenha, confirmacao) &&
    !salvando;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!podeSalvar) return;

    setErro(null);
    setSalvando(true);

    try {
      // null = usa a senha que o AuthContext guardou no login
      await changePassword(
        pedirSenhaProvisoria ? senhaProvisoria : null,
        novaSenha,
      );
      router.replace("/pages/professional/dashboard");
    } catch (err) {
      setErro(mensagemDeErro(err, pedirSenhaProvisoria));
      setSalvando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-10 text-foreground">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="font-barbra text-5xl text-primary">Reif</h1>
          <p className="font-barbra text-sm tracking-widest">BEAUTY STUDIO</p>
        </div>

        <div className="mb-5 flex flex-col items-center text-center">
          <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-primary/15">
            <Lock className="size-8 text-primary" />
          </div>
          <h2 className="font-glacial text-xl font-extrabold">
            Primeiro acesso
          </h2>
          <p className="mt-1 text-[13px] leading-snug text-foreground/70">
            Por segurança, crie uma senha nova para substituir a senha
            provisória enviada no e-mail cadastrado.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {pedirSenhaProvisoria && (
            <CampoSenha
              id="senha-provisoria"
              label="Senha provisória"
              value={senhaProvisoria}
              onChange={setSenhaProvisoria}
              autoComplete="current-password"
              invalido={!!erro}
            />
          )}
          <CampoSenha
            id="nova-senha"
            label="Nova senha"
            value={novaSenha}
            onChange={setNovaSenha}
            autoComplete="new-password"
          />
          <CampoSenha
            id="confirmar-senha"
            label="Confirmar nova senha"
            value={confirmacao}
            onChange={setConfirmacao}
            autoComplete="new-password"
          />
        </div>

        <ul className="mt-4 flex flex-col gap-2">
          {requisitos.map((requisito) => (
            <li
              key={requisito.id}
              className={`flex items-center gap-2 text-sm ${
                requisito.atendido ? "text-green-600" : "text-muted-foreground"
              }`}
            >
              {requisito.atendido ? (
                <CircleCheck
                  aria-hidden
                  className="size-5 shrink-0 fill-green-600 stroke-background"
                />
              ) : (
                <Circle
                  aria-hidden
                  className="size-5 shrink-0 fill-neutral-200 stroke-neutral-200"
                />
              )}
              {requisito.label}
            </li>
          ))}
        </ul>

        {erro && (
          <p className="mt-4 text-[13px] text-destructive" role="alert">
            {erro}
          </p>
        )}

        <Button
          type="submit"
          disabled={!podeSalvar}
          className="mt-6 h-12 w-full gap-2 rounded-xl text-[15px] font-semibold"
        >
          {salvando ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Salvando…
            </>
          ) : (
            "Salvar"
          )}
        </Button>
      </form>
    </main>
  );
}
