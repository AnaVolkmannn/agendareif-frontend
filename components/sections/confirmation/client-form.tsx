"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CamposInvalidos, DadosCliente, StatusConfirmacao } from "@/types/agendamento";

interface ClientFormProps {
  dados: DadosCliente;
  erros: CamposInvalidos;
  status: StatusConfirmacao;
  mensagemErro: string | null;
  onCampoChange: (campo: keyof DadosCliente, valor: string) => void;
  onSubmit: () => void;
}

export function ClientForm({
  dados,
  erros,
  status,
  mensagemErro,
  onCampoChange,
  onSubmit,
}: ClientFormProps) {
  return (
    <div>
      <h2 className="mb-3 mt-6 font-glacial text-base font-bold">Seus Dados</h2>

      <div className="flex flex-col gap-3">
        <Campo
          placeholder="Nome completo"
          autoComplete="name"
          value={dados.nomeCompleto}
          erro={erros.nomeCompleto}
          onChange={(valor) => onCampoChange("nomeCompleto", valor)}
        />
        <Campo
          placeholder="E-mail"
          type="email"
          autoComplete="email"
          value={dados.email}
          erro={erros.email}
          onChange={(valor) => onCampoChange("email", valor)}
        />
        <Campo
          placeholder="Telefone/Whatsapp"
          inputMode="numeric"
          autoComplete="tel"
          value={dados.telefone}
          erro={erros.telefone}
          onChange={(valor) => onCampoChange("telefone", valor)}
        />
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
  placeholder,
  value,
  onChange,
  erro,
  type = "text",
  inputMode,
  autoComplete,
}: {
  placeholder: string;
  value: string;
  onChange: (valor: string) => void;
  erro?: string;
  type?: string;
  inputMode?: "numeric" | "text" | "email";
  autoComplete?: string;
}) {
  return (
    <div>
      <Input
        placeholder={placeholder}
        value={value}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={!!erro}
      />
      {erro && (
        <p className="mt-1 text-xs text-destructive" role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}
