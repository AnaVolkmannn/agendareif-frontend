"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import { Check, Copy, KeyRound, Loader2, Mail, Phone } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AvatarUploadField } from "@/components/sections/manage-professionals/avatar-upload-field";
import {
  mascararTelefone,
  validarEmail,
  validarTelefone,
} from "@/lib/validations";
import { criarProfissional } from "@/lib/api/profissionais";
import type { Profissional } from "@/types/profissional";

interface CreateProfessionalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCriado: (profissional: Profissional) => void;
}

interface Erros {
  nome?: string;
  email?: string;
  whatsapp?: string;
}

const FIELD_CLASSES =
  "rounded-lg border-secondary/25 bg-rose-50 text-neutral-900 placeholder:text-neutral-500";

export function CreateProfessionalDialog({
  open,
  onOpenChange,
  onCriado,
}: CreateProfessionalDialogProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [descricao, setDescricao] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [erros, setErros] = useState<Erros>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  // Depois do cadastro, o dialog mostra a senha provisória (só existe nesta
  // resposta da API) em vez de fechar direto.
  const [senhaTemporaria, setSenhaTemporaria] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  function handleWhatsappChange(event: ChangeEvent<HTMLInputElement>) {
    setWhatsapp(mascararTelefone(event.target.value));
  }

  function validar(): boolean {
    const novosErros: Erros = {};
    if (!nome.trim()) novosErros.nome = "Informe o nome do profissional.";
    if (!email.trim()) novosErros.email = "Informe o e-mail.";
    else if (!validarEmail(email)) novosErros.email = "E-mail inválido.";
    if (!whatsapp.trim()) novosErros.whatsapp = "Informe o WhatsApp.";
    else if (!validarTelefone(whatsapp))
      novosErros.whatsapp = "Use o formato (ddd) 9xxxx-xxxx.";

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function handleSalvar() {
    if (!validar()) return;

    setErroGeral(null);
    setSalvando(true);
    try {
      const { profissional, senhaTemporaria } = await criarProfissional({
        nome,
        email,
        whatsapp,
        descricao,
        foto,
      });
      onCriado(profissional);
      setSenhaTemporaria(senhaTemporaria);
    } catch (erro) {
      setErroGeral(
        erro instanceof Error
          ? erro.message
          : "Não foi possível cadastrar o profissional. Tente novamente.",
      );
    } finally {
      setSalvando(false);
    }
  }

  function resetForm() {
    setNome("");
    setEmail("");
    setWhatsapp("");
    setDescricao("");
    setFoto(null);
    setErros({});
    setErroGeral(null);
    setSenhaTemporaria(null);
    setCopiado(false);
  }

  async function handleCopiarSenha() {
    if (!senhaTemporaria) return;
    try {
      await navigator.clipboard.writeText(senhaTemporaria);
      setCopiado(true);
    } catch {
      // sem permissão de área de transferência: a senha continua visível na tela
    }
  }

  function handleConcluir() {
    resetForm();
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(novoEstado) => {
        if (!novoEstado) resetForm();
        onOpenChange(novoEstado);
      }}
    >
      <DialogContent>
        {senhaTemporaria ? (
          <>
            <DialogHeader>
              <DialogTitle>Profissional cadastrado</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Envie esta senha provisória para{" "}
                <strong className="text-foreground">{email.trim()}</strong>. No
                primeiro acesso, o profissional entra com ela e cria a própria
                senha.
              </p>

              <div className="flex items-center gap-2 rounded-lg border border-secondary/25 bg-rose-50 px-3.5 py-3 text-neutral-900">
                <KeyRound className="size-4 shrink-0 text-neutral-500" />
                <code className="flex-1 select-all font-mono text-base tracking-wide">
                  {senhaTemporaria}
                </code>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleCopiarSenha}
                  aria-label="Copiar senha provisória"
                  className="text-neutral-600 hover:text-neutral-900"
                >
                  {copiado ? <Check className="size-4" /> : <Copy className="size-4" />}
                </Button>
              </div>

              <p className="text-[13px] text-destructive">
                Anote ou copie agora: essa senha não pode ser consultada depois.
              </p>
            </div>

            <Button
              type="button"
              onClick={handleConcluir}
              className="mt-6 h-11 w-full rounded-xl text-[15px] font-semibold"
            >
              Concluir
            </Button>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Cadastrar novo profissional</DialogTitle>
            </DialogHeader>

            <AvatarUploadField onFotoChange={setFoto} />

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="create-nome">Nome do profissional</Label>
                <Input
                  id="create-nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  aria-invalid={!!erros.nome}
                  className={FIELD_CLASSES}
                />
                {erros.nome && (
                  <p className="text-xs text-destructive" role="alert">
                    {erros.nome}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="create-email">E-mail</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />
                  <Input
                    id="create-email"
                    type="email"
                    inputMode="email"
                    placeholder="malu.oliveira@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={!!erros.email}
                    className={`${FIELD_CLASSES} pl-10`}
                  />
                </div>
                {erros.email && (
                  <p className="text-xs text-destructive" role="alert">
                    {erros.email}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="create-whatsapp">Whatsapp</Label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />
                  <Input
                    id="create-whatsapp"
                    inputMode="numeric"
                    placeholder="(47) 99999-9999"
                    value={whatsapp}
                    onChange={handleWhatsappChange}
                    aria-invalid={!!erros.whatsapp}
                    className={`${FIELD_CLASSES} pl-10`}
                  />
                </div>
                {erros.whatsapp && (
                  <p className="text-xs text-destructive" role="alert">
                    {erros.whatsapp}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="create-descricao">Descrição</Label>
                  <span className="text-[12px] text-muted-foreground">
                    {descricao.length}/500
                  </span>
                </div>
                <Textarea
                  id="create-descricao"
                  rows={3}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value.slice(0, 500))}
                  maxLength={500}
                  placeholder="Ex.: Especialista em nail art, manicure e pedicure. Com experiência em..."
                  className={FIELD_CLASSES}
                />
              </div>
            </div>

            {erroGeral && (
              <p className="mt-3 text-[13px] text-destructive" role="alert">
                {erroGeral}
              </p>
            )}

            <Button
              type="button"
              onClick={handleSalvar}
              disabled={salvando}
              className="mt-6 h-11 w-full gap-2 rounded-xl text-[15px] font-semibold"
            >
              {salvando ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Cadastrando…
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
