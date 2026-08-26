"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { AdminShell } from "@/components/sections/admin/admin-shell";
import { ProfessionalListItem } from "@/components/sections/manage-professionals/professional-list-item";
import { CreateProfessionalDialog } from "@/components/sections/manage-professionals/create-professional-dialog";
import { EditProfessionalDialog } from "@/components/sections/manage-professionals/edit-professional-dialog";
import { Button } from "@/components/ui/button";
import { excluirProfissional, getProfissionais } from "@/app/mocks/professionals-mock";
import type { Profissional } from "@/types/profissional";

type Status = "loading" | "success" | "error";

export default function ManageProfessionalsPage() {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [dialogCadastroAberto, setDialogCadastroAberto] = useState(false);
  const [profissionalEmEdicao, setProfissionalEmEdicao] = useState<Profissional | null>(null);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);

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

  function handleProfissionalCriado(novo: Profissional) {
    setProfissionais((atual) => [...atual, novo]);
  }

  function handleProfissionalAtualizado(atualizado: Profissional) {
    setProfissionais((atual) =>
      atual.map((p) => (p.id === atualizado.id ? atualizado : p))
    );
  }

  async function handleExcluir(profissional: Profissional) {
    const confirmou = window.confirm(
      `Excluir ${profissional.nome}? Essa ação não pode ser desfeita.`
    );
    if (!confirmou) return;

    setExcluindoId(profissional.id);
    try {
      await excluirProfissional(profissional.id);
      setProfissionais((atual) => atual.filter((p) => p.id !== profissional.id));
    } finally {
      setExcluindoId(null);
    }
  }

  return (
    <AdminShell title="Profissionais">
      <div className="pb-24 md:pb-0">
        {status === "loading" && (
          <p className="text-sm text-muted-foreground" role="status">
            Carregando profissionais…
          </p>
        )}

        {status === "error" && (
          <p className="text-sm text-destructive" role="alert">
            Não foi possível carregar os profissionais agora. Tente novamente em instantes.
          </p>
        )}

        {status === "success" && profissionais.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum profissional cadastrado ainda.</p>
        )}

        {status === "success" && profissionais.length > 0 && (
          <ul className="flex flex-col gap-4">
            {profissionais.map((profissional) => (
              <ProfessionalListItem
                key={profissional.id}
                profissional={profissional}
                onEditar={setProfissionalEmEdicao}
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
              Novo profissional
            </Button>
          </div>
        </div>
      </div>

      <CreateProfessionalDialog
        open={dialogCadastroAberto}
        onOpenChange={setDialogCadastroAberto}
        onCriado={handleProfissionalCriado}
      />

      <EditProfessionalDialog
        key={profissionalEmEdicao?.id ?? "fechado"}
        profissional={profissionalEmEdicao}
        onOpenChange={(open) => {
          if (!open) setProfissionalEmEdicao(null);
        }}
        onSalvo={handleProfissionalAtualizado}
      />

      {excluindoId && (
        <p className="sr-only" role="status">
          Excluindo profissional…
        </p>
      )}
    </AdminShell>
  );
}