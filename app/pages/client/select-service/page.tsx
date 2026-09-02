"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { BackButton } from "@/components/sections/booking/back-button";
import { BookingShell } from "@/components/sections/booking/booking-shell";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/sections/service/service-card";
import { ServicePhotosDialog } from "@/components/sections/service/service-photos-dialog";
import { markNavigatedWithinApp } from "@/lib/app-nav-state";
import { getServices } from "@/app/mocks/services-mock";
import type { Service } from "@/types/service";

type Status = "loading" | "success" | "error";

export default function ServiceSelectionPage() {
  return (
    <Suspense fallback={null}>
      <ServiceSelectionContent />
    </Suspense>
  );
}

function ServiceSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const professionalId = searchParams.get("profissionalId");
  const serviceIdFromUrl = searchParams.get("serviceId");

  const [services, setServices] = useState<Service[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  // Se a tela for reaberta com o serviço já na URL (voltar/refresh/link
  // compartilhado), a seleção anterior volta marcada.
  const [selectedId, setSelectedId] = useState<string | null>(serviceIdFromUrl);
  const [fotosDoServico, setFotosDoServico] = useState<Service | null>(null);

  // Busca a lista simulando a requisição da API. Não mexe no status aqui
  // dentro: o estado inicial já é "loading" e o retry cuida do próprio reset.
  const fetchServices = useCallback(() => {
    let active = true;

    getServices(professionalId)
      .then((data) => {
        if (!active) return;
        setServices(data);
        setStatus("success");
      })
      .catch(() => {
        if (!active) return;
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [professionalId]);

  useEffect(() => fetchServices(), [fetchServices]);

  function handleRetry() {
    setStatus("loading");
    fetchServices();
  }

  // Espelha a seleção na URL (sem criar entrada no histórico) para que, ao
  // voltar do calendário para cá, o serviço continue marcado.
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedId) {
      params.set("serviceId", selectedId);
    } else {
      params.delete("serviceId");
    }

    const query = params.toString();
    if (query === searchParams.toString()) return;

    router.replace(`/pages/client/select-service${query ? `?${query}` : ""}`, { scroll: false });
  }, [selectedId, searchParams, router]);

  // Seleção única: clicar em outro card troca a escolha, clicar no já
  // selecionado desmarca (e o botão continuar volta a ficar desabilitado).
  function selectService(service: Service) {
    setSelectedId((current) => (current === service.id ? null : service.id));
  }

  function handleContinue() {
    if (!selectedId) return;

    const chosen = services.find((service) => service.id === selectedId);
    if (!chosen) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("serviceId", chosen.id);
    params.set("serviceName", chosen.name);

    markNavigatedWithinApp();
    router.push(`/pages/client/select-scheduling?${params.toString()}`);
  }

  return (
    <BookingShell>
      <header className="mb-2 flex items-center">
        <BackButton fallbackHref="/pages/client/select-professional" />
      </header>

      <h1 className="mb-1 mt-2 font-glacial text-2xl font-extrabold md:text-3xl">
        Escolha o Serviço
      </h1>
      <p className="mb-6 text-[13px] text-foreground/70 md:text-sm">
        Selecione o serviço desejado
      </p>

      {status === "loading" && (
        <p className="text-sm text-foreground/70" role="status">
          Carregando serviços…
        </p>
      )}

      {status === "error" && (
        <div role="alert">
          <p className="text-sm text-red-300">
            Não foi possível carregar os serviços agora. Tente novamente em instantes.
          </p>
          <Button
            type="button"
            variant="link"
            onClick={handleRetry}
            className="mt-2 h-auto px-0 text-sm font-semibold text-foreground underline"
          >
            Tentar novamente
          </Button>
        </div>
      )}

      {status === "success" && services.length === 0 && (
        <p className="text-sm text-foreground/70">Nenhum serviço disponível no momento.</p>
      )}

      {status === "success" && services.length > 0 && (
        <ul className="grid grid-cols-1 gap-4">
          {services.map((service) => (
            <li key={service.id}>
              <ServiceCard
                service={service}
                selected={selectedId === service.id}
                onSelect={selectService}
                onVerFotos={setFotosDoServico}
              />
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto pt-10 md:pt-16">
        <Button
          type="button"
          onClick={handleContinue}
          disabled={!selectedId}
          className="h-11 w-full rounded-2xl text-[15px] font-semibold disabled:opacity-40 md:w-auto md:px-10"
        >
          Continuar
        </Button>
      </div>

      <ServicePhotosDialog
        service={fotosDoServico}
        onOpenChange={(open) => {
          if (!open) setFotosDoServico(null);
        }}
      />
    </BookingShell>
  );
}
