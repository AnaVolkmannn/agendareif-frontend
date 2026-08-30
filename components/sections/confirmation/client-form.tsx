"use client";

import { useLayoutEffect, useRef } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  OBSERVACAO_MAX_LENGTH,
  contarDigitos,
  posicaoAposNDigitos,
  mascararTelefone,
} from "@/lib/validations";
import type { CamposInvalidos, DadosCliente, StatusConfirmacao } from "@/types/agendamento";

interface ClientFormProps {
  dados: DadosCliente;
  erros: CamposInvalidos;
  status: StatusConfirmacao;
  mensagemErro: string | null;
  onCampoChange: (campo: keyof DadosCliente, valor: string) => void;
  onSubmit: () => void;
}

// Os campos usam a mesma cor sempre branca, independente do tema — igual
// ao card de resumo. O components/ui/input.tsx padrão do projeto segue o
// tema (é usado em outras telas), então sobrescrevemos só aqui.
const CAMPO_CLASS =
  "h-11 rounded-xl border-black/10 bg-white px-3.5 text-sm text-neutral-900 placeholder:text-neutral-500 dark:border-black/10 dark:bg-white dark:text-neutral-900 dark:placeholder:text-neutral-500";

export function ClientForm({
  dados,
  erros,
  status,
  mensagemErro,
  onCampoChange,
  onSubmit,
}: ClientFormProps) {
  const nomeRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const telefoneRef = useRef<HTMLInputElement>(null);
  const observacaoRef = useRef<HTMLTextAreaElement>(null);

  function handleNomeKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === "ArrowDown") {
      event.preventDefault();
      emailRef.current?.focus();
    }
  }

  function handleEmailKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === "ArrowDown") {
      event.preventDefault();
      telefoneRef.current?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      nomeRef.current?.focus();
    }
  }

  function handleTelefoneKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === "ArrowDown") {
      event.preventDefault();
      observacaoRef.current?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      emailRef.current?.focus();
    }
  }

  function handleObservacaoKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Seta pra cima só "sai" do campo se o cursor já estiver na primeira
    // linha/posição — senão o usuário não conseguiria navegar dentro do texto.
    if (event.key === "ArrowUp" && event.currentTarget.selectionStart === 0) {
      event.preventDefault();
      telefoneRef.current?.focus();
    }
  }

  return (
    <div>
      <h2 className="mb-3 mt-6 font-glacial text-base font-bold">Seus Dados</h2>

      <div className="flex flex-col gap-3">
        <Campo
          inputRef={nomeRef}
          placeholder="Nome completo"
          autoComplete="name"
          value={dados.nomeCompleto}
          erro={erros.nomeCompleto}
          onChange={(valor) => onCampoChange("nomeCompleto", valor)}
          onKeyDown={handleNomeKeyDown}
        />
        <Campo
          inputRef={emailRef}
          placeholder="E-mail"
          type="email"
          autoComplete="email"
          value={dados.email}
          erro={erros.email}
          onChange={(valor) => onCampoChange("email", valor)}
          onKeyDown={handleEmailKeyDown}
        />
        <TelefoneCampo
          inputRef={telefoneRef}
          value={dados.telefone}
          erro={erros.telefone}
          onChange={(valor) => onCampoChange("telefone", valor)}
          onKeyDown={handleTelefoneKeyDown}
        />

        <div>
          <Textarea
            ref={observacaoRef}
            placeholder="Observação (opcional)"
            value={dados.observacao}
            onChange={(event) => onCampoChange("observacao", event.target.value)}
            onKeyDown={handleObservacaoKeyDown}
            rows={3}
            maxLength={OBSERVACAO_MAX_LENGTH}
          />
          <p className="mt-1 text-right text-xs text-neutral-500">
            {dados.observacao.length}/{OBSERVACAO_MAX_LENGTH}
          </p>
        </div>
      </div>

      {mensagemErro && (
        <p className="mt-3 text-[13px] text-destructive" role="alert">
          {mensagemErro}
        </p>
      )}

      <Button
        type="button"
        onClick={onSubmit}
        disabled={status === "enviando"}
        className="mt-6 h-11 w-full gap-2 rounded-2xl text-[15px] font-semibold"
      >
        {status === "enviando" ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Confirmando…
          </>
        ) : (
          "Confirmar agendamento"
        )}
      </Button>
    </div>
  );
}

function Campo({
  inputRef,
  placeholder,
  value,
  onChange,
  onKeyDown,
  erro,
  type = "text",
  inputMode,
  autoComplete,
}: {
  inputRef?: React.RefObject<HTMLInputElement | null>;
  placeholder: string;
  value: string;
  onChange: (valor: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  erro?: string;
  type?: string;
  inputMode?: "numeric" | "text" | "email";
  autoComplete?: string;
}) {
  return (
    <div>
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={value}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        aria-invalid={!!erro}
        className={CAMPO_CLASS}
      />
      {erro && (
        <p className="mt-1 text-xs text-destructive" role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}

/**
 * Campo de telefone com máscara. Precisa de um componente próprio porque,
 * ao recalcular a máscara a cada tecla, o React reposiciona o cursor pro
 * final se a gente não restaurar manualmente a posição depois do render.
 */
function TelefoneCampo({
  inputRef,
  value,
  onChange,
  onKeyDown,
  erro,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (valor: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  erro?: string;
}) {
  const cursorDesejadoRef = useRef<number | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const elemento = event.target;
    const cursorAtual = elemento.selectionStart ?? elemento.value.length;
    const digitosAntesDoCursor = contarDigitos(elemento.value.slice(0, cursorAtual));

    const mascarado = mascararTelefone(elemento.value);
    cursorDesejadoRef.current = posicaoAposNDigitos(mascarado, digitosAntesDoCursor);

    onChange(mascarado);
  }

  useLayoutEffect(() => {
    if (cursorDesejadoRef.current !== null && inputRef.current) {
      const posicao = cursorDesejadoRef.current;
      inputRef.current.setSelectionRange(posicao, posicao);
      cursorDesejadoRef.current = null;
    }
  }, [value, inputRef]);

  return (
    <div>
      <Input
        ref={inputRef}
        placeholder="Telefone/Whatsapp"
        value={value}
        inputMode="numeric"
        autoComplete="tel"
        onChange={handleChange}
        onKeyDown={onKeyDown}
        aria-invalid={!!erro}
        className={CAMPO_CLASS}
      />
      {erro && (
        <p className="mt-1 text-xs text-destructive" role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}
