"use client";

import { useEffect, useState } from "react";

import { PhotoViewer } from "@/components/sections/portfolio-professionals/photo-viewer";
import { getMuralPhotos, type PortfolioPhoto } from "@/lib/api/portfolio";

const MAX_FOTOS = 18;
const PLACEHOLDERS = 9;

export function InspirationGallery() {
  const [photos, setPhotos] = useState<PortfolioPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingUrl, setViewingUrl] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    getMuralPhotos()
      .then((dados) => {
        if (ativo) setPhotos(dados.slice(0, MAX_FOTOS));
      })
      .catch(() => {
        // sem foto / API fora do ar: mantém os quadrados de placeholder
      })
      .finally(() => {
        if (ativo) setLoading(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  const temFotos = photos.length > 0;

  return (
    <section className="bg-primary px-6 pb-10 pt-8 md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-barbra text-xl md:text-2xl text-white">
          MURAL DE INSPIRAÇÕES
        </h2>
        <p className="mb-5 text-base md:text-lg text-white">
          Alguns trabalhos de nossos profissionais pra você se inspirar
        </p>

        <div className="grid grid-cols-3 md:gap-3 gap-1">
          {temFotos
            ? photos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setViewingUrl(photo.url)}
                  aria-label="Ver foto em tamanho completo"
                  className="aspect-square overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:scale-105 hover: cursor-pointer hover:shadow-md active:scale-105"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- URL do Azure Blob, sem domínio configurado em next.config.ts */}
                  <img
                    src={photo.url}
                    alt="Trabalho realizado no Reif Beauty Studio"
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </button>
              ))
            : Array.from({ length: PLACEHOLDERS }).map((_, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-2xl bg-white shadow-sm ${
                    loading ? "animate-pulse" : ""
                  }`}
                />
              ))}
        </div>
      </div>

      {viewingUrl && (
        <PhotoViewer url={viewingUrl} onClose={() => setViewingUrl(null)} />
      )}
    </section>
  );
}
