"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mascararCpfCnpj, validarCpfOuCnpj } from "@/lib/cpf-cnpj";
import { usePainel } from "@/lib/painel-store";
import { Venda } from "@/lib/types";
import { converterValorInput, formatarValorInput } from "@/lib/utils";

type FormularioVenda = Omit<Venda, "id" | "numeroComprovante" | "criadoEm" | "atualizadoEm">;

const vendaVazia: FormularioVenda = {
  clienteNome: "",
  documento: "",
  produto: "",
  tipo: "",
  placaGola: "",
  tamanho: "",
  quantidade: 1,
  dataVenda: new Date().toISOString().slice(0, 10),
  previsaoEntrega: "",
  formaPagamento: "pix",
  valor: 0,
  observacoes: "",
};

interface VendaFormDialogProps {
  vendaExistente?: Venda;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (aberto: boolean) => void;
}

export function VendaFormDialog({ vendaExistente, trigger, open, onOpenChange }: VendaFormDialogProps) {
  const { adicionarVenda, atualizarVenda } = usePainel();
  const [abertoInterno, setAbertoInterno] = React.useState(false);
  const controlado = open !== undefined;
  const aberto = controlado ? Boolean(open) : abertoInterno;
  const setAberto = (valor: boolean) => controlado ? onOpenChange?.(valor) : setAbertoInterno(valor);
  const [form, setForm] = React.useState<FormularioVenda>(vendaVazia);
  const [valorTexto, setValorTexto] = React.useState("");
  const [erroDocumento, setErroDocumento] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!aberto) return;
    setForm(vendaExistente ? {
      clienteNome: vendaExistente.clienteNome,
      documento: vendaExistente.documento,
      produto: vendaExistente.produto,
      tipo: vendaExistente.tipo,
      placaGola: vendaExistente.placaGola,
      tamanho: vendaExistente.tamanho,
      quantidade: vendaExistente.quantidade,
      dataVenda: vendaExistente.dataVenda,
      previsaoEntrega: vendaExistente.previsaoEntrega,
      formaPagamento: vendaExistente.formaPagamento,
      valor: vendaExistente.valor,
      observacoes: vendaExistente.observacoes,
    } : vendaVazia);
    setValorTexto(vendaExistente ? formatarValorInput(vendaExistente.valor) : "");
    setErroDocumento(null);
  }, [aberto, vendaExistente]);

  const atualizarCampo = (campo: keyof FormularioVenda, valor: string | number) => {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (form.documento.trim()) {
      const resultado = validarCpfOuCnpj(form.documento);
      if (!resultado.valido) {
        setErroDocumento(resultado.mensagem ?? "CPF/CNPJ inválido.");
        return;
      }
    }
    const valor = converterValorInput(valorTexto);
    if (!Number.isFinite(valor) || valor < 0) return;
    const dados = { ...form, valor };
    vendaExistente
      ? atualizarVenda(vendaExistente.id, { ...dados, numeroComprovante: vendaExistente.numeroComprovante })
      : adicionarVenda(dados);
    setAberto(false);
  };

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      {!controlado && <DialogTrigger asChild>{trigger ?? <Button size="sm"><Plus />Nova venda</Button>}</DialogTrigger>}
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{vendaExistente ? "Editar venda" : "Nova venda"}</DialogTitle>
          <DialogDescription>Cadastre os dados da venda e do prazo de entrega.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5"><Label htmlFor="clienteVenda">Cliente</Label><Input id="clienteVenda" required value={form.clienteNome} onChange={(e) => atualizarCampo("clienteNome", e.target.value)} /></div>
            <div className="grid gap-1.5"><Label htmlFor="documentoVenda">CPF/CNPJ (opcional)</Label><Input id="documentoVenda" inputMode="numeric" value={form.documento} onChange={(e) => { atualizarCampo("documento", mascararCpfCnpj(e.target.value)); setErroDocumento(null); }} placeholder="000.000.000-00" />{erroDocumento && <p className="text-xs text-destructive">{erroDocumento}</p>}</div>
            <div className="grid gap-1.5"><Label htmlFor="produtoVenda">Produto</Label><Input id="produtoVenda" required value={form.produto} onChange={(e) => atualizarCampo("produto", e.target.value)} /></div>
            <div className="grid gap-1.5"><Label htmlFor="tipoVenda">Tipo</Label><Input id="tipoVenda" required value={form.tipo} onChange={(e) => atualizarCampo("tipo", e.target.value)} placeholder="Ex: Camisa polo" /></div>
            <div className="grid gap-1.5"><Label htmlFor="quantidadeVenda">Quantidade</Label><Input id="quantidadeVenda" type="number" min={1} required value={form.quantidade} onChange={(e) => atualizarCampo("quantidade", Number(e.target.value))} /></div>
            <div className="grid gap-1.5"><Label htmlFor="dataVenda">Data da Venda</Label><DatePicker id="dataVenda" required value={form.dataVenda} onChange={(valor) => atualizarCampo("dataVenda", valor)} /></div>
            <div className="grid gap-1.5"><Label htmlFor="previsaoVenda">Previsão de entrega</Label><DatePicker id="previsaoVenda" required value={form.previsaoEntrega} onChange={(valor) => atualizarCampo("previsaoEntrega", valor)} /></div>
            <div className="grid gap-1.5"><Label htmlFor="formaPagamento">Forma de pagamento</Label><Select value={form.formaPagamento} onValueChange={(valor) => atualizarCampo("formaPagamento", valor)}><SelectTrigger id="formaPagamento"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pix">PIX</SelectItem><SelectItem value="dinheiro">Dinheiro</SelectItem><SelectItem value="debito">Cartão de débito</SelectItem><SelectItem value="credito">Cartão de crédito</SelectItem><SelectItem value="boleto">Boleto</SelectItem><SelectItem value="outro">Outro</SelectItem></SelectContent></Select></div>
            <div className="grid gap-1.5"><Label htmlFor="valorVenda">Valor (R$)</Label><Input id="valorVenda" required inputMode="decimal" value={valorTexto} onFocus={(e) => e.currentTarget.select()} onChange={(e) => setValorTexto(e.target.value.replace(/[^\d,]/g, ""))} placeholder="0,00" /></div>
          </div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => setAberto(false)}>Cancelar</Button><Button type="submit">{vendaExistente ? "Salvar alterações" : "Cadastrar venda"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
