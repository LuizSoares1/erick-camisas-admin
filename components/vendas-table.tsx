"use client";

import * as React from "react";
import { Eye, FileText, MessageSquareText, MoreHorizontal, Pencil, Search, Trash2 } from "lucide-react";
import { VendaFormDialog } from "@/components/venda-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { abrirComprovante } from "@/lib/comprovante";
import { usePainel } from "@/lib/painel-store";
import { StatusProducao, Venda } from "@/lib/types";

function moeda(valor: number) { return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
function data(iso: string) { if (!iso) return "-"; const [ano, mes, dia] = iso.split("-"); return `${dia}/${mes}/${ano}`; }
function texto(valor: string) { return valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
function pagamento(valor: string) { return { pix: "PIX", dinheiro: "Dinheiro", debito: "Cartão de débito", credito: "Cartão de crédito", boleto: "Boleto", outro: "Outro" }[valor] ?? valor; }
function produtosDaVenda(venda: Venda) { return venda.itens?.map((item) => item.produto).join(", ") || venda.produto; }
function rotuloStatus(status?: StatusProducao) { return status === "gabaritado" ? "Gabaritado" : status === "em_producao" ? "Em produção" : status === "finalizado" ? "Finalizado" : "Falta gabaritar"; }
function varianteStatus(status?: StatusProducao) { return status === "gabaritado" ? "warning" : status === "em_producao" ? "info" : status === "finalizado" ? "success" : "secondary"; }

export function VendasTable() {
  const { dados, atualizarVenda, removerVenda } = usePainel();
  const [busca, setBusca] = React.useState("");
  const [editando, setEditando] = React.useState<Venda | null>(null);
  const [detalhando, setDetalhando] = React.useState<Venda | null>(null);
  const [anotando, setAnotando] = React.useState<Venda | null>(null);
  const [observacoes, setObservacoes] = React.useState("");
  const vendas = dados.vendas.filter((venda) => !busca.trim() || texto([venda.numeroComprovante, venda.clienteNome, venda.documento, produtosDaVenda(venda), venda.tipo, venda.tamanho, venda.formaPagamento, rotuloStatus(venda.status)].join(" ")).includes(texto(busca.trim()))).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));

  React.useEffect(() => setObservacoes(anotando?.observacoes ?? ""), [anotando]);
  const salvarObservacoes = () => {
    if (!anotando) return;
    const { id, criadoEm, atualizadoEm, ...dadosVenda } = anotando;
    atualizarVenda(id, { ...dadosVenda, observacoes });
    setAnotando(null);
  };
  if (dados.vendas.length === 0) return <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed py-16 text-center"><p className="text-sm font-medium">Nenhuma venda cadastrada</p><p className="text-xs text-muted-foreground">As vendas realizadas aparecerão nesta lista.</p></div>;

  const menu = (venda: Venda) => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Ações da venda ${venda.numeroComprovante}`}><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={(e) => { e.preventDefault(); setDetalhando(venda); }}><Eye />Ver detalhes</DropdownMenuItem><DropdownMenuItem onSelect={(e) => { e.preventDefault(); setEditando(venda); }}><Pencil />Editar</DropdownMenuItem><DropdownMenuItem onSelect={(e) => { e.preventDefault(); setAnotando(venda); }}><MessageSquareText />Observações</DropdownMenuItem><DropdownMenuItem onSelect={() => abrirComprovante(venda)}><FileText />Visualizar comprovante</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onSelect={() => removerVenda(venda.id)}><Trash2 />Deletar</DropdownMenuItem></DropdownMenuContent></DropdownMenu>;

  return <div className="flex flex-col gap-3">
    <div className="relative max-w-xl"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar comprovante, cliente, produto ou status..." className="pl-9" aria-label="Buscar vendas" /></div>
    <div className="overflow-x-auto rounded-lg border">
      <div className="hidden min-w-[1000px] md:block"><Table><TableHeader><TableRow><TableHead>N° comprovante</TableHead><TableHead>Cliente</TableHead><TableHead>CPF/CNPJ</TableHead><TableHead>Data da venda</TableHead><TableHead>Previsão</TableHead><TableHead>Status</TableHead><TableHead>Pagamento</TableHead><TableHead className="text-right">Valor</TableHead><TableHead className="w-10" /></TableRow></TableHeader><TableBody>{vendas.map((venda) => <TableRow key={venda.id}><TableCell className="font-medium">{venda.numeroComprovante}</TableCell><TableCell>{venda.clienteNome}</TableCell><TableCell>{venda.documento}</TableCell><TableCell>{data(venda.dataVenda)}</TableCell><TableCell>{data(venda.previsaoEntrega)}</TableCell><TableCell><Badge variant={varianteStatus(venda.status)}>{rotuloStatus(venda.status)}</Badge></TableCell><TableCell>{pagamento(venda.formaPagamento)}</TableCell><TableCell className="text-right">{moeda(venda.valor)}</TableCell><TableCell>{menu(venda)}</TableCell></TableRow>)}</TableBody></Table></div>
      <div className="space-y-3 p-3 md:hidden">{vendas.map((venda) => <Card key={venda.id} className="shadow-none"><CardHeader className="flex flex-row items-start justify-between gap-3 p-4 pb-3"><div className="min-w-0"><p className="truncate font-semibold">{venda.clienteNome}</p><p className="text-xs text-muted-foreground">Comprovante {venda.numeroComprovante}</p></div>{menu(venda)}</CardHeader><CardContent className="grid grid-cols-2 gap-3 p-4 pt-0 text-sm"><div className="col-span-2"><p className="text-xs text-muted-foreground">Status</p><Badge variant={varianteStatus(venda.status)}>{rotuloStatus(venda.status)}</Badge></div><div className="col-span-2"><p className="text-xs text-muted-foreground">Produto</p><p className="font-medium">{produtosDaVenda(venda)}</p></div><div><p className="text-xs text-muted-foreground">CPF/CNPJ</p><p>{venda.documento || "-"}</p></div><div className="text-right"><p className="text-xs text-muted-foreground">Valor</p><p className="font-semibold">{moeda(venda.valor)}</p></div><div><p className="text-xs text-muted-foreground">Data da venda</p><p>{data(venda.dataVenda)}</p></div><div className="text-right"><p className="text-xs text-muted-foreground">Entrega</p><p>{data(venda.previsaoEntrega)}</p></div><div><p className="text-xs text-muted-foreground">Pagamento</p><p>{pagamento(venda.formaPagamento)}</p></div></CardContent></Card>)}</div>
    </div>
    {editando && <VendaFormDialog vendaExistente={editando} open onOpenChange={(aberto) => !aberto && setEditando(null)} />}
    <Dialog open={Boolean(detalhando)} onOpenChange={(aberto) => !aberto && setDetalhando(null)}><DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle>Detalhes da venda</DialogTitle><DialogDescription>Comprovante {detalhando?.numeroComprovante} · {detalhando?.clienteNome}</DialogDescription></DialogHeader>{detalhando && <div className="grid gap-5 text-sm"><div className="grid gap-3 sm:grid-cols-2"><div><p className="text-xs text-muted-foreground">Status</p><Badge variant={varianteStatus(detalhando.status)}>{rotuloStatus(detalhando.status)}</Badge></div><div><p className="text-xs text-muted-foreground">CPF/CNPJ</p><p>{detalhando.documento || "Não informado"}</p></div><div><p className="text-xs text-muted-foreground">Data da venda</p><p>{data(detalhando.dataVenda)}</p></div><div><p className="text-xs text-muted-foreground">Previsão de entrega</p><p>{data(detalhando.previsaoEntrega)}</p></div><div><p className="text-xs text-muted-foreground">Pagamento</p><p>{pagamento(detalhando.formaPagamento)}</p></div></div><div className="overflow-hidden rounded-md border"><div className="border-b bg-muted/40 px-4 py-3 font-medium">Produtos</div>{(detalhando.itens?.length ? detalhando.itens : [{ produto: detalhando.produto, tipo: detalhando.tipo, placaGola: detalhando.placaGola, tamanho: detalhando.tamanho, quantidade: detalhando.quantidade, valorTotal: detalhando.valor }]).map((item, indice) => <div key={`${item.produto}-${indice}`} className="flex items-start justify-between gap-4 border-b px-4 py-3 last:border-b-0"><div><p className="font-medium">{item.produto}</p><p className="text-xs text-muted-foreground">{item.tipo} · Placa de gola: {item.placaGola || "-"} · Tamanho: {item.tamanho || "-"}</p></div><div className="shrink-0 text-right"><p>{item.quantidade} unidade(s)</p><p className="font-medium">{moeda(item.valorTotal)}</p></div></div>)}</div><div className="flex justify-between border-t pt-3 font-semibold"><span>Total</span><span>{moeda(detalhando.valor)}</span></div></div>}<DialogFooter><Button variant="outline" onClick={() => setDetalhando(null)}>Fechar</Button></DialogFooter></DialogContent></Dialog>
    <Dialog open={Boolean(anotando)} onOpenChange={(aberto) => !aberto && setAnotando(null)}><DialogContent><DialogHeader><DialogTitle>Observações da venda</DialogTitle><DialogDescription>{anotando?.clienteNome} · {anotando?.produto}</DialogDescription></DialogHeader><textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={6} autoFocus className="flex h-32 w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50" /><DialogFooter><Button variant="outline" onClick={() => setAnotando(null)}>Cancelar</Button><Button onClick={salvarObservacoes}>Salvar observações</Button></DialogFooter></DialogContent></Dialog>
  </div>;
}