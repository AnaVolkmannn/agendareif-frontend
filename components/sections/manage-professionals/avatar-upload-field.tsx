"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { UserRound } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const TIPOS_ACEITOS = ["image/png", "image/jpeg"];
const TAMANHO_MAX_BYTES = 5 * 1024 * 1024;

interface AvatarUploadFieldProps {
  fotoUrlInicial?: string;
  onFotoChange: (file: File | null) => void;
}

export function AvatarUploadField({ fotoUrlInicial, onFotoChange }: AvatarUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(fotoUrlInicial);
  const [erro, setErro] = useState<string | null>(null);

  function handleArquivoSelecionado(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!TIPOS_ACEITOS.includes(file.type)) {
      setErro("Formato não suportado. Envie uma imagem PNG ou JPG.");
      return;
    }
    if (file.size > TAMANHO_MAX_BYTES) {
      setErro("A imagem excede o limite de 5 MB.");
      return;
    }

    setErro(null);
    setPreviewUrl((antigo) => {
      if (antigo) URL.revokeObjectURL(antigo);
      return URL.createObjectURL(file);
    });
    onFotoChange(file);
  }

  return (
    <div className="mb-5 flex flex-col items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={TIPOS_ACEITOS.join(",")}
        onChange={handleArquivoSelecionado}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      <Avatar className="size-20 border border-border/60 bg-muted">
        <AvatarImage src={previewUrl} alt="" />
        <AvatarFallback>
          <UserRound className="size-8 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>

      <Button
        type="button"
        variant="link"
        onClick={() => inputRef.current?.click()}
        className="h-auto p-0 text-[13px] font-semibold"
      >
        Adicionar foto de perfil
      </Button>

      {erro && (
        <p className="text-xs text-destructive" role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}