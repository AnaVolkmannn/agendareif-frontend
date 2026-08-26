"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AvatarUploadField } from "@/components/sections/manage-professionals/avatar-upload-field";
import { atualizarProfissional } from "@/app/mocks/professionals-mock";
import type { Profissional } from "@/types/profissional";

interface EditProfessionalDialogProps {
  profissional: Profissional | null;
  onOpenChange: (open: boolean) => void;
  onSalvo: (profissional: Profissional) => void;
}

const FIELD_CLASSES =
  "rounded-lg border-secondary/25 bg-rose-50 text-neutral-900 placeholder:text-neutral-500";

export function EditProfessionalDialog({
  profissional,
  onOpenChange,
  onSalvo,
}: EditProfessionalDialogProps) {
  const [nome, setNome] = useState(profissional?.nome ?? "");
  const [descricao, setDescricao] = useState(profissional?.especialidade ?? "");
  const [foto, setFoto] = useState<File | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function handleSalvar() {
    if (!profissional) return;

    if (!nome.trim()) {
      setErro("Informe o nome do profissional.");
      return;
    }

    setErro(null);
    setSalvando(true);
    try {
      const atualizado = await atualizarProfissional(profissional.id, {
        nome,
        especialidade: descricao,
        foto,
      });
      onSalvo(atualizado);
      onOpenChange(false);
    } catch {
      setErro("Não foi possível salvar as alterações. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={!!profissional} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar profissional</DialogTitle>
        </DialogHeader>

        <AvatarUploadField fotoUrlInicial={profissional?.fotoUrl} onFotoChange={setFoto} />

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-nome">Nome do profissional</Label>
            <Input
              id="edit-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              aria-invalid={!!erro && !nome.trim()}
              className={FIELD_CLASSES}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-descricao">Descrição</Label>
            <Textarea
              id="edit-descricao"
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className={FIELD_CLASSES}
            />
          </div>
        </div>

        {erro && (
          <p className="mt-3 text-[13px] text-destructive" role="alert">
            {erro}
          </p>
        )}

        <Button
          type="button"
          onClick={handleSalvar}
          disabled={salvando}
          className="mt-6 h-11 w-full gap-2 rounded-xl text-[15px] font-semibold"
        >
          {salvando ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Salvando…
            </>
          ) : (
            "Salvar"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}