"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal, Search, X } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { SaidaFormDialog } from "@/components/saida-form-dialog";
import { usePainel } from "@/lib/painel-store";

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(iso: string) {
  if (!iso) return "-";
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

const ITENS_POR_PAGINA = 10;

function normalizarTexto(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function SaidasTable() {
  const { dados, removerSaida } = usePainel();
  const [editando, setEditando] = React.useState<null | (typeof dados.saidas)[number]>(
    null
  );
  const [busca, setBusca] = React.useState("");
  const [dataSaida, setDataSaida] = React.useState("");
  const [pagina, setPagina] = React.useState(1);
  const saidasFiltradas = dados.saidas
    .filter((saida) => {
    const textoBusca = normalizarTexto(busca.trim());
      return (
        (!textoBusca || normalizarTexto(saida.produto).includes(textoBusca)) &&
        (!dataSaida || saida.data === dataSaida)
      );
    })
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  const totalPaginas = Math.max(1, Math.ceil(saidasFiltradas.length / ITENS_POR_PAGINA));
  const saidasVisiveis = saidasFiltradas.slice(
    (pagina - 1) * ITENS_POR_PAGINA,
    pagina * ITENS_POR_PAGINA
  );
  const linhasVazias = Math.max(0, ITENS_POR_PAGINA - saidasVisiveis.length);

  React.useEffect(() => {
    setPagina(1);
  }, [busca, dataSaida]);

  React.useEffect(() => {
    if (pagina > totalPaginas) setPagina(totalPaginas);
  }, [pagina, totalPaginas]);

  if (dados.saidas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed py-16 text-center">
        <p className="text-sm font-medium">Nenhuma saída cadastrada</p>
        <p className="text-xs text-muted-foreground">
          Os gastos registrados aparecerão nesta lista.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 rounded-lg border bg-card p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Buscar por produto..."
            className="pl-9"
            aria-label="Buscar saídas"
          />
        </div>
        <DatePicker
          id="filtroDataSaida"
          value={dataSaida}
          onChange={setDataSaida}
          placeholder="Data da saída"
          className="w-full sm:w-44"
        />
        {(busca || dataSaida) && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              setBusca("");
              setDataSaida("");
            }}
            aria-label="Limpar busca e filtro"
            title="Limpar busca e filtro"
          >
            <X />
          </Button>
        )}
      </div>

      {saidasFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed py-16 text-center">
          <p className="text-sm font-medium">Nenhuma saída encontrada</p>
          <p className="text-xs text-muted-foreground">
            Tente ajustar a busca ou a data selecionada.
          </p>
        </div>
      ) : (
    <div className="rounded-lg border">
      <div className="hidden md:block">
      <Table key={`saidas-pagina-${pagina}`}>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {saidasVisiveis.map((saida) => (
            <TableRow key={saida.id}>
              <TableCell className="font-medium">{saida.produto}</TableCell>
              <TableCell>{formatarData(saida.data)}</TableCell>
              <TableCell className="text-right">{formatarMoeda(saida.valor)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Abrir menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        setEditando(saida);
                      }}
                    >
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => removerSaida(saida.id)}
                    >
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {Array.from({ length: linhasVazias }, (_, indice) => (
            <TableRow key={`linha-vazia-${indice}`} aria-hidden="true">
              <TableCell colSpan={4} className="h-12 p-0" />
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>

      <div key={`saidas-mobile-pagina-${pagina}`} className="space-y-3 p-3 md:hidden">
        {saidasVisiveis.map((saida) => (
          <Card key={`mobile-${saida.id}`} className="shadow-none">
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate font-semibold">{saida.produto}</p>
                <p className="text-xs text-muted-foreground">{formatarData(saida.data)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <p className="font-semibold">{formatarMoeda(saida.valor)}</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Abrir menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setEditando(saida); }}>
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onClick={() => removerSaida(saida.id)}>
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPaginas > 1 && (
        <div className="flex items-center justify-between border-t px-3 py-3">
          <p className="text-xs text-muted-foreground">
            Página {pagina} de {totalPaginas}
          </p>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setPagina((atual) => Math.max(1, atual - 1))}
              disabled={pagina === 1}
              aria-label="Página anterior"
              title="Página anterior"
            >
              <ChevronLeft />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setPagina((atual) => Math.min(totalPaginas, atual + 1))}
              disabled={pagina === totalPaginas}
              aria-label="Próxima página"
              title="Próxima página"
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}

      {editando && (
        <SaidaFormDialog
          saidaExistente={editando}
          open={Boolean(editando)}
          onOpenChange={(aberto) => {
            if (!aberto) setEditando(null);
          }}
        />
      )}
    </div>
      )}
    </div>
  );
}
