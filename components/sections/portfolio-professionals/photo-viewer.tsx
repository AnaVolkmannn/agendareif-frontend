"use client";

import { X } from "lucide-react";

interface PhotoViewerProps {
  url: string;
  onClose: () => void;
}

export function PhotoViewer({ url, onClose }: PhotoViewerProps) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar"
        className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
      >
        <X className="size-5" />
      </button>

      {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL local, next/image não aceita esse esquema */}
      <img
        src={url}
        alt="Foto do portfólio em tamanho completo"
        onClick={(e) => e.stopPropagation()} // clicar na foto não deve fechar
        className="max-h-full max-w-full rounded-lg object-contain"
      />
    </div>
  );
}