"use client";

import { useRef, useState } from "react";
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
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";

const TIPOS_ACEITOS = ["image/png", "image/jpeg"];
const TAMANHO_MAX_BYTES = 5 * 1024 * 1024;
const MAX_FOTOS = 6;

interface FotoSortavelProps {
  url: string;
  onRemover: (url: string) => void;
}

/** Miniatura arrastável, com o "x" no canto superior direito. */
function FotoSortavel({ url, onRemover }: FotoSortavelProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: url });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={`relative touch-none ${isDragging ? "z-10 opacity-50" : "opacity-100"}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- object URL local, sem loader do next/image */}
      <img
        src={url}
        alt=""
        className="aspect-square w-full rounded-lg border border-border/60 object-cover"
      />
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onRemover(url);
        }}
        aria-label="Remover foto"
        className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-foreground/70 text-background transition hover:bg-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="size-3" />
      </button>
    </li>
  );
}

interface ServicePhotosFieldProps {
  fotos: string[];
  onFotosChange: (fotos: string[]) => void;
}

export function ServicePhotosField({ fotos, onFotosChange }: ServicePhotosFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  // Só as previews criadas aqui podem ser revogadas: as fotos que já vieram
  // salvas continuam válidas se o usuário fechar o modal sem salvar.
  const previewsCriadas = useRef<Set<string>>(new Set());
  const [editando, setEditando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
  );

  function handleArquivosSelecionados(event: ChangeEvent<HTMLInputElement>) {
    const selecionados = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (selecionados.length === 0) return;

    if (selecionados.some((file) => !TIPOS_ACEITOS.includes(file.type))) {
      setErro("Formato não suportado. Envie imagens PNG ou JPG.");
      return;
    }
    if (selecionados.some((file) => file.size > TAMANHO_MAX_BYTES)) {
      setErro("Cada imagem deve ter no máximo 5 MB.");
      return;
    }

    const espacoDisponivel = MAX_FOTOS - fotos.length;
    if (espacoDisponivel <= 0) {
      setErro(`Você pode adicionar no máximo ${MAX_FOTOS} fotos.`);
      return;
    }

    setErro(
      selecionados.length > espacoDisponivel
        ? `Você pode adicionar no máximo ${MAX_FOTOS} fotos.`
        : null,
    );

    // TODO: enviar os arquivos pra API e usar as URLs devolvidas. Enquanto o
    // backend não existe, a preview local já serve como valor do campo.
    const novasUrls = selecionados.slice(0, espacoDisponivel).map((file) => {
      const url = URL.createObjectURL(file);
      previewsCriadas.current.add(url);
      return url;
    });

    onFotosChange([...fotos, ...novasUrls]);
  }

  function removerFoto(url: string) {
    if (previewsCriadas.current.delete(url)) URL.revokeObjectURL(url);
    const restantes = fotos.filter((foto) => foto !== url);
    onFotosChange(restantes);
    setErro(null);
    if (restantes.length === 0) setEditando(false);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const de = fotos.indexOf(String(active.id));
    const para = fotos.indexOf(String(over.id));
    if (de === -1 || para === -1) return;

    onFotosChange(arrayMove(fotos, de, para));
  }

  const tileAdicionar = fotos.length < MAX_FOTOS && (
    <li>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label="Adicionar foto"
        className="flex aspect-square w-full items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Plus className="size-5" />
      </button>
    </li>
  );

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-muted-foreground">Fotos</span>

      <input
        ref={inputRef}
        type="file"
        accept={TIPOS_ACEITOS.join(",")}
        multiple
        onChange={handleArquivosSelecionados}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      {editando ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={fotos} strategy={rectSortingStrategy}>
            <ul className="grid grid-cols-3 gap-3">
              {fotos.map((url) => (
                <FotoSortavel key={url} url={url} onRemover={removerFoto} />
              ))}
              {tileAdicionar}
            </ul>
          </SortableContext>
        </DndContext>
      ) : (
        <ul className="grid grid-cols-3 gap-3">
          {fotos.map((url) => (
            <li key={url}>
              {/* eslint-disable-next-line @next/next/no-img-element -- object URL local, sem loader do next/image */}
              <img
                src={url}
                alt=""
                className="aspect-square w-full rounded-lg border border-border/60 object-cover"
              />
            </li>
          ))}
          {tileAdicionar}
        </ul>
      )}

      {fotos.length > 0 && (
        <Button
          type="button"
          variant="link"
          onClick={() => setEditando((atual) => !atual)}
          className="mx-auto h-auto p-0 text-[13px] font-semibold"
        >
          {editando ? "Concluir edição" : "Editar fotos"}
        </Button>
      )}

      {editando && fotos.length > 1 && (
        <p className="text-center text-xs text-muted-foreground">
          Arraste as fotos para mudar a ordem de exibição
        </p>
      )}

      {erro && (
        <p className="text-xs text-destructive" role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}
