"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Camera, UserRound } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TIPOS_ACEITOS = ["image/png", "image/jpeg"];
const TAMANHO_MAX_BYTES = 5 * 1024 * 1024;

interface ProfileAvatarFieldProps {
  fotoUrlInicial?: string;
  onFotoChange: (file: File | null) => void;
  onErro?: (mensagem: string | null) => void;
}

export function ProfileAvatarField({
  fotoUrlInicial,
  onFotoChange,
  onErro,
}: ProfileAvatarFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(fotoUrlInicial);

  function handleArquivoSelecionado(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!TIPOS_ACEITOS.includes(file.type)) {
      onErro?.("Formato não suportado. Envie uma imagem PNG ou JPG.");
      return;
    }
    if (file.size > TAMANHO_MAX_BYTES) {
      onErro?.("A imagem excede o limite de 5 MB.");
      return;
    }

    onErro?.(null);
    setPreviewUrl((antigo) => {
      if (antigo) URL.revokeObjectURL(antigo);
      return URL.createObjectURL(file);
    });
    onFotoChange(file);
  }

  return (
    <div className="relative inline-flex">
      <input
        ref={inputRef}
        type="file"
        accept={TIPOS_ACEITOS.join(",")}
        onChange={handleArquivoSelecionado}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      <Avatar className="size-24 border border-border/60 bg-muted">
        <AvatarImage src={previewUrl} alt="" />
        <AvatarFallback>
          <UserRound className="size-10 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label="Trocar foto de perfil"
        className="absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-sm transition hover:bg-primary/85"
      >
        <Camera className="size-3.5" />
      </button>
    </div>
  );
}
