"use client";

import { useRef, useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { PhotoViewer } from "@/components/sections/portfolio-professionals/photo-viewer";
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
import {
  deletePortfolioPhoto,
  getPortfolioPhotos,
  reorderPortfolioPhotos,
  uploadPortfolioPhoto,
  type PortfolioPhoto,
} from "@/lib/api/portfolio";

const TIPOS_ACEITOS = ["image/png", "image/jpeg"];

export default function PortfolioPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<PortfolioPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [viewingUrl, setViewingUrl] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    }),
  );

  useEffect(() => {
    getPortfolioPhotos().then((data) => {
      setPhotos(data.filter((p) => p.url));
      setIsLoading(false);
    });
  }, []);

  function abrirSeletorDeArquivo() {
    inputRef.current?.click();
  }

  async function handleArquivoSelecionado(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const arquivosSelecionados = Array.from(event.target.files ?? []);
   event.target.value = "";

   const arquivosValidos = arquivosSelecionados.filter((file) =>
     TIPOS_ACEITOS.includes(file.type)
   );
   if (arquivosValidos.length === 0) return;

   setIsUploading(true);
   try {
     // Envia em paralelo — mais rápido que enviar um por um em sequência
     const resultados = await Promise.all(
       arquivosValidos.map((file) => uploadPortfolioPhoto(file))
     );

     setPhotos((atual) => {
      const atualizado = [...atual, ...resultados];
      reorderPortfolioPhotos(atualizado.map((p) => p.id));
      return atualizado;
    });
  } finally {
    setIsUploading(false);
    }
  }

  async function handleDelete(id: string) {
    setPhotos((atual) => atual.filter((p) => p.id !== id));
    await deletePortfolioPhoto(id);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setPhotos((atual) => {
      const fromIndex = atual.findIndex((p) => p.id === active.id);
      const toIndex = atual.findIndex((p) => p.id === over.id);
      const atualizado = arrayMove(atual, fromIndex, toIndex);

      reorderPortfolioPhotos(atualizado.map((p) => p.id));
      return atualizado;
    });
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
              variant="secondary"
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
