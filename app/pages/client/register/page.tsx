"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { BackButton } from "@/components/sections/booking/back-button";
import { BookingShell } from "@/components/sections/booking/booking-shell";
import { BookingSummary } from "@/components/sections/confirmation/booking-summary";
import { ClientForm } from "@/components/sections/confirmation/client-form";
import { PhotoViewer } from "@/components/sections/portfolio-professionals/photo-viewer";
import { buttonVariants } from "@/components/ui/button";
import { confirmarAgendamento } from "@/lib/api/agendamento";
import { formatarDataHora } from "@/lib/format";
import { validarFormulario, sanitizarNome, sanitizarObservacao } from "@/lib/validations";
import type {
  CamposInvalidos,
  DadosCliente,
  StatusConfirmacao,
} from "@/types/agendamento";

const DADOS_INICIAIS: DadosCliente = {
  nomeCompleto: "",
  email: "",
  telefone: "",
  observacao: "",
};

export default function ConfirmacaoPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmacaoContent />
    </Suspense>
  );
}

function ConfirmacaoContent() {
  const searchParams = useSearchParams();

  // Tudo o que foi escolhido nas telas anteriores chega pela URL: os ids
  // vão para a API, os nomes só para exibir no resumo.
  const profissionalId = searchParams.get("profissionalId");
  const profissionalNome = searchParams.get("profissionalNome");
  const serviceId = searchParams.get("serviceId");
  const serviceName = searchParams.get("serviceName");
  const scheduledAt = searchParams.get("scheduledAt");
  const temInspiracao = searchParams.get("temInspiracao") === "true";
  const imagemUrlParam = searchParams.get("imagemUrl");
  const data = searchParams.get("data");
  const hora = searchParams.get("hora");

  const [inspiracaoRemovida, setInspiracaoRemovida] = useState(false);
  const [fotoAmpliada, setFotoAmpliada] = useState(false);
  const [dados, setDados] = useState<DadosCliente>(DADOS_INICIAIS);
  const [erros, setErros] = useState<CamposInvalidos>({});
  const [status, setStatus] = useState<StatusConfirmacao>("idle");
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  function handleCampoChange(campo: keyof DadosCliente, valor: string) {
    let valorFinal = valor;
    if (campo === "nomeCompleto") valorFinal = sanitizarNome(valor);
    else if (campo === "observacao") valorFinal = sanitizarObservacao(valor);

    setDados((atual) => ({ ...atual, [campo]: valorFinal }));
    if (campo in erros && erros[campo as keyof CamposInvalidos]) {
      setErros((atual) => ({ ...atual, [campo]: undefined }));
    }
  }

  async function handleSubmit() {
    const errosEncontrados = validarFormulario(dados);
    setErros(errosEncontrados);
    if (Object.keys(errosEncontrados).length > 0) return;

    setStatus("enviando");
    setMensagemErro(null);

    if (!profissionalId || !serviceId || !scheduledAt) return;

    const resultado = await confirmarAgendamento(dados, {
      professionalId: profissionalId,
      serviceId,
      scheduledAt,
    });

    if (resultado.sucesso) {
      setStatus("sucesso");
    } else {
      setStatus("erro");
      setMensagemErro(resultado.mensagem ?? "Não foi possível confirmar o agendamento. Tente novamente.");
    }
  }

  const dataHoraFormatada = formatarDataHora(data, hora);
  const temInspiracaoEfetiva = temInspiracao && !!imagemUrlParam && !inspiracaoRemovida;

  // Acesso direto ou link incompleto: sem esses dados não dá para agendar,
  // então não mostramos um resumo inventado.
  if (!profissionalId || !profissionalNome || !serviceId || !serviceName || !scheduledAt) {
    return (
      <BookingShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <h1 className="font-glacial text-xl font-bold">Agendamento incompleto</h1>
          <p className="mt-2 max-w-xs text-[13px] text-foreground/70">
            Não encontramos o profissional, o serviço ou o horário escolhido. Comece o
            agendamento novamente.
          </p>
          <Link
            href="/pages/client/select-professional"
            className={buttonVariants({ className: "mt-6 h-11 rounded-2xl px-6" })}
          >
            Escolher profissional
          </Link>
        </div>
      </BookingShell>
    );
  }

  if (status === "sucesso") {
    return (
      <BookingShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <CheckCircle2 className="mb-4 size-14 text-emerald-500" />
          <h1 className="font-glacial text-xl font-bold">Agendamento confirmado!</h1>
          <p className="mt-2 max-w-xs text-[13px] text-foreground/70">
            Enviamos os detalhes para {dados.email}. Nos vemos em {dataHoraFormatada}.
          </p>
        </div>
      </BookingShell>
    );
  }

  return (
    <BookingShell>
      <header className="mb-2 flex items-center">
        <BackButton fallbackHref="/pages/client/addinspiration" />
      </header>

      <h1 className="mb-1 mt-2 font-glacial text-2xl font-extrabold md:text-3xl">
        Confirme seu agendamento
      </h1>
      <p className="mb-6 text-[13px] text-foreground/70 md:text-sm">
        Confira os dados abaixo e preencha seu cadastro
      </p>

      <BookingSummary
        resumo={{
          profissionalNome,
          servico: serviceName,
          dataHora: dataHoraFormatada,
          inspiracaoLabel: temInspiracaoEfetiva ? "Imagem enviada" : "Nenhuma",
          imagemUrl: temInspiracaoEfetiva ? imagemUrlParam ?? undefined : undefined,
        }}
        onAbrirFotoInspiracao={() => setFotoAmpliada(true)}
        onRemoverInspiracao={() => setInspiracaoRemovida(true)}
      />

      <ClientForm
        dados={dados}
        erros={erros}
        status={status}
        mensagemErro={mensagemErro}
        onCampoChange={handleCampoChange}
        onSubmit={handleSubmit}
      />

      {fotoAmpliada && imagemUrlParam && (
        <PhotoViewer url={imagemUrlParam} onClose={() => setFotoAmpliada(false)} />
      )}
    </BookingShell>
  );
}