"use client";

import { X } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface PhotoCardProps {
  id: string;
  url: string;
  onDelete: (id: string) => void;
  onView: (url: string) => void;
}

export function PhotoCard({ id, url, onDelete, onView }: PhotoCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative aspect-square touch-none overflow-hidden rounded-2xl bg-muted transition ${
        isDragging ? "z-10 opacity-50" : "opacity-100"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL local, next/image não aceita esse esquema */}
      <img src={url} alt="Foto do portfólio" onClick={() => onView(url)} className="h-full w-full object-cover" />

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(id);
        }}
        aria-label="Remover foto"
        className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}