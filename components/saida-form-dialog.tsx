"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePainel } from "@/lib/painel-store";
import { Saida } from "@/lib/types";

type FormularioSaida = Omit<Saida, "id" | "criadoEm" | "atualizadoEm">;

const saidaVazia: FormularioSaida = {
  produto: "",
  data: new Date().toISOString().slice(0, 10),
  valor: 0,
};

interface SaidaFormDialogProps {
  saidaExistente?: Saida;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (aberto: boolean) => void;
}

export function SaidaFormDialog({
  saidaExistente,
  trigger,
  open,
  onOpenChange,
}: SaidaFormDialogProps) {
  const { adicionarSaida, atualizarSaida } = usePainel();
  const [abertoInterno, setAbertoInterno] = React.useState(false);
  const controlado = open !== undefined;
  const aberto = controlado ? Boolean(open) : abertoInterno;
  const setAberto = React.useCallback(
    (valor: boolean) => {
      if (controlado) {
        onOpenChange?.(valor);
      } else {
        setAbertoInterno(valor);
      }
    },
    [controlado, onOpenChange]
  );
  const [form, setForm] = React.useState<FormularioSaida>(saidaVazia);

  React.useEffect(() => {
    if (aberto) {
      setForm(
        saidaExistente
          ? { produto: saidaExistente.produto, data: saidaExistente.data, valor: saidaExistente.valor }
          : saidaVazia
      );
    }
  }, [aberto, saidaExistente]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (saidaExistente) {
      atualizarSaida(saidaExistente.id, form);
    } else {
      adicionarSaida(form);
    }
    setAberto(false);
  };

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      {!controlado && (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button size="sm">
              <Plus />
              Nova saída
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{saidaExistente ? "Editar saída" : "Nova saída"}</DialogTitle>
          <DialogDescription>
            Registre um produto entregue e o valor recebido.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="produtoSaida">Produto</Label>
            <Input
              id="produtoSaida"
              required
              value={form.produto}
              onChange={(e) => setForm((atual) => ({ ...atual, produto: e.target.value }))}
              placeholder="Ex: Camisa polo"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="dataSaida">Data</Label>
            <Input
              id="dataSaida"
              type="date"
              required
              value={form.data}
              onChange={(e) => setForm((atual) => ({ ...atual, data: e.target.value }))}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="valorSaida">Valor (R$)</Label>
            <Input
              id="valorSaida"
              type="number"
              min={0}
              step="0.01"
              required
              value={form.valor}
              onChange={(e) => setForm((atual) => ({ ...atual, valor: Number(e.target.value) }))}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAberto(false)}>
              Cancelar
            </Button>
            <Button type="submit">{saidaExistente ? "Salvar alterações" : "Cadastrar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
