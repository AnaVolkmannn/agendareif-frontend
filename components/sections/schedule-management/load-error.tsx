import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

interface LoadErrorProps {
  mensagem: string;
  onRetry: () => void;
}

/** Aviso de falha no carregamento, com ação de tentar de novo. */
export function LoadError({ mensagem, onRetry }: LoadErrorProps) {
  return (
    <div
      role="alert"
      className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3"
    >
      <TriangleAlert className="size-5 shrink-0 text-destructive" />
      <p className="min-w-0 flex-1 text-[13px] font-semibold text-destructive">
        {mensagem}
      </p>
      <Button
        type="button"
        variant="outline"
        onClick={onRetry}
        className="h-9 shrink-0 rounded-lg px-3 text-[13px] font-semibold"
      >
        Tentar de novo
      </Button>
    </div>
  );
}
