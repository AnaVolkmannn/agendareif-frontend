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

import { AdminShell } from "@/components/sections/admin/admin-shell";
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
    })
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

  async function handleArquivoSelecionado(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !TIPOS_ACEITOS.includes(file.type)) return;

    setIsUploading(true);
    try {
      const resultado = await uploadPortfolioPhoto(file);
      setPhotos((atual) => {
        const atualizado = [...atual, resultado];
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
    <AdminShell topLabel="PORTFÓLIO" title="Portfólio">
      <input
        ref={inputRef}
        type="file"
        accept={TIPOS_ACEITOS.join(",")}
        onChange={handleArquivoSelecionado}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Nenhuma foto adicionada ainda.
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 gap-4">
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

      {/* Espaçador — evita que a última linha de fotos fique escondida atrás do botão fixo */}
      <div className="h-24" />

      {/* Barra fixa com o botão de adicionar foto, sempre visível sem precisar rolar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border/60 bg-background/95 px-4 py-4 backdrop-blur supports-backdrop-filter:bg-background/80 md:px-8">
        <div className="mx-auto max-w-5xl">
          <Button
            type="button"
            onClick={abrirSeletorDeArquivo}
            disabled={isUploading}
            variant="secondary"
            size="lg"
            className="w-full gap-2 rounded-full py-6 text-base"
          >
            <Plus className="size-4" />
            {isUploading ? "Enviando..." : "Adicionar foto"}
          </Button>
        </div>
      </div>

      {viewingUrl && (
        <PhotoViewer url={viewingUrl} onClose={() => setViewingUrl(null)} />
      )}
    </AdminShell>
  );
}