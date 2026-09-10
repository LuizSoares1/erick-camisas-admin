"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePainel } from "@/lib/painel-store";
import { Produto } from "@/lib/types";
import { converterValorInput, formatarValorInput } from "@/lib/utils";

type FormularioProduto = Omit<Produto, "id" | "criadoEm" | "atualizadoEm">;

const produtoVazio: FormularioProduto = {
  codigo: "",
  nome: "",
  tipo: "",
  descricao: "",
  valor: 0,
};

interface ProdutoFormDialogProps {
  produtoExistente?: Produto;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (aberto: boolean) => void;
}

export function ProdutoFormDialog({
  produtoExistente,
  trigger,
  open,
  onOpenChange,
}: ProdutoFormDialogProps) {
  const { adicionarProduto, atualizarProduto } = usePainel();
  const [aberto, setAberto] = React.useState(false);
  const controlado = open !== undefined;
  const dialogAberto = controlado ? Boolean(open) : aberto;
  const definirAberto = (valor: boolean) => {
    if (controlado) {
      onOpenChange?.(valor);
    } else {
      setAberto(valor);
    }
  };
  const [form, setForm] = React.useState<FormularioProduto>(produtoVazio);
  const [valorTexto, setValorTexto] = React.useState("");

  React.useEffect(() => {
    if (!dialogAberto) return;

    setForm(
      produtoExistente
        ? {
            codigo: produtoExistente.codigo,
            nome: produtoExistente.nome,
            tipo: produtoExistente.tipo,
            descricao: produtoExistente.descricao,
            valor: produtoExistente.valor,
          }
        : produtoVazio,
    );
    setValorTexto(produtoExistente ? formatarValorInput(produtoExistente.valor) : "");
  }, [dialogAberto, produtoExistente]);

  const atualizarCampo = (campo: keyof FormularioProduto, valor: string) => {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const valor = converterValorInput(valorTexto);
    if (!Number.isFinite(valor) || valor < 0) return;

    const dados = { ...form, valor };
    if (produtoExistente) {
      atualizarProduto(produtoExistente.id, dados);
    } else {
      adicionarProduto(dados);
    }
    definirAberto(false);
  };

  return (
    <Dialog open={dialogAberto} onOpenChange={definirAberto}>
      {!controlado && (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button size="sm">
              <Plus />
              Cadastrar produto
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{produtoExistente ? "Editar produto" : "Cadastrar produto"}</DialogTitle>
          <DialogDescription>
            Informe os dados do produto para manter seu catálogo organizado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="codigoProduto">Código do Produto</Label>
              <Input
                id="codigoProduto"
                required
                value={form.codigo}
                onChange={(event) => atualizarCampo("codigo", event.target.value)}
                placeholder="Ex: CAM-001"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="nomeProduto">Produto</Label>
              <Input
                id="nomeProduto"
                required
                value={form.nome}
                onChange={(event) => atualizarCampo("nome", event.target.value)}
                placeholder="Ex: Camisa polo"
              />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="tipoProduto">Tipo</Label>
              <Input
                id="tipoProduto"
                required
                value={form.tipo}
                onChange={(event) => atualizarCampo("tipo", event.target.value)}
                placeholder="Ex: Uniforme escolar"
              />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="descricaoProduto">Descrição</Label>
              <textarea
                id="descricaoProduto"
                value={form.descricao}
                onChange={(event) => atualizarCampo("descricao", event.target.value)}
                placeholder="Detalhes, composição ou observações do produto"
                rows={3}
                className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
              />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="valorProduto">Valor (R$)</Label>
              <Input
                id="valorProduto"
                type="text"
                inputMode="decimal"
                required
                placeholder="0,00"
                value={valorTexto}
                onFocus={(event) => event.currentTarget.select()}
                onChange={(event) => setValorTexto(event.target.value.replace(/[^\d,]/g, ""))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => definirAberto(false)}>
              Cancelar
            </Button>
            <Button type="submit">{produtoExistente ? "Salvar alterações" : "Cadastrar produto"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
