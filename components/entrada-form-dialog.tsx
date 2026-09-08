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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mascararCpfCnpj, validarCpfOuCnpj } from "@/lib/cpf-cnpj";
import { usePainel } from "@/lib/painel-store";
import { Entrada } from "@/lib/types";
import { converterValorInput, formatarValorInput } from "@/lib/utils";

type FormularioEntrada = Omit<Entrada, "id" | "criadoEm" | "atualizadoEm">;

const entradaVazia: FormularioEntrada = {
  clienteNome: "",
  documento: "",
  produto: "",
  quantidade: 1,
  tecido: "",
  modelo: "",
  placaGola: "",
  dataEntrada: new Date().toISOString().slice(0, 10),
  previsaoEntrega: "",
  status: "falta_gabaritar",
  valor: 0,
};

interface EntradaFormDialogProps {
  entradaExistente?: Entrada;
  trigger?: React.ReactNode;
  /** Uso controlado (ex: acionado a partir de um menu de ações). Se omitido, o componente controla seu próprio estado. */
  open?: boolean;
  onOpenChange?: (aberto: boolean) => void;
}

export function EntradaFormDialog({
  entradaExistente,
  trigger,
  open,
  onOpenChange,
}: EntradaFormDialogProps) {
  const { adicionarEntrada, atualizarEntrada } = usePainel();
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
  const [form, setForm] = React.useState<FormularioEntrada>(entradaVazia);
  const [valorTexto, setValorTexto] = React.useState("");
  const [erroDocumento, setErroDocumento] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (aberto) {
      setForm(
        entradaExistente
          ? {
              clienteNome: entradaExistente.clienteNome,
              documento: entradaExistente.documento,
              produto: entradaExistente.produto,
              quantidade: entradaExistente.quantidade,
              tecido: entradaExistente.tecido,
              modelo: entradaExistente.modelo,
              placaGola: entradaExistente.placaGola,
              dataEntrada: entradaExistente.dataEntrada,
              previsaoEntrega: entradaExistente.previsaoEntrega,
              status: entradaExistente.status,
              valor: entradaExistente.valor,
            }
          : entradaVazia
      );
          setValorTexto(entradaExistente ? formatarValorInput(entradaExistente.valor) : "");
      setErroDocumento(null);
    }
  }, [aberto, entradaExistente]);

  const handleDocumentoChange = (valor: string) => {
    setForm((atual) => ({ ...atual, documento: mascararCpfCnpj(valor) }));
    setErroDocumento(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const resultadoValidacao = validarCpfOuCnpj(form.documento);
    if (!resultadoValidacao.valido) {
      setErroDocumento(resultadoValidacao.mensagem ?? "Documento inválido.");
      return;
    }

    const valor = converterValorInput(valorTexto);
    if (!Number.isFinite(valor) || valor < 0) return;
    const dados = { ...form, valor };

    if (entradaExistente) {
      atualizarEntrada(entradaExistente.id, dados);
    } else {
      adicionarEntrada(dados);
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
              Nova entrada
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{entradaExistente ? "Editar entrada" : "Nova entrada"}</DialogTitle>
          <DialogDescription>
            Cadastre os dados do pedido do cliente ou empresa.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="clienteNome">Nome do cliente ou empresa</Label>
              <Input
                id="clienteNome"
                required
                value={form.clienteNome}
                onChange={(e) =>
                  setForm((atual) => ({ ...atual, clienteNome: e.target.value }))
                }
                placeholder="Ex: Maria Confecções LTDA"
              />
            </div>

            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="documento">CPF ou CNPJ</Label>
              <Input
                id="documento"
                required
                inputMode="numeric"
                value={form.documento}
                onChange={(e) => handleDocumentoChange(e.target.value)}
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
              />
              {erroDocumento && (
                <p className="text-xs text-destructive">{erroDocumento}</p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="produto">Produto</Label>
              <Input
                id="produto"
                required
                value={form.produto}
                onChange={(e) => setForm((atual) => ({ ...atual, produto: e.target.value }))}
                placeholder="Ex: Camisa polo"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="quantidade">Quantidade</Label>
              <Input
                id="quantidade"
                type="number"
                min={1}
                required
                value={form.quantidade}
                onChange={(e) =>
                  setForm((atual) => ({ ...atual, quantidade: Number(e.target.value) }))
                }
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="tecido">Tecido</Label>
              <Input
                id="tecido"
                required
                value={form.tecido}
                onChange={(e) => setForm((atual) => ({ ...atual, tecido: e.target.value }))}
                placeholder="Ex: Piquet"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                required
                value={form.modelo}
                onChange={(e) => setForm((atual) => ({ ...atual, modelo: e.target.value }))}
                placeholder="Ex: Slim"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="placaGola">Placa de gola</Label>
              <Input
                id="placaGola"
                value={form.placaGola}
                onChange={(e) => setForm((atual) => ({ ...atual, placaGola: e.target.value }))}
                placeholder="Ex: Bordada azul"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
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

            <div className="grid gap-1.5">
              <Label htmlFor="dataEntrada">Data de entrada</Label>
              <Input
                id="dataEntrada"
                type="date"
                required
                value={form.dataEntrada}
                onChange={(e) =>
                  setForm((atual) => ({ ...atual, dataEntrada: e.target.value }))
                }
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="previsaoEntrega">Previsão de entrega</Label>
              <Input
                id="previsaoEntrega"
                type="date"
                required
                value={form.previsaoEntrega}
                onChange={(e) =>
                  setForm((atual) => ({ ...atual, previsaoEntrega: e.target.value }))
                }
              />
            </div>

            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="status">Estado do produto</Label>
              <Select
                value={form.status}
                onValueChange={(valor: Entrada["status"]) =>
                  setForm((atual) => ({ ...atual, status: valor }))
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="falta_gabaritar">Falta gabaritar</SelectItem>
                  <SelectItem value="gabaritado">Gabaritado</SelectItem>
                  <SelectItem value="em_producao">Em produção</SelectItem>
                  <SelectItem value="finalizado">Finalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAberto(false)}>
              Cancelar
            </Button>
            <Button type="submit">{entradaExistente ? "Salvar alterações" : "Cadastrar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
