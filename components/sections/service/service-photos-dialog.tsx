"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Service } from "@/types/service";

/**
 * Setas discretas: a foto é o que importa. Vidro fosco neutro em vez de
 * botão colorido, que competia com a imagem.
 */
const SETA_NAVEGACAO =
  "absolute top-1/2 size-9 -translate-y-1/2 rounded-full border border-border/50 " +
  "bg-background/60 text-foreground/70 shadow-sm backdrop-blur-sm transition " +
  "hover:bg-background/90 hover:text-foreground " +
  // O anel de foco padrão usa --ring, que no tema escuro é avermelhado.
  // Aqui ele vira neutro: continua visível para quem navega por teclado,
  // sem destoar do resto do visualizador.
  "focus-visible:border-foreground/30 focus-visible:ring-foreground/20";

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

  /** Onde o dedo/mouse encostou, para medir o arrasto. */
  const inicioArrasto = useRef<number | null>(null);
  /** Define de que lado a próxima foto entra deslizando. */
  const [direcao, setDirecao] = useState<"frente" | "tras">("frente");

  const irPara = useCallback(
    (novoIndice: number, sentido: "frente" | "tras") => {
      setDirecao(sentido);
      onIndexChange(novoIndice);
    },
    [onIndexChange],
  );

  const anterior = useCallback(
    () => irPara((index - 1 + total) % total, "tras"),
    [irPara, index, total],
  );

  const proxima = useCallback(
    () => irPara((index + 1) % total, "frente"),
    [irPara, index, total],
  );

  function aoEncostar(event: React.PointerEvent) {
    inicioArrasto.current = event.clientX;
  }

  function aoSoltar(event: React.PointerEvent) {
    const inicio = inicioArrasto.current;
    inicioArrasto.current = null;
    if (inicio === null || total < 2) return;

    // Abaixo disso é toque parado ou tremida de mão, não um arrasto.
    const DISTANCIA_MINIMA = 40;
    const percorrido = event.clientX - inicio;
    if (Math.abs(percorrido) < DISTANCIA_MINIMA) return;

    // Arrastar para a esquerda traz a próxima, como num álbum de fotos.
    if (percorrido < 0) proxima();
    else anterior();
  }

  // Setas do teclado para navegar enquanto o visualizador está aberto.
  // Precisa ser na fase de captura: o Dialog usa as setas para mover o foco
  // entre os botões e interrompe a propagação, então uma escuta normal no
  // window nunca receberia o evento.
  useEffect(() => {
    if (!service || total < 2) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

      // Aqui a seta serve para trocar de foto, não para andar entre botões.
      event.preventDefault();
      event.stopPropagation();

      if (event.key === "ArrowLeft") anterior();
      else proxima();
    }

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [service, total, anterior, proxima]);

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
          <div
            // overflow-hidden segura a foto que está deslizando para dentro.
            className="relative overflow-hidden rounded-xl"
            onPointerDown={aoEncostar}
            onPointerUp={aoSoltar}
            // touch-pan-y: o arrasto horizontal é nosso, o vertical continua
            // rolando a página normalmente.
            style={{ touchAction: "pan-y" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- URL externa (Azure), sem loader do next/image */}
            <img
              // A key troca junto com a foto, o que faz a animação rodar de novo.
              key={index}
              src={atual}
              alt={`Foto ${index + 1} do serviço ${service?.name}`}
              draggable={false}
              className={cn(
                "max-h-[65vh] w-full select-none rounded-xl border border-border/60 bg-muted object-contain",
                "animate-in fade-in duration-200",
                direcao === "frente"
                  ? "slide-in-from-right-8"
                  : "slide-in-from-left-8",
              )}
            />

            {total > 1 && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={anterior}
                  aria-label="Foto anterior"
                  className={SETA_NAVEGACAO + " left-2"}
                >
                  <ChevronLeft className="size-5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={proxima}
                  aria-label="Próxima foto"
                  className={SETA_NAVEGACAO + " right-2"}
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