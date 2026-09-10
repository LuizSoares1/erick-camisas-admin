"use client";

import * as React from "react";
import { CheckCircle2, FileText, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { abrirComprovante } from "@/lib/comprovante";
import { mascararCpfCnpj, validarCpfOuCnpj } from "@/lib/cpf-cnpj";
import { usePainel } from "@/lib/painel-store";
import { Venda } from "@/lib/types";

interface RealizarVendaProps {
  open: boolean;
  onOpenChange: (aberto: boolean) => void;
}

const vendaInicial = {
  codigoProduto: "",
  clienteNome: "",
  documento: "",
  placaGola: "",
  tamanho: "",
  quantidade: 1,
  previsaoEntrega: "",
  formaPagamento: "pix",
};

function moeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function RealizarVenda({ open, onOpenChange }: RealizarVendaProps) {
  const { dados, adicionarVenda } = usePainel();
  const [form, setForm] = React.useState(vendaInicial);
  const [etapa, setEtapa] = React.useState<1 | 2>(1);
  const [erro, setErro] = React.useState<string | null>(null);
  const [vendaFinalizada, setVendaFinalizada] = React.useState<Venda | null>(null);
  const produtoSelecionado = dados.produtos.find((produto) => produto.codigo === form.codigoProduto.trim());
  const valorFinal = produtoSelecionado ? produtoSelecionado.valor * form.quantidade : 0;

  const atualizar = (campo: keyof typeof vendaInicial, valor: string | number) => {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    if (campo === "codigoProduto") setErro(null);
  };

  const finalizarVenda = (event: React.FormEvent) => {
    event.preventDefault();
    if (!produtoSelecionado) {
      setErro("Informe o código de um produto cadastrado.");
      return;
    }
    if (form.documento.trim()) {
      const documento = validarCpfOuCnpj(form.documento);
      if (!documento.valido) {
        setErro(documento.mensagem ?? "CPF/CNPJ inválido.");
        return;
      }
    }

    const venda = adicionarVenda({
      clienteNome: form.clienteNome,
      documento: form.documento,
      produto: produtoSelecionado.nome,
      tipo: produtoSelecionado.tipo,
      placaGola: form.placaGola,
      tamanho: form.tamanho,
      quantidade: form.quantidade,
      dataVenda: new Date().toISOString().slice(0, 10),
      previsaoEntrega: form.previsaoEntrega,
      formaPagamento: form.formaPagamento,
      valor: valorFinal,
      observacoes: "",
    });
    setVendaFinalizada(venda);
    onOpenChange(false);
  };

  const avancarParaCliente = () => {
    if (!produtoSelecionado) {
      setErro("Informe o código de um produto cadastrado.");
      return;
    }
    if (!form.quantidade || form.quantidade < 1) {
      setErro("Informe uma quantidade válida.");
      return;
    }
    if (!form.previsaoEntrega) {
      setErro("Informe a previsão de entrega.");
      return;
    }
    setErro(null);
    setEtapa(2);
  };

  const reiniciar = () => {
    setVendaFinalizada(null);
    setForm(vendaInicial);
    setEtapa(1);
    setErro(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex items-center gap-3 border-b pb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <ShoppingCart className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Realizar Venda</h2>
          <p className="text-sm text-muted-foreground">Preencha os dados do produto e do cliente para finalizar.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <span className={etapa === 1 ? "text-foreground" : ""}>1. Produto e entrega</span>
        <span>/</span>
        <span className={etapa === 2 ? "text-foreground" : ""}>2. Cliente e pagamento</span>
      </div>

      <form onSubmit={finalizarVenda} className="flex flex-col gap-6">
        {etapa === 1 ? <section className="rounded-lg border bg-card p-5">
          <div className="mb-5">
            <p className="text-sm font-semibold">1. Produto e entrega</p>
            <p className="text-sm text-muted-foreground">O produto, tipo e valor são carregados do catálogo.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="grid gap-1.5">
              <Label htmlFor="codigoProdutoVenda">Código do Produto (Registrado)</Label>
              <Input id="codigoProdutoVenda" required value={form.codigoProduto} onChange={(event) => atualizar("codigoProduto", event.target.value)} placeholder="Ex: CAM-001" />
              {form.codigoProduto && !produtoSelecionado && <p className="text-xs text-destructive">Produto não encontrado no catálogo.</p>}
            </div>
            <div className="grid gap-1.5"><Label htmlFor="produtoCarregado">Produto</Label><Input id="produtoCarregado" value={produtoSelecionado?.nome ?? ""} readOnly placeholder="Aguardando código" /></div>
            <div className="grid gap-1.5"><Label htmlFor="tipoCarregado">Tipo</Label><Input id="tipoCarregado" value={produtoSelecionado?.tipo ?? ""} readOnly placeholder="Aguardando código" /></div>
            <div className="grid gap-1.5"><Label htmlFor="placaGolaVenda">Placa de Gola</Label><Input id="placaGolaVenda" value={form.placaGola} onChange={(event) => atualizar("placaGola", event.target.value)} /></div>
            <div className="grid gap-1.5"><Label htmlFor="tamanhoVenda">Tamanho</Label><Input id="tamanhoVenda" required value={form.tamanho} onChange={(event) => atualizar("tamanho", event.target.value)} placeholder="Ex: M, G ou GG" /></div>
            <div className="grid gap-1.5"><Label htmlFor="quantidadeVendaNova">Quantidade</Label><Input id="quantidadeVendaNova" type="number" min={1} required value={form.quantidade} onChange={(event) => atualizar("quantidade", Number(event.target.value))} /></div>
            <div className="grid gap-1.5"><Label htmlFor="previsaoEntregaVenda">Previsão de Entrega</Label><DatePicker id="previsaoEntregaVenda" required value={form.previsaoEntrega} onChange={(valor) => atualizar("previsaoEntrega", valor)} /></div>
            <div className="grid gap-1.5 lg:col-span-3"><Label htmlFor="valorCarregado">Valor final</Label><Input id="valorCarregado" value={produtoSelecionado ? moeda(valorFinal) : ""} readOnly placeholder="Aguardando produto e quantidade" /></div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button type="button" size="lg" onClick={avancarParaCliente}>Próximo</Button>
          </div>
        </section> : <section className="rounded-lg border bg-card p-5">
          <div className="mb-5"><p className="text-sm font-semibold">2. Cliente e pagamento</p><p className="text-sm text-muted-foreground">Informe quem está realizando a compra e como ela será paga.</p></div>
          <div className="mb-5 rounded-md bg-muted/50 p-4"><div className="flex items-center justify-between gap-4"><div><p className="text-xs text-muted-foreground">Venda</p><p className="font-medium">{produtoSelecionado?.nome} · {form.quantidade} unidade(s)</p></div><div className="text-right"><p className="text-xs text-muted-foreground">Valor final</p><p className="text-lg font-semibold">{moeda(valorFinal)}</p></div></div></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5"><Label htmlFor="clienteVendaNova">Nome do Cliente/Empresa</Label><Input id="clienteVendaNova" required value={form.clienteNome} onChange={(event) => atualizar("clienteNome", event.target.value)} /></div>
            <div className="grid gap-1.5"><Label htmlFor="documentoVendaNova">CPF/CNPJ (opcional)</Label><Input id="documentoVendaNova" inputMode="numeric" value={form.documento} onChange={(event) => atualizar("documento", mascararCpfCnpj(event.target.value))} placeholder="000.000.000-00" /></div>
            <div className="grid gap-1.5 sm:max-w-xs"><Label htmlFor="pagamentoVendaNova">Forma de pagamento</Label><Select value={form.formaPagamento} onValueChange={(valor) => atualizar("formaPagamento", valor)}><SelectTrigger id="pagamentoVendaNova"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="credito">Cartão</SelectItem><SelectItem value="pix">PIX</SelectItem><SelectItem value="dinheiro">Dinheiro</SelectItem></SelectContent></Select></div>
          </div>
          <div className="mt-6 flex justify-between gap-2"><Button type="button" variant="outline" onClick={() => { setErro(null); setEtapa(1); }}>Voltar</Button><Button type="submit" size="lg">Finalizar Venda</Button></div>
        </section>}

        {erro && <p className="text-sm text-destructive">{erro}</p>}
      </form>
        </div>
      </DialogContent>
      </Dialog>
      <Dialog open={Boolean(vendaFinalizada)} onOpenChange={(aberto) => !aberto && reiniciar()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="mb-2 flex justify-center"><CheckCircle2 className="h-14 w-14 text-success" /></div>
          <DialogTitle className="text-center text-2xl">Venda finalizada!</DialogTitle>
          <DialogDescription className="text-center">A venda foi registrada com sucesso.</DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border bg-muted/40 p-5 text-center"><p className="text-sm text-muted-foreground">Valor final da venda</p><p className="mt-1 text-3xl font-bold">{vendaFinalizada && moeda(vendaFinalizada.valor)}</p><p className="mt-2 text-xs text-muted-foreground">Comprovante N° {vendaFinalizada?.numeroComprovante}</p></div>
        <DialogFooter className="sm:justify-center"><Button type="button" variant="outline" onClick={() => vendaFinalizada && abrirComprovante(vendaFinalizada)}><FileText />Emitir comprovante</Button><Button type="button" onClick={reiniciar}>Nova venda</Button></DialogFooter>
      </DialogContent>
      </Dialog>
    </>
  );
}