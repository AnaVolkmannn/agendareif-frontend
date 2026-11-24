"use client";

import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CircleCheck,
  KeyRound,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordField } from "@/components/sections/password-reset/password-field";
import { PasswordRequirements } from "@/components/sections/password-reset/password-requirements";
import { ApiError } from "@/lib/api/client";
import {
  CODIGO_MOCK,
  modoSimulado,
  redefinirSenha,
  solicitarCodigoRedefinicao,
  verificarCodigoRedefinicao,
} from "@/lib/api/password-reset";
import {
  requisitosDaSenha,
  senhaValida,
  validarEmail,
} from "@/lib/validations";

type Etapa = "email" | "codigo" | "senha" | "sucesso";

const TAMANHO_CODIGO = 6;
const ESPERA_REENVIO_SEGUNDOS = 60;
const ROTA_LOGIN = "/pages/login";

type Contexto = "envio" | "codigo" | "senha";

function mensagemDeErro(err: unknown, contexto: Contexto): string {
  if (err instanceof ApiError) {
    if (err.status === 404 || err.status === 405)
      return "A redefinição de senha ainda não está disponível no servidor.";
    if (err.status === 429)
      return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
    if ((err.status === 400 || err.status === 403) && contexto !== "envio")
      return "Código inválido ou expirado. Confira o e-mail ou peça um novo código.";
    if (err.status === 400 && contexto === "envio")
      return "Informe um e-mail válido.";
    return err.message;
  }
  return "Não foi possível conectar ao servidor. Tente novamente.";
}

function IconeEtapa({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-primary/15">
      {children}
    </div>
  );
}

