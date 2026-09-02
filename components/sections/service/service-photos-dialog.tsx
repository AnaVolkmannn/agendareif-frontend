"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Service } from "@/types/service";

interface ServicePhotosDialogProps {
  /** null = fechado. */
  service: Service | null;
  onOpenChange: (open: boolean) => void;
}

/** Galeria das fotos que o profissional anexou ao serviço. */
export function ServicePhotosDialog({
  service,
  onOpenChange,
}: ServicePhotosDialogProps) {
  const fotos = service?.photos ?? [];

  return (
    <Dialog open={!!service} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-left text-lg">{service?.name}</DialogTitle>
          <DialogDescription className="text-left">
            {fotos.length === 1
              ? "1 foto anexada pelo profissional"
              : `${fotos.length} fotos anexadas pelo profissional`}
          </DialogDescription>
        </DialogHeader>

        <ul className="grid grid-cols-2 gap-3">
          {fotos.map((url) => (
            <li key={url}>
              {/* eslint-disable-next-line @next/next/no-img-element -- URL vinda da API/preview local, sem loader do next/image */}
              <img
                src={url}
                alt={`Foto do serviço ${service?.name}`}
                className="aspect-square w-full rounded-xl border border-border/60 object-cover"
              />
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
