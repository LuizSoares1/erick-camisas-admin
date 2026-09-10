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
import { DatePicker } from "@/components/ui/date-picker";
import { usePainel } from "@/lib/painel-store";
import { Saida } from "@/lib/types";
import { converterValorInput, formatarValorInput } from "@/lib/utils";

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
  const [valorTexto, setValorTexto] = React.useState("");

  React.useEffect(() => {
    if (aberto) {
      setForm(
        saidaExistente
          ? { produto: saidaExistente.produto, data: saidaExistente.data, valor: saidaExistente.valor }
          : saidaVazia
      );
      setValorTexto(saidaExistente ? formatarValorInput(saidaExistente.valor) : "");
    }
  }, [aberto, saidaExistente]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const valor = converterValorInput(valorTexto);
    if (!Number.isFinite(valor) || valor < 0) return;
    const dados = { ...form, valor };
    if (saidaExistente) {
      atualizarSaida(saidaExistente.id, dados);
    } else {
      adicionarSaida(dados);
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
              Registrar gasto
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{saidaExistente ? "Editar gasto" : "Registrar gasto"}</DialogTitle>
          <DialogDescription>
            Registre o produto, a data e o valor do gasto.
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
            <DatePicker
              id="dataSaida"
              required
              value={form.data}
              onChange={(valor) => setForm((atual) => ({ ...atual, data: valor }))}
              placeholder="Selecione a data"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="valorSaida">Valor (R$)</Label>
            <Input
              id="valorSaida"
              type="text"
              inputMode="decimal"
              required
              placeholder="0,00"
              value={valorTexto}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) =>
                setValorTexto(e.target.value.replace(/[^\d,]/g, ""))
              }
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