function Progresso({ etapaAtual }: { etapaAtual: 1 | 2 | 3 }) {
  return (
    <div
      className="mb-6 flex items-center gap-2"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={3}
      aria-valuenow={etapaAtual}
      aria-label={`Etapa ${etapaAtual} de 3`}
    >
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            n <= etapaAtual ? "bg-primary" : "bg-primary/20"
          }`}
        />
      ))}
    </div>
  );
}

function formatarTempo(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function mascararEmail(email: string): string {
  const [usuario, dominio] = email.trim().split("@");
  if (!dominio) return email;
  const visivel = usuario.slice(0, Math.min(2, usuario.length));
  return `${visivel}***@${dominio}`;
}

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [etapa, setEtapa] = useState<Etapa>("email");
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [esperaReenvio, setEsperaReenvio] = useState(0);

  useEffect(() => {
    if (esperaReenvio <= 0) return;
    const timer = setTimeout(() => setEsperaReenvio((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [esperaReenvio]);

  const requisitos = requisitosDaSenha(novaSenha, confirmacao);
  const codigoCompleto = codigo.length === TAMANHO_CODIGO;

  async function enviarCodigo(): Promise<boolean> {
    setErro(null);
    setAviso(null);
    setCarregando(true);
    try {
      await solicitarCodigoRedefinicao(email);
      setEsperaReenvio(ESPERA_REENVIO_SEGUNDOS);
      return true;
    } catch (err) {
      setErro(mensagemDeErro(err, "envio"));
      return false;
    } finally {
      setCarregando(false);
    }
  }

  async function handleEnviarEmail(event: FormEvent) {
    event.preventDefault();
    if (!validarEmail(email)) {
      setErro("Informe um e-mail válido.");
      return;
    }
    if (await enviarCodigo()) {
      setCodigo("");
      setEtapa("codigo");
    }
  }

  async function handleReenviar() {
    if (esperaReenvio > 0 || carregando) return;
    if (await enviarCodigo()) {
      setCodigo("");
      setAviso("Enviamos um novo código. O anterior deixa de valer.");
    }
  }

  async function handleVerificarCodigo(event: FormEvent) {
    event.preventDefault();
    if (!codigoCompleto || carregando) return;

    setErro(null);
    setAviso(null);
    setCarregando(true);
    try {
      await verificarCodigoRedefinicao(email, codigo);
      setEtapa("senha");
    } catch (err) {
      setErro(mensagemDeErro(err, "codigo"));
    } finally {
      setCarregando(false);
    }
  }

  async function handleRedefinir(event: FormEvent) {
    event.preventDefault();
    if (!senhaValida(novaSenha, confirmacao) || carregando) return;

    setErro(null);
    setCarregando(true);
    try {
      await redefinirSenha(email, codigo, novaSenha);
      setNovaSenha("");
      setConfirmacao("");
      setCodigo("");
      setEtapa("sucesso");
    } catch (err) {
      setErro(mensagemDeErro(err, "senha"));
    } finally {
      setCarregando(false);
    }
  }

  function voltarEtapa() {
    setErro(null);
    setAviso(null);
    if (etapa === "codigo") setEtapa("email");
    else if (etapa === "senha") setEtapa("codigo");
    else router.push(ROTA_LOGIN);
  }

  const botaoPrincipal = (texto: string, textoCarregando: string, desabilitado: boolean) => (
    <Button
      type="submit"
      disabled={desabilitado || carregando}
      className="mt-6 h-12 w-full gap-2 rounded-xl text-[15px] font-semibold"
    >
      {carregando ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          {textoCarregando}
        </>
      ) : (
        texto
      )}
    </Button>
  );

  const mensagens = (
    <>
      {aviso && !erro && (
        <p className="mt-4 text-[13px] text-green-600 dark:text-green-500" role="status">
          {aviso}
        </p>
      )}
      {erro && (
        <p className="mt-4 text-[13px] text-destructive" role="alert">
          {erro}
        </p>
      )}
    </>
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-10 text-foreground">
      <div className="w-full max-w-sm">
        {etapa !== "sucesso" && (
          <Button
            type="button"
            variant="ghost"
            onClick={voltarEtapa}
            className="-ml-3 mb-2 h-9 gap-1.5 px-3 text-sm text-foreground/70 hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            {etapa === "email" ? "Voltar para o login" : "Voltar"}
          </Button>
        )}

        <div className="mb-6 text-center">
          <h1 className="font-barbra text-5xl text-primary">Reif</h1>
          <p className="font-barbra text-sm tracking-widest">BEAUTY STUDIO</p>
        </div>

        {etapa !== "sucesso" && (
          <Progresso
            etapaAtual={etapa === "email" ? 1 : etapa === "codigo" ? 2 : 3}
          />
        )}

        {etapa === "email" && (
          <form onSubmit={handleEnviarEmail} noValidate>
            <div className="mb-5 flex flex-col items-center text-center">
              <IconeEtapa>
                <Mail className="size-8 text-primary" />
              </IconeEtapa>
              <h2 className="font-glacial text-xl font-extrabold">
                Redefinir senha do administrador
              </h2>
              <p className="mt-1 text-[13px] leading-snug text-foreground/70">
                Informe o e-mail de acesso do administrador. Vamos enviar um
                código de verificação para ele.
              </p>
            </div>

            <div>
              <Label htmlFor="email" className="mb-1.5 block text-sm font-semibold">
                E-mail do administrador
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="admin@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-invalid={!!erro}
                  className="h-12 rounded-xl border-transparent bg-card pl-9 shadow-sm"
                />
              </div>
            </div>

            {mensagens}
            {botaoPrincipal("Enviar código", "Enviando…", !email.trim())}

          </form>
        )}

        {etapa === "codigo" && (
          <form onSubmit={handleVerificarCodigo} noValidate>
            <div className="mb-5 flex flex-col items-center text-center">
              <IconeEtapa>
                <KeyRound className="size-8 text-primary" />
              </IconeEtapa>
              <h2 className="font-glacial text-xl font-extrabold">
                Verifique seu e-mail
              </h2>
              <p className="mt-1 text-[13px] leading-snug text-foreground/70">
                Se <span className="font-semibold break-all text-foreground">{mascararEmail(email)}</span>{" "}
                for o e-mail do administrador, você vai receber um código de{" "}
                {TAMANHO_CODIGO} dígitos. Confira também a caixa de spam.
              </p>
            </div>

            <div>
              <Label htmlFor="codigo" className="mb-1.5 block text-sm font-semibold">
                Código de verificação
              </Label>
              <Input
                id="codigo"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                maxLength={TAMANHO_CODIGO}
                placeholder={"0".repeat(TAMANHO_CODIGO)}
                value={codigo}
                onChange={(event) =>
                  setCodigo(event.target.value.replace(/\D/g, "").slice(0, TAMANHO_CODIGO))
                }
                aria-invalid={!!erro}
                className="h-14 rounded-xl border-transparent bg-card text-center font-mono text-2xl tracking-[0.5em] md:text-2xl shadow-sm placeholder:text-foreground/20"
              />
            </div>

            {modoSimulado && (
              <p className="mt-2 text-center text-xs text-foreground/50">
                Modo simulado: use o código {CODIGO_MOCK}
              </p>
            )}

            {mensagens}
            {botaoPrincipal("Continuar", "Verificando…", !codigoCompleto)}

            <div className="mt-4 text-center text-[13px] text-foreground/70">
              Não recebeu?{" "}
              {esperaReenvio > 0 ? (
                <span className="tabular-nums">
                  Reenviar em {formatarTempo(esperaReenvio)}
                </span>
              ) : (
                <Button
                  type="button"
                  variant="link"
                  onClick={handleReenviar}
                  disabled={carregando}
                  className="h-auto p-0 text-[13px] font-semibold"
                >
                  Reenviar código
                </Button>
              )}
            </div>
          </form>
        )}

        {etapa === "senha" && (
          <form onSubmit={handleRedefinir} noValidate>
            <div className="mb-5 flex flex-col items-center text-center">
              <IconeEtapa>
                <Lock className="size-8 text-primary" />
              </IconeEtapa>
              <h2 className="font-glacial text-xl font-extrabold">
                Nova senha do administrador
              </h2>
              <p className="mt-1 text-[13px] leading-snug text-foreground/70">
                A nova senha substitui a anterior e passa a valer no próximo
                login.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <PasswordField
                id="nova-senha"
                label="Nova senha"
                value={novaSenha}
                onChange={setNovaSenha}
                autoComplete="new-password"
                autoFocus
              />
              <PasswordField
                id="confirmar-senha"
                label="Confirmar nova senha"
                value={confirmacao}
                onChange={setConfirmacao}
                autoComplete="new-password"
              />
            </div>

            <PasswordRequirements requisitos={requisitos} />

            {mensagens}
            {botaoPrincipal(
              "Redefinir senha",
              "Salvando…",
              !senhaValida(novaSenha, confirmacao),
            )}
          </form>
        )}

        {etapa === "sucesso" && (
          <div className="flex flex-col items-center text-center">
            <IconeEtapa>
              <CircleCheck className="size-9 text-primary" />
            </IconeEtapa>
            <h2 className="font-glacial text-xl font-extrabold">
              Senha redefinida!
            </h2>
            <p className="mt-1 text-[13px] leading-snug text-foreground/70">
              A senha do administrador foi alterada. Agora é só entrar com o
              e-mail do administrador e a nova senha.
            </p>
            <Button
              type="button"
              onClick={() => router.replace(ROTA_LOGIN)}
              className="mt-6 h-12 w-full rounded-xl text-[15px] font-semibold"
            >
              Ir para o login
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
