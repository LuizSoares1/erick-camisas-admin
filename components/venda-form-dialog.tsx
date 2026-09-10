"use client";

import * as React from "react";
import { Pencil, Plus, ShoppingCart, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mascararCpfCnpj, validarCpfOuCnpj } from "@/lib/cpf-cnpj";
import { usePainel } from "@/lib/painel-store";
import { StatusProducao, Venda, VendaItem } from "@/lib/types";

type ItemComId = VendaItem & { id: string };
type FormularioVenda = {
  clienteNome: string;
  documento: string;
  codigoProduto: string;
  placaGola: string;
  tamanho: string;
  quantidade: number;
  dataVenda: string;
  previsaoEntrega: string;
  formaPagamento: string;
  status: StatusProducao;
};

const vendaVazia: FormularioVenda = {
  clienteNome: "",
  documento: "",
  codigoProduto: "",
  placaGola: "",
  tamanho: "",
  quantidade: 1,
  dataVenda: new Date().toISOString().slice(0, 10),
  previsaoEntrega: "",
  formaPagamento: "pix",
  status: "falta_gabaritar",
};

function moeda(valor: number) { return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
function gerarId() { return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }

const statusOpcoes: { valor: StatusProducao; label: string }[] = [
  { valor: "falta_gabaritar", label: "Falta gabaritar" },
  { valor: "gabaritado", label: "Gabaritado" },
  { valor: "em_producao", label: "Em produção" },
  { valor: "finalizado", label: "Finalizado" },
];

interface VendaFormDialogProps {
  vendaExistente?: Venda;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (aberto: boolean) => void;
}

export function VendaFormDialog({ vendaExistente, trigger, open, onOpenChange }: VendaFormDialogProps) {
  const { dados, adicionarVenda, atualizarVenda } = usePainel();
  const [abertoInterno, setAbertoInterno] = React.useState(false);
  const controlado = open !== undefined;
  const aberto = controlado ? Boolean(open) : abertoInterno;
  const setAberto = (valor: boolean) => controlado ? onOpenChange?.(valor) : setAbertoInterno(valor);
  const [form, setForm] = React.useState<FormularioVenda>(vendaVazia);
  const [itens, setItens] = React.useState<ItemComId[]>([]);
  const [itemEditandoId, setItemEditandoId] = React.useState<string | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);
  const produtoSelecionado = dados.produtos.find((produto) => produto.codigo === form.codigoProduto.trim());
  const valorItem = produtoSelecionado ? produtoSelecionado.valor * form.quantidade : 0;
  const valorTotal = itens.reduce((total, item) => total + item.valorTotal, 0);
  const quantidadeTotal = itens.reduce((total, item) => total + item.quantidade, 0);

  const limparProduto = () => {
    setForm((atual) => ({ ...atual, codigoProduto: "", placaGola: "", tamanho: "", quantidade: 1 }));
    setItemEditandoId(null);
  };

  React.useEffect(() => {
    if (!aberto) return;
    const itensExistentes: ItemComId[] = vendaExistente?.itens?.length
      ? vendaExistente.itens.map((item) => ({ ...item, id: gerarId() }))
      : vendaExistente
        ? [{ codigoProduto: "", produto: vendaExistente.produto, tipo: vendaExistente.tipo, placaGola: vendaExistente.placaGola, tamanho: vendaExistente.tamanho, quantidade: vendaExistente.quantidade, valorUnitario: vendaExistente.quantidade ? vendaExistente.valor / vendaExistente.quantidade : vendaExistente.valor, valorTotal: vendaExistente.valor, id: gerarId() }]
        : [];
    setForm(vendaExistente ? { clienteNome: vendaExistente.clienteNome, documento: vendaExistente.documento, codigoProduto: "", placaGola: "", tamanho: "", quantidade: 1, dataVenda: vendaExistente.dataVenda, previsaoEntrega: vendaExistente.previsaoEntrega, formaPagamento: vendaExistente.formaPagamento, status: vendaExistente.status ?? "falta_gabaritar" } : vendaVazia);
    setItens(itensExistentes);
    setItemEditandoId(null);
    setErro(null);
  }, [aberto, vendaExistente]);

  const atualizarCampo = (campo: keyof FormularioVenda, valor: string | number) => {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErro(null);
  };

  const adicionarOuSalvarItem = () => {
    if (!produtoSelecionado) { setErro("Informe o código de um produto cadastrado."); return; }
    if (!form.quantidade || form.quantidade < 1) { setErro("Informe uma quantidade válida."); return; }
    if (!form.tamanho.trim()) { setErro("Informe o tamanho do produto."); return; }
    const item = { codigoProduto: produtoSelecionado.codigo, produto: produtoSelecionado.nome, tipo: produtoSelecionado.tipo, placaGola: form.placaGola, tamanho: form.tamanho, quantidade: form.quantidade, valorUnitario: produtoSelecionado.valor, valorTotal: valorItem };
    setItens((atuais) => itemEditandoId ? atuais.map((atual) => atual.id === itemEditandoId ? { ...item, id: atual.id } : atual) : [...atuais, { ...item, id: gerarId() }]);
    limparProduto();
    setErro(null);
  };

  const editarItem = (item: ItemComId) => {
    setForm((atual) => ({ ...atual, codigoProduto: item.codigoProduto, placaGola: item.placaGola, tamanho: item.tamanho, quantidade: item.quantidade }));
    setItemEditandoId(item.id);
    setErro(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!itens.length) { setErro("Adicione pelo menos um produto à venda."); return; }
    if (form.documento.trim()) {
      const resultado = validarCpfOuCnpj(form.documento);
      if (!resultado.valido) { setErro(resultado.mensagem ?? "CPF/CNPJ inválido."); return; }
    }
    if (!form.previsaoEntrega) { setErro("Informe a previsão de entrega."); return; }
    const dadosVenda = {
      clienteNome: form.clienteNome,
      documento: form.documento,
      produto: itens[0].produto,
      tipo: itens[0].tipo,
      placaGola: itens[0].placaGola,
      tamanho: itens[0].tamanho,
      quantidade: quantidadeTotal,
      dataVenda: form.dataVenda,
      previsaoEntrega: form.previsaoEntrega,
      formaPagamento: form.formaPagamento,
      valor: valorTotal,
      observacoes: vendaExistente?.observacoes ?? "",
      status: form.status,
      itens: itens.map(({ id, ...item }) => item),
    };
    if (vendaExistente) atualizarVenda(vendaExistente.id, { ...dadosVenda, numeroComprovante: vendaExistente.numeroComprovante });
    else adicionarVenda(dadosVenda);
    setAberto(false);
  };

  return <Dialog open={aberto} onOpenChange={setAberto}>
    {!controlado && <DialogTrigger asChild>{trigger ?? <Button size="sm"><Plus />Nova venda</Button>}</DialogTrigger>}
    <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
      <DialogHeader><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground"><ShoppingCart className="h-5 w-5" /></div><div><DialogTitle>{vendaExistente ? "Editar venda" : "Nova venda"}</DialogTitle><DialogDescription className="mt-1">Monte o pedido com produtos cadastrados, cliente, pagamento e status.</DialogDescription></div></div></DialogHeader>
      <form onSubmit={handleSubmit} className="grid gap-6">
        <section className="grid gap-4 rounded-lg border p-4"><div><p className="text-sm font-semibold">Dados da venda</p><p className="mt-1 text-xs text-muted-foreground">Informe quem está comprando e quando o pedido foi realizado.</p></div><div className="grid gap-4 sm:grid-cols-2"><div className="grid gap-1.5"><Label htmlFor="clienteVenda">Cliente</Label><Input id="clienteVenda" required value={form.clienteNome} onChange={(e) => atualizarCampo("clienteNome", e.target.value)} /></div><div className="grid gap-1.5"><Label htmlFor="documentoVenda">CPF/CNPJ (opcional)</Label><Input id="documentoVenda" inputMode="numeric" value={form.documento} onChange={(e) => atualizarCampo("documento", mascararCpfCnpj(e.target.value))} placeholder="000.000.000-00" /></div><div className="grid gap-1.5"><Label htmlFor="dataVenda">Data da venda</Label><DatePicker id="dataVenda" required value={form.dataVenda} onChange={(valor) => atualizarCampo("dataVenda", valor)} /></div><div className="grid gap-1.5"><Label htmlFor="previsaoVenda">Previsão de entrega</Label><DatePicker id="previsaoVenda" required value={form.previsaoEntrega} onChange={(valor) => atualizarCampo("previsaoEntrega", valor)} /></div></div></section>
        <section className="grid gap-4 rounded-lg border p-4"><div><p className="text-sm font-semibold">Produtos do pedido</p><p className="mt-1 text-xs text-muted-foreground">Adicione produtos do catálogo e ajuste cada item individualmente.</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><div className="grid gap-1.5"><Label htmlFor="codigoProdutoVendaTabela">Código do produto</Label><Input id="codigoProdutoVendaTabela" required value={form.codigoProduto} onChange={(e) => atualizarCampo("codigoProduto", e.target.value)} placeholder="Ex: CAM-001" /></div><div className="grid gap-1.5"><Label>Produto</Label><Input value={produtoSelecionado?.nome ?? ""} readOnly placeholder="Aguardando código" /></div><div className="grid gap-1.5"><Label>Tipo</Label><Input value={produtoSelecionado?.tipo ?? ""} readOnly placeholder="Aguardando código" /></div><div className="grid gap-1.5"><Label htmlFor="quantidadeVendaTabela">Quantidade</Label><Input id="quantidadeVendaTabela" type="number" min={1} required value={form.quantidade} onChange={(e) => atualizarCampo("quantidade", Number(e.target.value))} /></div><div className="grid gap-1.5"><Label htmlFor="placaGolaVendaTabela">Placa de gola</Label><Input id="placaGolaVendaTabela" value={form.placaGola} onChange={(e) => atualizarCampo("placaGola", e.target.value)} /></div><div className="grid gap-1.5"><Label htmlFor="tamanhoVendaTabela">Tamanho</Label><Input id="tamanhoVendaTabela" required value={form.tamanho} onChange={(e) => atualizarCampo("tamanho", e.target.value)} placeholder="M, G ou GG" /></div><div className="grid gap-1.5"><Label>Valor do item</Label><Input value={produtoSelecionado ? moeda(valorItem) : ""} readOnly placeholder="Aguardando produto" /></div><div className="flex items-end"><Button type="button" variant="outline" className="w-full" onClick={adicionarOuSalvarItem}>{itemEditandoId ? <Pencil /> : <Plus />}{itemEditandoId ? "Salvar item" : "Adicionar item"}</Button></div></div>{erro && <p className="text-sm text-destructive">{erro}</p>}{itens.length > 0 && <div className="overflow-hidden rounded-md border"><div className="border-b bg-muted/40 px-4 py-3 text-sm font-semibold">Itens adicionados</div><div className="divide-y">{itens.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm"><div className="min-w-0"><p className="truncate font-medium">{item.produto} <span className="font-normal text-muted-foreground">({item.tamanho})</span></p><p className="text-xs text-muted-foreground">{item.codigoProduto || "Código não informado"} · {item.quantidade} unidade(s) · {moeda(item.valorUnitario)} cada</p></div><div className="flex items-center gap-2"><span className="font-medium">{moeda(item.valorTotal)}</span><Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label={`Editar ${item.produto}`} onClick={() => editarItem(item)}><Pencil /></Button><Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label={`Remover ${item.produto}`} onClick={() => { if (itemEditandoId === item.id) limparProduto(); setItens((atuais) => atuais.filter((atual) => atual.id !== item.id)); }}><Trash2 /></Button></div></div>)}</div><div className="flex justify-between border-t px-4 py-3 text-sm font-semibold"><span>{quantidadeTotal} unidade(s)</span><span>{moeda(valorTotal)}</span></div></div>}</section>
        <section className="grid gap-4 rounded-lg border p-4"><div><p className="text-sm font-semibold">Pagamento e acompanhamento</p><p className="mt-1 text-xs text-muted-foreground">O status será mostrado na tabela de vendas para acompanhamento do pedido.</p></div><div className="grid gap-4 sm:grid-cols-2"><div className="grid gap-1.5"><Label htmlFor="formaPagamentoVendaTabela">Forma de pagamento</Label><Select value={form.formaPagamento} onValueChange={(valor) => atualizarCampo("formaPagamento", valor)}><SelectTrigger id="formaPagamentoVendaTabela"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pix">PIX</SelectItem><SelectItem value="dinheiro">Dinheiro</SelectItem><SelectItem value="debito">Cartão de débito</SelectItem><SelectItem value="credito">Cartão de crédito</SelectItem><SelectItem value="boleto">Boleto</SelectItem><SelectItem value="outro">Outro</SelectItem></SelectContent></Select></div><div className="grid gap-1.5"><Label htmlFor="statusVendaTabela">Status do pedido</Label><Select value={form.status} onValueChange={(valor: StatusProducao) => atualizarCampo("status", valor)}><SelectTrigger id="statusVendaTabela"><SelectValue /></SelectTrigger><SelectContent>{statusOpcoes.map((status) => <SelectItem key={status.valor} value={status.valor}>{status.label}</SelectItem>)}</SelectContent></Select></div></div></section>
        <DialogFooter><Button type="button" variant="outline" onClick={() => setAberto(false)}><X />Cancelar</Button><Button type="submit">{vendaExistente ? "Salvar alterações" : "Cadastrar venda"}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}