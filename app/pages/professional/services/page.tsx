"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

import { ServiceListItem } from "@/components/sections/my-services/service-list-item";
import { ServiceFormDialog } from "@/components/sections/my-services/service-form-dialog";
import { Button } from "@/components/ui/button";
import { excluirServico, getServices } from "@/app/mocks/services-mock";
import type { Service } from "@/types/service";

type Status = "loading" | "success" | "error";

export default function MyServicesPage() {
  const [servicos, setServicos] = useState<Service[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [dialogCadastroAberto, setDialogCadastroAberto] = useState(false);
  const [servicoEmEdicao, setServicoEmEdicao] = useState<Service | null>(null);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);

  // Não mexe no status aqui dentro: o estado inicial já é "loading".
  useEffect(() => {
    let ativo = true;
    getServices()
      .then((dados) => {
        if (!ativo) return;
        setServicos(dados);
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

  function handleServicoCriado(novo: Service) {
    setServicos((atual) => [...atual, novo]);
  }

  function handleServicoAtualizado(atualizado: Service) {
    setServicos((atual) =>
      atual.map((s) => (s.id === atualizado.id ? atualizado : s)),
    );
  }

  async function handleExcluir(servico: Service) {
    const confirmou = window.confirm(
      `Excluir ${servico.name}? Essa ação não pode ser desfeita.`,
    );
    if (!confirmou) return;

    setExcluindoId(servico.id);
    try {
      await excluirServico(servico.id);
      setServicos((atual) => atual.filter((s) => s.id !== servico.id));
    } finally {
      setExcluindoId(null);
    }
  }

  return (
    <SidebarInset>
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/95 px-4 pb-3 pt-4 backdrop-blur supports-backdrop-filter:bg-background/80 md:px-8">
        <div className="relative flex items-center justify-center">
          <SidebarTrigger className="absolute left-0 size-9 shrink-0 md:hidden" />
          <h1 className="text-center font-glacial text-2xl font-extrabold md:text-3xl">
            Meus Serviços
          </h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-5 md:px-8 md:py-8">
        <div className="pb-24 md:pb-0">
          {status === "loading" && (
            <p className="text-sm text-muted-foreground" role="status">
              Carregando serviços…
            </p>
          )}

          {status === "error" && (
            <p className="text-sm text-destructive" role="alert">
              Não foi possível carregar os serviços agora. Tente novamente em
              instantes.
            </p>
          )}

          {status === "success" && servicos.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum serviço cadastrado ainda.
            </p>
          )}

          {status === "success" && servicos.length > 0 && (
            <ul className="flex flex-col gap-4">
              {servicos.map((servico) => (
                <ServiceListItem
                  key={servico.id}
                  servico={servico}
                  onEditar={setServicoEmEdicao}
                  onExcluir={handleExcluir}
                />
              ))}
            </ul>
          )}

          <div className="fixed inset-x-0 bottom-0 z-20 bg-background/95 p-4 backdrop-blur supports-backdrop-filter:bg-background/80 md:static md:mt-6 md:bg-transparent md:p-0 md:backdrop-blur-none">
            <div className="mx-auto max-w-5xl md:mx-0">
              <Button
                type="button"
                onClick={() => setDialogCadastroAberto(true)}
                className="h-12 w-full gap-2 rounded-xl text-[15px] font-semibold"
              >
                <Plus className="size-4" />
                Novo serviço
              </Button>
            </div>
          </div>
        </div>

        <ServiceFormDialog
          open={dialogCadastroAberto}
          onOpenChange={setDialogCadastroAberto}
          onSalvo={handleServicoCriado}
        />

        <ServiceFormDialog
          key={servicoEmEdicao?.id ?? "fechado"}
          open={!!servicoEmEdicao}
          servico={servicoEmEdicao}
          onOpenChange={(open) => {
            if (!open) setServicoEmEdicao(null);
          }}
          onSalvo={handleServicoAtualizado}
        />

        {excluindoId && (
          <p className="sr-only" role="status">
            Excluindo serviço…
          </p>
        )}
      </main>
    </SidebarInset>
  );
}
