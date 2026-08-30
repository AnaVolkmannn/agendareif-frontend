import { Pencil, Trash2, UserRound } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Profissional } from "@/types/profissional";

interface ProfessionalListItemProps {
  profissional: Profissional;
  onEditar: (profissional: Profissional) => void;
  onExcluir: (profissional: Profissional) => void;
}

export function ProfessionalListItem({
  profissional,
  onEditar,
  onExcluir,
}: ProfessionalListItemProps) {
  return (
    <li className="flex min-h-[92px] items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-4 shadow-sm">
      <Avatar className="size-12 shrink-0 self-start rounded-lg border border-border/60 bg-muted">
        <AvatarImage src={profissional.fotoUrl} alt="" className="rounded-lg" />
        <AvatarFallback className="rounded-lg">
          <UserRound className="size-5 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-bold uppercase">{profissional.nome}</p>
        <p className="text-[13px] leading-snug text-muted-foreground">
          {profissional.especialidade || "Sem descrição cadastrada"}
        </p>
      </div>

      <div className="flex shrink-0 items-start gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onEditar(profissional)}
          aria-label={`Editar ${profissional.nome}`}
          className="text-muted-foreground hover:text-secondary-hover"
        >
          <Pencil className="size-4.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onExcluir(profissional)}
          aria-label={`Excluir ${profissional.nome}`}
          className="text-destructive hover:text-destructive/70"
        >
          <Trash2 className="size-4.5" />
        </Button>
      </div>
    </li>
  );
}