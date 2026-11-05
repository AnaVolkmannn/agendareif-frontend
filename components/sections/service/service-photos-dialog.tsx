"use client";

import { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
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
  /** Índice da foto ampliada. */
  index: number;
  onIndexChange: (index: number) => void;
  onOpenChange: (open: boolean) => void;
}

/** Visualizador ampliado das fotos do serviço. */
export function ServicePhotosDialog({
  service,
  index,
  onIndexChange,
  onOpenChange,
}: ServicePhotosDialogProps) {
  const fotos = service?.photos ?? [];
  const total = fotos.length;
  const atual = fotos[index];

  function anterior() {
    onIndexChange((index - 1 + total) % total);
  }

  function proxima() {
    onIndexChange((index + 1) % total);
  }

  // Setas do teclado para navegar enquanto o visualizador está aberto.
  useEffect(() => {
    if (!service || total < 2) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") onIndexChange((index - 1 + total) % total);
      if (event.key === "ArrowRight") onIndexChange((index + 1) % total);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [service, index, total, onIndexChange]);

  return (
    <Dialog open={!!service} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="mb-3">
          <DialogTitle className="text-left text-lg">{service?.name}</DialogTitle>
          <DialogDescription className="text-left">
            Foto {Math.min(index + 1, total)} de {total}
          </DialogDescription>
        </DialogHeader>

        {atual && (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element -- URL externa (Azure), sem loader do next/image */}
            <img
              src={atual}
              alt={`Foto ${index + 1} do serviço ${service?.name}`}
              className="max-h-[65vh] w-full rounded-xl border border-border/60 bg-muted object-contain"
            />

            {total > 1 && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={anterior}
                  aria-label="Foto anterior"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full opacity-90"
                >
                  <ChevronLeft className="size-5" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={proxima}
                  aria-label="Próxima foto"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full opacity-90"
                >
                  <ChevronRight className="size-5" />
                </Button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}