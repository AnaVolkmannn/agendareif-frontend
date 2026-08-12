"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { BackButton } from "@/components/sections/booking/back-button";
import { BookingShell } from "@/components/sections/booking/booking-shell";
import { ProfessionalCard } from "@/components/sections/professional/professional-card";
import { markNavigatedWithinApp } from "@/lib/app-nav-state";
import { getProfissionais } from "@/app/mocks/professionals-mock";
import type { Profissional } from "@/types/profissional";

type Status = "loading" | "success" | "error";

export default function SelecProfissionalPage() {
  const router = useRouter();
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let ativo = true;

    setStatus("loading");
    getProfissionais()
      .then((dados) => {
        if (!ativo) return;
        setProfissionais(dados);
        setStatus("success");
      })
      .catch(() => {
        if (!ativo) return;
        setStatus("error");
      });

    return () => {
      ativo = false;
    };
  }, []);

  function handleEscolher(profissional: Profissional) {
    const params = new URLSearchParams({
      profissionalId: profissional.id,
      profissionalNome: profissional.nome,
    });
    markNavigatedWithinApp();
    router.push(`/selecinspiracao?${params.toString()}`);
  }

  return (
    <BookingShell>
      <header className="mb-2 flex items-center">
        <BackButton fallbackHref="/" />
      </header>

      <h1 className="mb-1 mt-2 font-glacial text-2xl font-extrabold md:text-3xl">
        Escolha o profissional
      </h1>
      <p className="mb-6 text-[13px] text-white/70 md:text-sm">
        Selecione o profissional que irá lhe atender
      </p>

      {status === "loading" && (
        <p className="text-sm text-white/70" role="status">
          Carregando profissionais…
        </p>
      )}

      {status === "error" && (
        <p className="text-sm text-red-300" role="alert">
          Não foi possível carregar os profissionais agora. Tente novamente em instantes.
        </p>
      )}

      {status === "success" && profissionais.length === 0 && (
        <p className="text-sm text-white/70">Nenhum profissional disponível no momento.</p>
      )}

      {status === "success" && profissionais.length > 0 && (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {profissionais.map((profissional) => (
            <li key={profissional.id}>
              <ProfessionalCard profissional={profissional} onEscolher={handleEscolher} />
            </li>
          ))}
        </ul>
      )}
    </BookingShell>
  );
}