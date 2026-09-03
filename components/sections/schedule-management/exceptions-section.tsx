"use client";

import { Clock, Moon, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatDataPorExtenso } from "@/lib/format";
import type { Excecao } from "@/types/horario";

type Status = "loading" | "success" | "error";

interface ExceptionsSectionProps {
  excecoes: Excecao[];
  status: Status;
  onCadastrar: () => void;
  onExcluir: (excecao: Excecao) => void;
}

export function ExceptionsSection({
  excecoes,
  status,
  onCadastrar,
  onExcluir,
}: ExceptionsSectionProps) {
  return (
    <section className="rounded-2xl bg-primary/10 px-4 py-5">
      <h2 className="text-center font-glacial text-lg font-extrabold uppercase text-primary">
        Exceções pontuais
      </h2>
      <p className="mt-1 text-center text-[13px] text-primary/80">
        Folgas ou horários especiais em datas específicas
      </p>

      <div className="mt-4 flex flex-col gap-3">
        {status === "loading" && (
          <p className="text-center text-[13px] text-muted-foreground" role="status">
            Carregando exceções…
          </p>
        )}

        {status === "error" && (
          <p
            className="text-center text-[13px] font-bold text-destructive"
            role="alert"
          >
            Não foi possível carregar as exceções!
          </p>
        )}

        {(status === "error" || (status === "success" && excecoes.length === 0)) && (
          <p className="text-center text-[13px] text-muted-foreground">
            Nenhuma exceção cadastrada
          </p>
        )}

        {status === "success" && excecoes.length > 0 && (
          <ul className="flex flex-col gap-2">
            {excecoes.map((excecao) => (
              <li
                key={excecao.id}
                className="flex items-center gap-3 rounded-xl bg-card px-3 py-2.5"
              >
                {excecao.tipo === "folga" ? (
                  <Moon className="size-4 shrink-0 text-primary" />
                ) : (
                  <Clock className="size-4 shrink-0 text-primary" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold">
                    {formatDataPorExtenso(excecao.data)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {excecao.tipo === "folga"
                      ? "Folga"
                      : `Horário especial: ${excecao.inicio} às ${excecao.fim}`}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onExcluir(excecao)}
                  aria-label={`Excluir exceção de ${formatDataPorExtenso(excecao.data)}`}
                  className="shrink-0 text-destructive hover:text-destructive/70"
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={onCadastrar}
          className="mt-1 h-10 w-full gap-1.5 rounded-lg text-[13px] font-semibold text-primary sm:w-auto sm:self-start"
        >
          <Plus className="size-4" />
          Cadastrar exceção
        </Button>
      </div>
    </section>
  );
}
