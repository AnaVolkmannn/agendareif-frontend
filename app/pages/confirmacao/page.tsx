"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { BackButton } from "@/components/sections/booking/back-button";
import { BookingShell } from "@/components/sections/booking/booking-shell";
import { BookingSummary } from "@/components/sections/confirmation/booking-summary";
import { ClientForm } from "@/components/sections/confirmation/client-form";
import { confirmarAgendamento, getServicoContratado } from "@/lib/api/agendamento";
import { formatarDataHora } from "@/lib/format";
import { validarFormulario, mascararTelefone } from "@/lib/validations";
import type {
  CamposInvalidos,
  DadosCliente,
  StatusConfirmacao,
} from "@/types/agendamento";

const DADOS_INICIAIS: DadosCliente = {
  nomeCompleto: "",
  email: "",
  telefone: "",
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

  const profissionalNome = searchParams.get("profissionalNome") ?? "—";
  const serviceName = searchParams.get("serviceName");
  const temInspiracao = searchParams.get("temInspiracao") === "true";
  const data = searchParams.get("data");
  const hora = searchParams.get("hora");

  const [servico, setServico] = useState<string | null>(null);
  const [dados, setDados] = useState<DadosCliente>(DADOS_INICIAIS);
  const [erros, setErros] = useState<CamposInvalidos>({});
  const [status, setStatus] = useState<StatusConfirmacao>("idle");
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  useEffect(() => {
    // Serviços escolhidos na etapa de seleção chegam pela URL. Se não vierem
    // (ex.: acesso direto), cai no mock para não quebrar a tela.
    if (serviceName) {
      setServico(serviceName);
      return;
    }
    getServicoContratado().then(setServico);
  }, [serviceName]);

  function handleCampoChange(campo: keyof DadosCliente, valor: string) {
    const valorFinal = campo === "telefone" ? mascararTelefone(valor) : valor;
    setDados((atual) => ({ ...atual, [campo]: valorFinal }));
    if (erros[campo]) {
      setErros((atual) => ({ ...atual, [campo]: undefined }));
    }
  }

  async function handleSubmit() {
    const errosEncontrados = validarFormulario(dados);
    setErros(errosEncontrados);
    if (Object.keys(errosEncontrados).length > 0) return;

    setStatus("enviando");
    setMensagemErro(null);

    const resultado = await confirmarAgendamento(dados);

    if (resultado.sucesso) {
      setStatus("sucesso");
    } else {
      setStatus("erro");
      setMensagemErro(resultado.mensagem ?? "Não foi possível confirmar o agendamento. Tente novamente.");
    }
  }

  const dataHoraFormatada = formatarDataHora(data, hora);

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
        <BackButton fallbackHref="/pages/addinspiration" />
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
          servico: servico ?? "Carregando…",
          dataHora: dataHoraFormatada,
          inspiracaoLabel: temInspiracao ? "Imagem enviada" : "Nenhuma",
        }}
      />

      <ClientForm
        dados={dados}
        erros={erros}
        status={status}
        mensagemErro={mensagemErro}
        onCampoChange={handleCampoChange}
        onSubmit={handleSubmit}
      />
    </BookingShell>
  );
}
