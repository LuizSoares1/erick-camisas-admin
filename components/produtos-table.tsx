"use client";

import * as React from "react";
import { MoreHorizontal, Pencil, Package, Search, Trash2 } from "lucide-react";

import { ProdutoFormDialog } from "@/components/produto-form-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePainel } from "@/lib/painel-store";
import { Produto } from "@/lib/types";

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function normalizarTexto(valor: string) {
  return valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function ProdutosTable() {
  const { dados, removerProduto } = usePainel();
  const [busca, setBusca] = React.useState("");
  const [editando, setEditando] = React.useState<Produto | null>(null);

  const produtosFiltrados = dados.produtos.filter((produto) => {
    const termo = normalizarTexto(busca.trim());
    return !termo || normalizarTexto(
      [produto.codigo, produto.nome, produto.tipo, produto.descricao].join(" "),
    ).includes(termo);
  });

  if (dados.produtos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center">
        <Package className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">Nenhum produto cadastrado</p>
        <p className="text-xs text-muted-foreground">
          Clique em &quot;Cadastrar produto&quot; para criar o primeiro item do catálogo.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          placeholder="Buscar por código, produto ou tipo..."
          className="pl-9"
          aria-label="Buscar produtos"
        />
      </div>

      {produtosFiltrados.length === 0 ? (
        <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
          Nenhum produto encontrado para essa busca.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código do Produto</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtosFiltrados.map((produto) => (
                <TableRow key={produto.id}>
                  <TableCell className="font-medium">{produto.codigo}</TableCell>
                  <TableCell>{produto.nome}</TableCell>
                  <TableCell>{produto.tipo}</TableCell>
                  <TableCell className="max-w-xs truncate">{produto.descricao || "-"}</TableCell>
                  <TableCell className="text-right">{formatarMoeda(produto.valor)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Ações para ${produto.nome}`}>
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setEditando(produto)}>
                          <Pencil />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => removerProduto(produto.id)}
                        >
                          <Trash2 />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {editando && (
        <ProdutoFormDialog
          produtoExistente={editando}
          open
          onOpenChange={(aberto) => {
            if (!aberto) setEditando(null);
          }}
        />
      )}
    </div>
  );
}
