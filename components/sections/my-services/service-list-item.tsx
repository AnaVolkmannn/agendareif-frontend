import { Clock, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import type { Service } from "@/types/service";

interface ServiceListItemProps {
  servico: Service;
  onEditar: (servico: Service) => void;
  onExcluir: (servico: Service) => void;
}

export function ServiceListItem({ servico, onEditar, onExcluir }: ServiceListItemProps) {
  return (
    <li className="flex items-start gap-3 rounded-xl border border-border/60 bg-card px-4 py-4 shadow-sm">
      <div className="min-w-0 flex-1">
        <p className="font-glacial text-[15px] font-bold">{servico.name}</p>
        <p className="mt-1 line-clamp-3 text-[13px] uppercase leading-snug text-muted-foreground">
          {servico.description || "Sem descrição cadastrada"}
        </p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-[15px] font-semibold">{formatPrice(servico.price)}</p>
          {servico.durationMin ? (
            <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <Clock className="size-4 text-primary" />
              {servico.durationMin}min
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-start gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onEditar(servico)}
          aria-label={`Editar ${servico.name}`}
          className="text-muted-foreground hover:text-secondary-hover"
        >
          <Pencil className="size-4.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onExcluir(servico)}
          aria-label={`Excluir ${servico.name}`}
          className="text-destructive hover:text-destructive/70"
        >
          <Trash2 className="size-4.5" />
        </Button>
      </div>
    </li>
  );
}
