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

  const profissionalId = searchParams.get("profissionalId");
  const profissionalNome = searchParams.get("profissionalNome");

  const inputRef = useRef<HTMLInputElement>(null);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function buildParamsBase() {
    const params = new URLSearchParams();
    if (profissionalId) params.set("profissionalId", profissionalId);
    if (profissionalNome) params.set("profissionalNome", profissionalNome);
    return params;
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
    router.push(`/resumo?${params.toString()}`);
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
      router.push(`/resumo?${params.toString()}`);
    } catch {
      setErro("Não foi possível enviar a imagem. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <BookingShell>
      <header className="mb-2 flex items-center">
        <BackButton fallbackHref="/selecprofissional" />
      </header>

      <h1 className="mb-0.5 mt-2 font-glacial text-xl font-extrabold md:text-2xl">
        Imagem de inspiração
      </h1>
      <p className="mb-2 text-[11px] tracking-wide text-white/60">(OPCIONAL)</p>
      <p className="mb-6 text-[13px] text-white/70 md:text-sm">
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

      <button
        type="button"
        onClick={abrirSeletorDeArquivo}
        className="flex flex-col items-center justify-center gap-1.5 rounded-3xl border-2 border-dashed border-primary bg-white px-4 py-10 text-primary transition hover:bg-white/95 md:py-14"
      >
        <Upload className="mb-1 size-9 md:size-11" strokeWidth={1.6} />
        <span className="text-[15px] font-bold md:text-base">Adicionar foto</span>
        <span className="text-xs text-primary/70">PNG, JPG - Max. 10 MB</span>
      </button>

      {erro && (
        <p className="mt-3 text-[13px] text-red-300" role="alert">
          {erro}
        </p>
      )}

      {previewUrl && (
        <div className="relative mt-4 h-[84px] w-[84px] overflow-hidden rounded-2xl bg-white md:h-24 md:w-24">
          {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL local, next/image não aceita esse esquema */}
          <img
            src={previewUrl}
            alt="Prévia da imagem de inspiração selecionada"
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={removerImagem}
            aria-label="Remover imagem selecionada"
            className="absolute -right-1.5 -top-1.5 flex size-[22px] items-center justify-center rounded-full bg-white text-black shadow"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      <div className="mt-auto flex flex-col items-center gap-3 pt-10 md:flex-row md:justify-between md:pt-16">
        <Button
          type="button"
          variant="ghost"
          onClick={handlePular}
          disabled={enviando}
          className="h-auto text-white/70 hover:bg-white/10 hover:text-white md:order-1"
        >
          Pular essa etapa
        </Button>

        <Button
          type="button"
          onClick={handleContinuar}
          disabled={!arquivo || enviando}
          className="h-11 w-full gap-2 rounded-2xl text-[15px] font-semibold md:order-2 md:w-auto md:px-10"
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
      </div>
    </BookingShell>
  );
}