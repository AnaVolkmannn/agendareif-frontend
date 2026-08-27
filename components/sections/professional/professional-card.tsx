"use client";

import { Button } from "@/components/ui/button";
import type { Profissional } from "@/types/profissional";

interface ProfessionalCardProps {
  profissional: Profissional;
  onEscolher: (profissional: Profissional) => void;
}

function buildWhatsappLink(whatsapp: string) {
  const digits = whatsapp.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}

export function ProfessionalCard({ profissional, onEscolher }: ProfessionalCardProps) {
  return (
    <article className="flex h-full min-h-[132px] gap-4 rounded-3xl bg-secondary p-4 text-secondary-foreground md:min-h-[140px]">
      <div className="h-[78px] w-[78px] shrink-0 overflow-hidden rounded-xl bg-white md:h-24 md:w-24">
        {profissional.fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- URL mockada/externa, sem domínio configurado em next.config.ts
          <img
            src={profissional.fotoUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <h2 className="font-glacial text-base font-bold md:text-lg">{profissional.nome}</h2>

        <p className="mb-3 mt-1 text-[13px] leading-snug text-secondary-foreground/80 md:text-sm">
          {profissional.especialidade}
        </p>

        <div className="mt-auto flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            onClick={() => onEscolher(profissional)}
            className="h-11 w-full rounded-xl text-[14px] font-semibold sm:flex-1"
          >
            Escolher
          </Button>

          <Button
            type="button"
            onClick={() =>
              window.open(
                buildWhatsappLink(profissional.whatsapp),
                "_blank",
                "noopener,noreferrer"
              )
            }
            className="h-11 w-full gap-2 rounded-xl text-[14px] font-semibold sm:flex-1"
          >
            <WhatsAppIcon />
            WhatsApp
          </Button>
        </div>
      </div>
    </article>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.29-1.39a9.87 9.87 0 0 0 4.7 1.2h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m0 1.67a8.2 8.2 0 0 1 5.83 2.41 8.19 8.19 0 0 1 2.42 5.83c0 4.55-3.7 8.25-8.26 8.25a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.14.82.84-3.06-.2-.31a8.18 8.18 0 0 1-1.26-4.37c0-4.56 3.7-8.24 8.26-8.24m-4.75 4.6c-.16 0-.43.06-.65.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.57.13.16 1.75 2.68 4.29 3.72.6.24 1.06.39 1.43.5.6.19 1.15.16 1.58.1.48-.07 1.48-.6 1.68-1.19.21-.58.21-1.08.15-1.19-.06-.1-.23-.16-.48-.29-.26-.13-1.48-.73-1.71-.81-.23-.09-.4-.13-.56.13-.16.26-.65.81-.79.98-.15.16-.29.18-.55.06-.26-.13-1.08-.4-2.06-1.27-.76-.68-1.27-1.51-1.42-1.77-.15-.25-.02-.39.11-.51.11-.11.26-.29.39-.44.13-.15.17-.25.26-.42.09-.16.04-.31-.02-.44-.06-.13-.56-1.36-.78-1.86-.2-.49-.4-.42-.56-.43z" />
    </svg>
  );
}