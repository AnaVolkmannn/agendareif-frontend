"use client";

import { useId, useState } from "react";
import type { ChangeEvent } from "react";
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
import { ServicePhotosField } from "@/components/sections/my-services/service-photos-field";
import { mascararPreco, numeroParaPreco, precoParaNumero } from "@/lib/validations";
import { atualizarServico, criarServico } from "@/app/mocks/services-mock";
import type { Service } from "@/types/service";

interface ServiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = cadastro de um novo serviço. */
  servico?: Service | null;
  onSalvo: (servico: Service) => void;
}

interface Erros {
  nome?: string;
  duracao?: string;
  preco?: string;
}

const FIELD_CLASSES =
  "rounded-lg border-secondary/25 bg-rose-50 text-neutral-900 placeholder:text-neutral-500";

export function ServiceFormDialog({
  open,
  onOpenChange,
  servico = null,
  onSalvo,
}: ServiceFormDialogProps) {
  const fieldId = useId();
  const editando = !!servico;

  const [nome, setNome] = useState(servico?.name ?? "");
  const [descricao, setDescricao] = useState(servico?.description ?? "");
  const [duracao, setDuracao] = useState(
    servico?.durationMin ? String(servico.durationMin) : ""
  );
  const [preco, setPreco] = useState(servico ? numeroParaPreco(servico.price) : "");
  const [fotos, setFotos] = useState<string[]>(servico?.photos ?? []);
  const [erros, setErros] = useState<Erros>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  function handlePrecoChange(event: ChangeEvent<HTMLInputElement>) {
    setPreco(mascararPreco(event.target.value));
  }

  function validar(): boolean {
    const novosErros: Erros = {};
    if (!nome.trim()) novosErros.nome = "Informe o nome do serviço.";

    if (!duracao.trim()) novosErros.duracao = "Informe a duração.";
    else if (Number(duracao) <= 0) novosErros.duracao = "A duração deve ser maior que zero.";

    if (!preco.trim()) novosErros.preco = "Informe o preço do serviço.";
    else if (precoParaNumero(preco) <= 0) novosErros.preco = "O preço deve ser maior que zero.";

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function handleSalvar() {
    if (!validar()) return;

    const dados = {
      name: nome,
      description: descricao,
      durationMin: Number(duracao),
      price: precoParaNumero(preco),
      photos: fotos,
    };

    setErroGeral(null);
    setSalvando(true);
    try {
      const salvo = servico
        ? await atualizarServico(servico.id, dados)
        : await criarServico(dados);

      onSalvo(salvo);
      if (!editando) resetForm();
      onOpenChange(false);
    } catch {
      setErroGeral(
        editando
          ? "Não foi possível salvar as alterações. Tente novamente."
          : "Não foi possível cadastrar o serviço. Tente novamente.",
      );
    } finally {
      setSalvando(false);
    }
  }

  function resetForm() {
    setNome("");
    setDescricao("");
    setDuracao("");
    setPreco("");
    setFotos([]);
    setErros({});
    setErroGeral(null);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(novoEstado) => {
        if (!novoEstado && !editando) resetForm();
        onOpenChange(novoEstado);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editando ? "Editar serviço" : "Novo serviço"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${fieldId}-nome`}>Nome do serviço</Label>
            <Input
              id={`${fieldId}-nome`}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              aria-invalid={!!erros.nome}
              className={FIELD_CLASSES}
            />
            {erros.nome && (
              <p className="text-xs text-destructive" role="alert">
                {erros.nome}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${fieldId}-duracao`}>Duração (min)</Label>
              <Input
                id={`${fieldId}-duracao`}
                inputMode="numeric"
                value={duracao}
                onChange={(e) => setDuracao(e.target.value.replace(/\D/g, "").slice(0, 3))}
                aria-invalid={!!erros.duracao}
                className={FIELD_CLASSES}
              />
              {erros.duracao && (
                <p className="text-xs text-destructive" role="alert">
                  {erros.duracao}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${fieldId}-preco`}>Preço</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">
                  R$
                </span>
                <Input
                  id={`${fieldId}-preco`}
                  inputMode="numeric"
                  value={preco}
                  onChange={handlePrecoChange}
                  aria-invalid={!!erros.preco}
                  className={`${FIELD_CLASSES} pl-9`}
                />
              </div>
              {erros.preco && (
                <p className="text-xs text-destructive" role="alert">
                  {erros.preco}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${fieldId}-descricao`}>Descrição do serviço</Label>
            <Textarea
              id={`${fieldId}-descricao`}
              rows={5}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className={FIELD_CLASSES}
            />
          </div>

          <ServicePhotosField fotos={fotos} onFotosChange={setFotos} />
        </div>

        {erroGeral && (
          <p className="mt-3 text-[13px] text-destructive" role="alert">
            {erroGeral}
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
              {editando ? "Salvando…" : "Registrando…"}
            </>
          ) : (
            "Registrar"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
