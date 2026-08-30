"use client";

import { Suspense, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Upload, X } from "lucide-react";

import { BackButton } from "@/components/sections/booking/back-button";
import { BookingShell } from "@/components/sections/booking/booking-shell";
import { Button } from "@/components/ui/button";
import { markNavigatedWithinApp } from "@/lib/app-nav-state";
import { uploadImagemInspiracao } from "@/app/mocks/professionals-mock";

const TIPOS_ACEITOS = ["image/png", "image/jpeg"];
const TAMANHO_MAX_BYTES = 10 * 1024 * 1024;

export default function SelecInspiracaoPage() {
  return (
    <Suspense fallback={null}>
      <SelecInspiracaoContent />
    </Suspense>
  );
}

function SelecInspiracaoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const inputRef = useRef<HTMLInputElement>(null);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function buildParamsBase() {
    // Preserva todos os params das etapas anteriores (profissional, serviços, data/hora).
    return new URLSearchParams(searchParams.toString());
  }

  function abrirSeletorDeArquivo() {
    inputRef.current?.click();
  }

  function handleArquivoSelecionado(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!TIPOS_ACEITOS.includes(file.type)) {
      setErro("Formato não suportado. Envie uma imagem PNG ou JPG.");
      return;
    }

    if (file.size > TAMANHO_MAX_BYTES) {
      setErro("A imagem excede o limite de 10 MB.");
      return;
    }

    setErro(null);
    setArquivo(file);
    setPreviewUrl((antigo) => {
      if (antigo) URL.revokeObjectURL(antigo);
      return URL.createObjectURL(file);
    });
  }

  function removerImagem() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setArquivo(null);
    setPreviewUrl(null);
    setErro(null);
  }

  function handlePular() {
    const params = buildParamsBase();
    params.set("temInspiracao", "false");
    markNavigatedWithinApp();
    router.push(`/pages/client/register?${params.toString()}`);
  }

  async function handleContinuar() {
    if (!arquivo) return;

    setEnviando(true);
    setErro(null);
    try {
      const resultado = await uploadImagemInspiracao(arquivo);
      const params = buildParamsBase();
      params.set("temInspiracao", "true");
      params.set("imagemUrl", resultado.url);
      markNavigatedWithinApp();
      router.push(`/pages/client/register?${params.toString()}`);
    } catch {
      setErro("Não foi possível enviar a imagem. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <BookingShell>
      <header className="mb-2 flex items-center">
        <BackButton fallbackHref="/pages/client/select-scheduling" />
      </header>

      <h1 className="mb-0.5 mt-2 font-glacial text-xl font-extrabold md:text-2xl">
        Imagem de inspiração
      </h1>
      <p className="mb-2 text-[11px] tracking-wide text-foreground/60">(OPCIONAL)</p>
      <p className="mb-6 text-[13px] text-foreground/70 md:text-sm">
        Adicione uma foto de referência para o seu serviço
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={TIPOS_ACEITOS.join(",")}
        onChange={handleArquivoSelecionado}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      <Button
        type="button"
        variant="outline"
        onClick={abrirSeletorDeArquivo}
        className="flex h-auto flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-primary bg-input px-4 py-10 transition hover:bg-input/80 md:py-14"
      >
        <Upload className="mb-1 size-9 md:size-11" strokeWidth={1.6} />
        <span className="text-[15px] font-bold">Adicionar foto</span>
        <span className="text-xs">PNG, JPG - Max. 10 MB</span>
      </Button>

      {erro && (
        <p className="mt-3 text-[13px] text-red-300" role="alert">
          {erro}
        </p>
      )}

      {previewUrl && (
        <div className="relative mt-4 w-fit">
          <div className="h-[84px] w-[84px] overflow-hidden rounded-2xl bg-white md:h-24 md:w-24">
            {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL local, next/image não aceita esse esquema */}
            <img
              src={previewUrl}
              alt="Prévia da imagem de inspiração selecionada"
              className="h-full w-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={removerImagem}
            aria-label="Remover imagem selecionada"
            className="absolute -right-3 -top-3 flex size-8 items-center justify-center rounded-full bg-white text-black shadow-md ring-1 ring-black/10 transition hover:bg-neutral-100 active:scale-95 md:size-7"
          >
            <X className="size-4 md:size-3.5" />
          </button>
        </div>
      )}

      <div className="mt-auto flex flex-col items-center gap-3 pt-10 md:flex-row md:justify-between md:pt-16">
        <Button
          type="button"
          onClick={handleContinuar}
          disabled={!arquivo || enviando}
          className="order-1 h-11 w-full gap-2 rounded-lg text-[15px] font-semibold md:order-2 md:w-auto md:px-10"
        >
          {enviando ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Enviando…
            </>
          ) : (
            "Continuar"
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={handlePular}
          disabled={enviando}
          className="order-2 h-auto text-foreground/70 hover:bg-muted hover:text-foreground md:order-1"
        >
          Pular essa etapa
        </Button>
      </div>
    </BookingShell>
  );
}