"use client";

import * as React from "react";
import { FileText, MessageSquareText, MoreHorizontal, Pencil, Search, Trash2 } from "lucide-react";
import { VendaFormDialog } from "@/components/venda-form-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { abrirComprovante } from "@/lib/comprovante";
import { usePainel } from "@/lib/painel-store";
import { Venda } from "@/lib/types";

function moeda(valor: number) { return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
function data(iso: string) { if (!iso) return "-"; const [ano, mes, dia] = iso.split("-"); return `${dia}/${mes}/${ano}`; }
function texto(valor: string) { return valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
function pagamento(valor: string) { return { pix: "PIX", dinheiro: "Dinheiro", debito: "Cartão de débito", credito: "Cartão de crédito", boleto: "Boleto", outro: "Outro" }[valor] ?? valor; }

export function VendasTable() {
  const { dados, atualizarVenda, removerVenda } = usePainel();
  const [busca, setBusca] = React.useState("");
  const [editando, setEditando] = React.useState<Venda | null>(null);
  const [anotando, setAnotando] = React.useState<Venda | null>(null);
  const [observacoes, setObservacoes] = React.useState("");
  const vendas = dados.vendas.filter((venda) => !busca.trim() || texto([venda.numeroComprovante, venda.clienteNome, venda.documento, venda.produto, venda.tipo, venda.tamanho, venda.formaPagamento].join(" ")).includes(texto(busca.trim()))).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));

  React.useEffect(() => setObservacoes(anotando?.observacoes ?? ""), [anotando]);
  const salvarObservacoes = () => {
    if (!anotando) return;
    const { id, criadoEm, atualizadoEm, ...dadosVenda } = anotando;
    atualizarVenda(id, { ...dadosVenda, observacoes });
    setAnotando(null);
  };

  if (dados.vendas.length === 0) return <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed py-16 text-center"><p className="text-sm font-medium">Nenhuma venda cadastrada</p><p className="text-xs text-muted-foreground">As vendas realizadas aparecerão nesta lista.</p></div>;

  const menu = (venda: Venda) => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Ações da venda ${venda.numeroComprovante}`}><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={(e) => { e.preventDefault(); setEditando(venda); }}><Pencil />Editar</DropdownMenuItem><DropdownMenuItem onSelect={(e) => { e.preventDefault(); setAnotando(venda); }}><MessageSquareText />Observações</DropdownMenuItem><DropdownMenuItem onSelect={() => abrirComprovante(venda)}><FileText />Visualizar comprovante</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onSelect={() => removerVenda(venda.id)}><Trash2 />Deletar</DropdownMenuItem></DropdownMenuContent></DropdownMenu>;

  return <div className="flex flex-col gap-3"><div className="relative max-w-xl"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar comprovante, cliente ou produto..." className="pl-9" aria-label="Buscar vendas" /></div><div className="overflow-x-auto rounded-lg border"><div className="hidden min-w-[1180px] md:block"><Table><TableHeader><TableRow><TableHead>N° comprovante</TableHead><TableHead>Cliente</TableHead><TableHead>CPF/CNPJ</TableHead><TableHead>Produto</TableHead><TableHead>Tipo</TableHead><TableHead>Placa de gola</TableHead><TableHead>Tamanho</TableHead><TableHead>Qtd.</TableHead><TableHead>Data da venda</TableHead><TableHead>Previsão</TableHead><TableHead>Pagamento</TableHead><TableHead className="text-right">Valor</TableHead><TableHead className="w-10" /></TableRow></TableHeader><TableBody>{vendas.map((venda) => <TableRow key={venda.id}><TableCell className="font-medium">{venda.numeroComprovante}</TableCell><TableCell>{venda.clienteNome}</TableCell><TableCell>{venda.documento}</TableCell><TableCell>{venda.produto}</TableCell><TableCell>{venda.tipo}</TableCell><TableCell>{venda.placaGola || "-"}</TableCell><TableCell>{venda.tamanho || "-"}</TableCell><TableCell>{venda.quantidade}</TableCell><TableCell>{data(venda.dataVenda)}</TableCell><TableCell>{data(venda.previsaoEntrega)}</TableCell><TableCell>{pagamento(venda.formaPagamento)}</TableCell><TableCell className="text-right">{moeda(venda.valor)}</TableCell><TableCell>{menu(venda)}</TableCell></TableRow>)}</TableBody></Table></div><div className="space-y-3 p-3 md:hidden">{vendas.map((venda) => <Card key={venda.id} className="shadow-none"><CardHeader className="flex flex-row items-start justify-between gap-3 p-4 pb-3"><div className="min-w-0"><p className="truncate font-semibold">{venda.clienteNome}</p><p className="text-xs text-muted-foreground">Comprovante {venda.numeroComprovante}</p></div>{menu(venda)}</CardHeader><CardContent className="grid grid-cols-2 gap-3 p-4 pt-0 text-sm"><div className="col-span-2"><p className="text-xs text-muted-foreground">Produto / tipo</p><p className="font-medium">{venda.produto} · {venda.tipo}</p></div><div><p className="text-xs text-muted-foreground">CPF/CNPJ</p><p>{venda.documento}</p></div><div><p className="text-xs text-muted-foreground">Placa de gola</p><p>{venda.placaGola || "-"}</p></div><div><p className="text-xs text-muted-foreground">Tamanho</p><p>{venda.tamanho || "-"}</p></div><div className="text-right"><p className="text-xs text-muted-foreground">Valor</p><p className="font-semibold">{moeda(venda.valor)}</p></div><div><p className="text-xs text-muted-foreground">Data da venda</p><p>{data(venda.dataVenda)}</p></div><div className="text-right"><p className="text-xs text-muted-foreground">Entrega</p><p>{data(venda.previsaoEntrega)}</p></div><div><p className="text-xs text-muted-foreground">Pagamento</p><p>{pagamento(venda.formaPagamento)}</p></div><div className="text-right"><p className="text-xs text-muted-foreground">Quantidade</p><p>{venda.quantidade}</p></div></CardContent></Card>)}</div></div>{editando && <VendaFormDialog vendaExistente={editando} open onOpenChange={(aberto) => !aberto && setEditando(null)} />}<Dialog open={Boolean(anotando)} onOpenChange={(aberto) => !aberto && setAnotando(null)}><DialogContent><DialogHeader><DialogTitle>Observações da venda</DialogTitle><DialogDescription>{anotando?.clienteNome} · {anotando?.produto}</DialogDescription></DialogHeader><textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={6} autoFocus className="flex h-32 w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50" /><DialogFooter><Button variant="outline" onClick={() => setAnotando(null)}>Cancelar</Button><Button onClick={salvarObservacoes}>Salvar observações</Button></DialogFooter></DialogContent></Dialog></div>;
}
