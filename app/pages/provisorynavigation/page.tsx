import { BackButton } from "@/components/sections/booking/back-button";
import { BookingShell } from "@/components/sections/booking/booking-shell";

interface ResumoPageProps {
  searchParams: Promise<{
    profissionalId?: string;
    profissionalNome?: string;
    temInspiracao?: string;
    imagemUrl?: string;
  }>;
}

export default async function ResumoPage({ searchParams }: ResumoPageProps) {
  const params = await searchParams;

  return (
    <BookingShell>
      <header className="mb-4 flex items-center">
        <BackButton fallbackHref="/selecprofissional" />
      </header>

      <h1 className="mb-6 font-glacial text-lg font-extrabold text-white/70 md:text-xl">
        Resumo (tela provisória)
      </h1>

      <dl className="mb-6 space-y-4">
        <div>
          <dt className="text-xs text-white/60">Profissional escolhido</dt>
          <dd className="text-[15px] font-semibold">
            {params.profissionalNome ?? "—"}
            {params.profissionalId ? ` (id: ${params.profissionalId})` : ""}
          </dd>
        </div>

        <div>
          <dt className="text-xs text-white/60">Tem inspiração?</dt>
          <dd className="text-[15px] font-semibold">
            {params.temInspiracao === undefined
              ? "—"
              : params.temInspiracao === "true"
                ? "Sim"
                : "Não"}
          </dd>
        </div>
      </dl>

      {params.imagemUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- blob: URL local, next/image não aceita esse esquema
        <img
          src={params.imagemUrl}
          alt="Imagem de inspiração enviada"
          className="h-[140px] w-[140px] rounded-2xl object-cover"
        />
      )}
    </BookingShell>
  );
}