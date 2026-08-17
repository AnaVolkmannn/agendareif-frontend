import { User, Tag, CalendarClock, MessageSquareText } from "lucide-react";

import type { ResumoAgendamento } from "@/types/agendamento";

interface BookingSummaryProps {
  resumo: ResumoAgendamento;
}

export function BookingSummary({ resumo }: BookingSummaryProps) {
  return (
    <div className="rounded-3xl border border-black/5 bg-white p-5 text-neutral-900 shadow-sm">
      <SummaryItem icon={<User className="size-5" />} label="Profissional" value={resumo.profissionalNome} />
      <SummaryDivider />
      <SummaryItem icon={<Tag className="size-5" />} label="Serviço" value={resumo.servico} />
      <SummaryDivider />
      <SummaryItem icon={<CalendarClock className="size-5" />} label="Data & Horas" value={resumo.dataHora} />
      <SummaryDivider />
      <SummaryItem
        icon={<MessageSquareText className="size-5" />}
        label="Inspiração"
        value={resumo.inspiracaoLabel}
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

function SummaryDivider() {
  return <div className="h-px w-full bg-neutral-200" />;
}
