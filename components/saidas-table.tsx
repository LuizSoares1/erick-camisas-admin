"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

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

export function SaidasTable() {
  const { dados, removerSaida } = usePainel();
  const [editando, setEditando] = React.useState<null | (typeof dados.saidas)[number]>(
    null
  );
  const [pagina, setPagina] = React.useState(1);
  const totalPaginas = Math.max(1, Math.ceil(dados.saidas.length / ITENS_POR_PAGINA));
  const saidasVisiveis = dados.saidas.slice(
    (pagina - 1) * ITENS_POR_PAGINA,
    pagina * ITENS_POR_PAGINA
  );
  const linhasVazias = Math.max(0, ITENS_POR_PAGINA - saidasVisiveis.length);

  React.useEffect(() => {
    if (pagina > totalPaginas) setPagina(totalPaginas);
  }, [pagina, totalPaginas]);

  if (dados.saidas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed py-16 text-center">
        <p className="text-sm font-medium">Nenhuma saída cadastrada</p>
        <p className="text-xs text-muted-foreground">
          Clique em &quot;Nova saída&quot; para registrar uma entrega.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
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
  );
}
