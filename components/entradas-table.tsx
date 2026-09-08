"use client";

import * as React from "react";
import { MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import { EntradaFormDialog } from "@/components/entrada-form-dialog";
import { usePainel } from "@/lib/painel-store";

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(iso: string) {
  if (!iso) return "-";
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function EntradasTable() {
  const { dados, removerEntrada } = usePainel();
  const [editando, setEditando] = React.useState<null | (typeof dados.entradas)[number]>(
    null
  );

  if (dados.entradas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed py-16 text-center">
        <p className="text-sm font-medium">Nenhuma entrada cadastrada</p>
        <p className="text-xs text-muted-foreground">
          Clique em &quot;Nova entrada&quot; para cadastrar o primeiro pedido.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente/Empresa</TableHead>
            <TableHead>CPF/CNPJ</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>Qtd.</TableHead>
            <TableHead>Tecido</TableHead>
            <TableHead>Modelo</TableHead>
            <TableHead>Placa de gola</TableHead>
            <TableHead>Entrada</TableHead>
            <TableHead>Previsão</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {dados.entradas.map((entrada) => (
            <TableRow key={entrada.id}>
              <TableCell className="font-medium">{entrada.clienteNome}</TableCell>
              <TableCell>{entrada.documento}</TableCell>
              <TableCell>{entrada.produto}</TableCell>
              <TableCell>{entrada.quantidade}</TableCell>
              <TableCell>{entrada.tecido}</TableCell>
              <TableCell>{entrada.modelo}</TableCell>
              <TableCell>{entrada.placaGola || "-"}</TableCell>
              <TableCell>{formatarData(entrada.dataEntrada)}</TableCell>
              <TableCell>{formatarData(entrada.previsaoEntrega)}</TableCell>
              <TableCell>
                <Badge variant={entrada.status === "finalizado" ? "success" : "warning"}>
                  {entrada.status === "finalizado" ? "Finalizado" : "Em desenvolvimento"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">{formatarMoeda(entrada.valor)}</TableCell>
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
                        setEditando(entrada);
                      }}
                    >
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => removerEntrada(entrada.id)}
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
        <EntradaFormDialog
          entradaExistente={editando}
          open={Boolean(editando)}
          onOpenChange={(aberto) => {
            if (!aberto) setEditando(null);
          }}
        />
      )}
    </div>
  );
}
