"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { PhotoCard } from "@/components/sections/portfolio-professionals/photo-card";
import { PhotoViewer } from "@/components/sections/portfolio-professionals/photo-viewer";
import {
  deletePortfolioPhoto,
  getPortfolioPhotos,
  reorderPortfolioPhotos,
  uploadPortfolioPhotos,
  type PortfolioPhoto,
} from "@/lib/api/portfolio";

const TIPOS_ACEITOS = ["image/png", "image/jpeg"];
const TAMANHO_MAX_BYTES = 10 * 1024 * 1024; // mesmo limite do ImageStorageService

export default function PortfolioPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<PortfolioPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [viewingUrl, setViewingUrl] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    }),
  );

  useEffect(() => {
    let ativo = true;
    getPortfolioPhotos()
      .then((data) => {
        if (ativo) setPhotos(data);
      })
      .catch(() => {
        if (ativo) setErro("Não foi possível carregar o portfólio.");
      })
      .finally(() => {
        if (ativo) setIsLoading(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  function abrirSeletorDeArquivo() {
    inputRef.current?.click();
  }

  async function handleArquivoSelecionado(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const selecionados = Array.from(event.target.files ?? []);
    event.target.value = "";

    const validos = selecionados.filter(
      (file) =>
        TIPOS_ACEITOS.includes(file.type) && file.size <= TAMANHO_MAX_BYTES,
    );
    if (validos.length === 0) {
      setErro("Envie imagens PNG ou JPG de até 10 MB.");
      return;
    }

    setErro(
      validos.length < selecionados.length
        ? "Alguns arquivos foram ignorados (apenas PNG/JPG de até 10 MB)."
        : null,
    );
    setIsUploading(true);
    try {
      const novas = await uploadPortfolioPhotos(validos);
      setPhotos((atual) => [...atual, ...novas]);
    } catch {
      setErro("Não foi possível enviar as fotos. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(id: string) {
    const anterior = photos;
    setPhotos((atual) => atual.filter((p) => p.id !== id));
    try {
      await deletePortfolioPhoto(id);
    } catch {
      setPhotos(anterior); // desfaz se a API recusar
      setErro("Não foi possível remover a foto.");
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const de = photos.findIndex((p) => p.id === active.id);
    const para = photos.findIndex((p) => p.id === over.id);
    if (de === -1 || para === -1) return;

    const anterior = photos;
    const atualizado = arrayMove(photos, de, para);
    setPhotos(atualizado);

    try {
      await reorderPortfolioPhotos(atualizado.map((p) => p.id));
    } catch {
      setPhotos(anterior);
      setErro("Não foi possível salvar a nova ordem.");
    }
  }

  return (
    <SidebarInset>
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/95 px-4 pb-3 pt-4 backdrop-blur supports-backdrop-filter:bg-background/80 md:px-8">
        <div className="relative flex items-center justify-center">
          <SidebarTrigger className="absolute left-0 size-9 shrink-0 md:hidden" />
          <h1 className="text-center font-glacial text-2xl font-extrabold md:text-3xl">
            Portfólio
          </h1>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-5xl flex-col px-4 py-5 md:px-8 md:py-8">
        <input
          ref={inputRef}
          type="file"
          accept={TIPOS_ACEITOS.join(",")}
          multiple
          onChange={handleArquivoSelecionado}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />

        {erro && (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {erro}
          </p>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-2xl bg-muted"
              />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Nenhuma foto adicionada ainda.
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={photos.map((p) => p.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {photos.map((photo) => (
                  <PhotoCard
                    key={photo.id}
                    id={photo.id}
                    url={photo.url}
                    onDelete={handleDelete}
                    onView={setViewingUrl}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Barra fixa com o botão de adicionar foto, sempre visível sem precisar rolar */}
        <div className="sticky bottom-0 z-20 -mx-4 mt-auto border-t border-border/60 bg-background/95 px-4 py-4 backdrop-blur supports-backdrop-filter:bg-background/80 md:-mx-8 md:px-8">
          <div className="mx-auto max-w-5xl">
            <Button
              type="button"
              onClick={abrirSeletorDeArquivo}
              disabled={isUploading}
              size="lg"
              className="h-11 w-full gap-2 rounded-lg text-[15px] font-semibold"
            >
              <Plus className="size-4" />
              {isUploading ? "Enviando..." : "Adicionar foto"}
            </Button>
          </div>
        </div>

        {viewingUrl && (
          <PhotoViewer url={viewingUrl} onClose={() => setViewingUrl(null)} />
        )}
      </main>
    </SidebarInset>
  );
}
