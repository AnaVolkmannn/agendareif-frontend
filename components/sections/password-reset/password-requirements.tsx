import { Circle, CircleCheck } from "lucide-react";

import type { RequisitoSenha } from "@/lib/validations";

export function PasswordRequirements({
  requisitos,
}: {
  requisitos: RequisitoSenha[];
}) {
  return (
    <ul className="mt-4 flex flex-col gap-2" aria-label="Requisitos da senha">
      {requisitos.map((requisito) => (
        <li
          key={requisito.id}
          className={`flex items-center gap-2 text-sm ${
            requisito.atendido
              ? "text-green-600 dark:text-green-500"
              : "text-muted-foreground"
          }`}
        >
          {requisito.atendido ? (
            <CircleCheck
              aria-hidden
              className="size-5 shrink-0 fill-green-600 stroke-background dark:fill-green-500"
            />
          ) : (
            <Circle
              aria-hidden
              className="size-5 shrink-0 fill-neutral-200 stroke-neutral-200 dark:fill-neutral-700 dark:stroke-neutral-700"
            />
          )}
          {requisito.label}
          <span className="sr-only">
            {requisito.atendido ? " (atendido)" : " (pendente)"}
          </span>
        </li>
      ))}
    </ul>
  );
}
