import { User, Tag, CalendarClock, Image as ImageIcon, Trash2 } from "lucide-react";

import type { ResumoAgendamento } from "@/types/agendamento";

interface BookingSummaryProps {
  resumo: ResumoAgendamento;
  onAbrirFotoInspiracao?: () => void;
  onRemoverInspiracao?: () => void;
}

export function BookingSummary({
  resumo,
  onAbrirFotoInspiracao,
  onRemoverInspiracao,
}: BookingSummaryProps) {
  return (
    <div className="rounded-3xl border border-black/5 bg-white p-5 text-neutral-900 shadow-sm">
      <SummaryItem icon={<User className="size-5" />} label="Profissional" value={resumo.profissionalNome} />
      <SummaryDivider />
      <SummaryItem icon={<Tag className="size-5" />} label="Serviço" value={resumo.servico} />
      <SummaryDivider />
      <SummaryItem icon={<CalendarClock className="size-5" />} label="Data & Horas" value={resumo.dataHora} />
      <SummaryDivider />
      <InspiracaoItem
        label={resumo.inspiracaoLabel}
        imagemUrl={resumo.imagemUrl}
        onAbrirFoto={onAbrirFotoInspiracao}
        onRemover={onRemoverInspiracao}
      />
    </div>
  );
}

function SummaryItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-sm font-bold">{label}</p>
        <p className="text-sm text-neutral-600">{value}</p>
      </div>
    </div>
  );
}

function InspiracaoItem({
  label,
  imagemUrl,
  onAbrirFoto,
  onRemover,
}: {
  label: string;
  imagemUrl?: string;
  onAbrirFoto?: () => void;
  onRemover?: () => void;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      {imagemUrl ? (
        <button
          type="button"
          onClick={onAbrirFoto}
          aria-label="Ver imagem de inspiração ampliada"
          className="mt-0.5 size-10 shrink-0 overflow-hidden rounded-lg ring-1 ring-black/10 transition hover:opacity-90"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL local, next/image não aceita esse esquema */}
          <img src={imagemUrl} alt="Miniatura da imagem de inspiração" className="size-full object-cover" />
        </button>
      ) : (
        <div className="mt-0.5 shrink-0 text-neutral-900">
          <ImageIcon className="size-5" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">Inspiração</p>
        <p className="text-sm text-neutral-600">{label}</p>
      </div>

      {imagemUrl && onRemover && (
        <button
          type="button"
          onClick={onRemover}
          aria-label="Remover imagem de inspiração"
          className="shrink-0 rounded-full p-1.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </button>
      )}
    </div>
  );
}

function SummaryDivider() {
  return <div className="h-px w-full bg-neutral-200" />;
}
