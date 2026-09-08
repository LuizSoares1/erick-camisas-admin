"use client";

import * as React from "react";
import { MoreHorizontal } from "lucide-react";

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

export function SaidasTable() {
  const { dados, removerSaida } = usePainel();
  const [editando, setEditando] = React.useState<null | (typeof dados.saidas)[number]>(
    null
  );

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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {dados.saidas.map((saida) => (
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
        </TableBody>
      </Table>

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
