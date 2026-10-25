"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Loader2 } from "lucide-react";

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ProfileAvatarField } from "@/components/sections/professional-profile/profile-avatar-field";
import { ApiError } from "@/lib/api/client";
import { atualizarPerfilLogado, getPerfilLogado } from "@/lib/api/perfil";
import {
  contarDigitos,
  mascararTelefone,
  posicaoAposNDigitos,
  validarEmail,
  validarTelefone,
} from "@/lib/validations";
import type { Profissional } from "@/types/profissional";

/** Remove o DDI (55) do whatsapp salvo e aplica a máscara (ddd) 9xxxx-xxxx. */
function digitosParaTelefoneMascarado(digitos: string): string {
  const semDdi = digitos.length > 11 ? digitos.slice(-11) : digitos;
  return mascararTelefone(semDdi);
}

type StatusPerfil = "loading" | "success" | "error";

export default function ProfilePage() {
  const router = useRouter();
  const { logout, session, changePassword } = useAuth();
  const professionalId = session?.id;

  const whatsappRef = useRef<HTMLInputElement>(null);
  const cursorDesejadoRef = useRef<number | null>(null);

  const [status, setStatus] = useState<StatusPerfil>("loading");
  const [perfil, setPerfil] = useState<Profissional | null>(null);
  const [aceitaOnline, setAceitaOnline] = useState(true);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [descricao, setDescricao] = useState("");

  const [erroDados, setErroDados] = useState<string | null>(null);
  const [salvandoDados, setSalvandoDados] = useState(false);
  const [dadosSalvos, setDadosSalvos] = useState(false);

  const [senhaAberta, setSenhaAberta] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [erroSenha, setErroSenha] = useState<string | null>(null);
  const [alterandoSenha, setAlterandoSenha] = useState(false);
  const [senhaAlterada, setSenhaAlterada] = useState(false);

  // Depende só do id (e não do objeto session): o changePassword troca a
  // sessão e, com [session], o perfil recarregaria apagando o que está na tela.
  useEffect(() => {
    if (professionalId === undefined) return;

    let ativo = true;
    getPerfilLogado(professionalId)
      .then((dados) => {
        if (!ativo) return;
        setPerfil(dados);
        setNome(dados.nome);
        setEmail(dados.email ?? "");
        setWhatsapp(digitosParaTelefoneMascarado(dados.whatsapp));
        setDescricao(dados.especialidade);
        setAceitaOnline(dados.modoAgendamento !== "MANUAL");
        setStatus("success");
      })
      .catch(() => {
        if (!ativo) return;
        setStatus("error");
      });
    return () => {
      ativo = false;
    };
  }, [professionalId]);

  function handleWhatsappChange(event: ChangeEvent<HTMLInputElement>) {
    const elemento = event.target;
    const cursorAtual = elemento.selectionStart ?? elemento.value.length;
    const digitosAntesDoCursor = contarDigitos(
      elemento.value.slice(0, cursorAtual),
    );

    const mascarado = mascararTelefone(elemento.value);
    cursorDesejadoRef.current = posicaoAposNDigitos(
      mascarado,
      digitosAntesDoCursor,
    );

    setWhatsapp(mascarado);
  }

  useEffect(() => {
    if (cursorDesejadoRef.current !== null && whatsappRef.current) {
      const posicao = cursorDesejadoRef.current;
      whatsappRef.current.setSelectionRange(posicao, posicao);
      cursorDesejadoRef.current = null;
    }
  }, [whatsapp]);

  async function handleSalvarDados() {
    if (professionalId === undefined || !perfil) return;

    if (!nome.trim()) {
      setErroDados("Informe seu nome completo.");
      return;
    }
    if (!validarEmail(email)) {
      setErroDados("Informe um e-mail válido.");
      return;
    }
    if (!validarTelefone(whatsapp)) {
      setErroDados("Use o formato (ddd) 9xxxx-xxxx no Whatsapp.");
      return;
    }

    setErroDados(null);
    setDadosSalvos(false);
    setSalvandoDados(true);
    try {
      const atualizado = await atualizarPerfilLogado(professionalId, {
        nome,
        email,
        whatsapp,
        descricao,
        modoAgendamento: aceitaOnline ? "ONLINE" : "MANUAL",
        foto,
        fotoUrlAtual: perfil.fotoUrl,
      });
      setPerfil(atualizado);
      setFoto(null);
      setDadosSalvos(true);
    } catch (err) {
      setErroDados(
        err instanceof ApiError
          ? err.message
          : "Não foi possível salvar as alterações. Tente novamente.",
      );
    } finally {
      setSalvandoDados(false);
    }
  }

  async function handleConfirmarSenha() {
    if (!senhaAtual) {
      setErroSenha("Informe sua senha atual.");
      return;
    }
    if (novaSenha.length < 8) {
      setErroSenha("A nova senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    setErroSenha(null);
    setSenhaAlterada(false);
    setAlterandoSenha(true);
    try {
      await changePassword(senhaAtual, novaSenha);
      setSenhaAlterada(true);
      setSenhaAtual("");
      setNovaSenha("");
    } catch (err) {
      setErroSenha(
        err instanceof ApiError
          ? err.message
          : "Não foi possível alterar a senha. Tente novamente.",
      );
    } finally {
      setAlterandoSenha(false);
    }
  }

  function handleSenhaKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleConfirmarSenha();
    }
  }

  function handleSairDaConta() {
    logout();
    router.push("/pages/login");
  }

  return (
    <SidebarInset>
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/95 px-4 pb-3 pt-4 backdrop-blur supports-backdrop-filter:bg-background/80 md:px-8">
        <div className="relative flex items-center justify-center">
          <SidebarTrigger className="absolute left-0 size-9 shrink-0 md:hidden" />
          <h1 className="text-center font-glacial text-2xl font-extrabold md:text-3xl">
            Meu perfil
          </h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-sm px-4 py-6 md:py-10">
        {status === "loading" && (
          <p
            className="text-center text-sm text-muted-foreground"
            role="status"
          >
            Carregando perfil…
          </p>
        )}

        {status === "error" && (
          <p className="text-center text-sm text-destructive" role="alert">
            Não foi possível carregar seu perfil agora. Tente novamente em
            instantes.
          </p>
        )}

        {status === "success" && perfil && (
          <>
            <div className="flex flex-col items-center gap-3 text-center">
              <ProfileAvatarField
                fotoUrlInicial={perfil.fotoUrl}
                onFotoChange={setFoto}
                onErro={setErroDados}
              />
              <div>
                <p className="font-semibold text-foreground">{perfil.nome}</p>
                <p className="text-[13px] text-muted-foreground">
                  Reif Beauty Studio
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="perfil-nome">Nome completo</Label>
                <Input
                  id="perfil-nome"
                  autoComplete="name"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  aria-invalid={!!erroDados && !nome.trim()}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="perfil-email">E-mail</Label>
                <Input
                  id="perfil-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!erroDados && !validarEmail(email)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="perfil-whatsapp">Whatsapp</Label>
                <Input
                  id="perfil-whatsapp"
                  ref={whatsappRef}
                  inputMode="numeric"
                  autoComplete="tel"
                  value={whatsapp}
                  onChange={handleWhatsappChange}
                  aria-invalid={!!erroDados && !validarTelefone(whatsapp)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="perfil-descricao">
                    Descrição dos meus serviços
                  </Label>
                  <span className="text-[12px] text-muted-foreground">
                    {descricao.length}/500
                  </span>
                </div>
                <Textarea
                  id="perfil-descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value.slice(0, 500))}
                  maxLength={500}
                  rows={3}
                  className="resize-none rounded-xl"
                  placeholder="Ex.: Especialista em nail art, manicure e pedicure. Com experiência em..."
                  aria-invalid={!!erroDados && descricao.length > 500}
                />
              </div>

              <div className="flex items-start justify-between gap-4 rounded-xl border border-border/60 bg-card px-4 py-3">
                <div className="min-w-0">
                  <Label htmlFor="perfil-modo-agendamento">
                    Agendamento pelo site
                  </Label>
                  <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
                    {aceitaOnline
                      ? "Os clientes escolhem dia e horário direto no site."
                      : "Ao clicar em agendar, o cliente é enviado para o seu WhatsApp."}
                  </p>
                </div>
                <Switch
                  id="perfil-modo-agendamento"
                  checked={aceitaOnline}
                  onCheckedChange={(valor) => {
                    setAceitaOnline(valor);
                    setDadosSalvos(false);
                  }}
                  className="mt-1"
                />
              </div>
            </div>

            {erroDados && (
              <p className="mt-3 text-[13px] text-destructive" role="alert">
                {erroDados}
              </p>
            )}
            {dadosSalvos && !erroDados && (
              <p className="mt-3 text-[13px] font-medium text-emerald-600 dark:text-emerald-400">
                Alterações salvas com sucesso!
              </p>
            )}

            <Button
              type="button"
              onClick={handleSalvarDados}
              disabled={salvandoDados}
              className="mt-5 h-12 w-full gap-2 rounded-xl text-[15px] font-semibold"
            >
              {salvandoDados ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Salvando…
                </>
              ) : (
                "Salvar alterações"
              )}
            </Button>

            <Collapsible
              open={senhaAberta}
              onOpenChange={setSenhaAberta}
              className="mt-6 rounded-xl border border-border/60 bg-card"
            >
              <CollapsibleTrigger className="flex h-12 w-full items-center justify-between px-4 text-[15px] font-semibold cursor-pointer">
                Mudar senha
                <ChevronDown
                  className={`size-4 text-muted-foreground transition-transform ${
                    senhaAberta ? "rotate-180" : ""
                  }`}
                />
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="flex flex-col gap-4 border-t border-border/60 p-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="perfil-senha-atual">Senha atual</Label>
                    <Input
                      id="perfil-senha-atual"
                      type="password"
                      autoComplete="current-password"
                      value={senhaAtual}
                      onChange={(e) => setSenhaAtual(e.target.value)}
                      onKeyDown={handleSenhaKeyDown}
                      aria-invalid={!!erroSenha}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="perfil-senha-nova">Nova senha</Label>
                    <Input
                      id="perfil-senha-nova"
                      type="password"
                      autoComplete="new-password"
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      onKeyDown={handleSenhaKeyDown}
                      aria-invalid={!!erroSenha}
                    />
                  </div>

                  {erroSenha && (
                    <p className="text-[13px] text-destructive" role="alert">
                      {erroSenha}
                    </p>
                  )}
                  {senhaAlterada && !erroSenha && (
                    <p className="text-[13px] font-medium text-emerald-600 dark:text-emerald-400">
                      Senha alterada com sucesso!
                    </p>
                  )}

                  <Button
                    type="button"
                    onClick={handleConfirmarSenha}
                    disabled={alterandoSenha}
                    className="h-11 w-full gap-2 rounded-xl text-[15px] font-semibold"
                  >
                    {alterandoSenha ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Confirmando…
                      </>
                    ) : (
                      "Confirmar"
                    )}
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Button
              type="button"
              variant="link"
              onClick={handleSairDaConta}
              className="mx-auto mt-6 flex h-auto w-fit items-center gap-1.5 p-0 text-[13px] font-semibold text-primary"
            >
              <LogOut className="size-3.5" />
              Sair da conta
            </Button>
          </>
        )}
      </main>
    </SidebarInset>
  );
}