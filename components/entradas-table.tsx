"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EntradaFormDialog } from "@/components/entrada-form-dialog";
import { usePainel } from "@/lib/painel-store";
import { abrirComprovante } from "@/lib/comprovante";
import { StatusProducao } from "@/lib/types";

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(iso: string) {
  if (!iso) return "-";
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

function normalizarTexto(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function rotuloStatus(status: StatusProducao) {
  return status === "falta_gabaritar"
    ? "Falta gabaritar"
    : status === "gabaritado"
      ? "Gabaritado"
      : status === "em_producao"
        ? "Em produção"
        : "Finalizado";
}

const ITENS_POR_PAGINA = 10;

export function EntradasTable() {
  const { dados, removerEntrada } = usePainel();
  const [editando, setEditando] = React.useState<null | (typeof dados.entradas)[number]>(
    null
  );
  const [busca, setBusca] = React.useState("");
  const [filtroStatus, setFiltroStatus] = React.useState<StatusProducao | "todos">("todos");
  const [dataEntrada, setDataEntrada] = React.useState("");
  const [pagina, setPagina] = React.useState(1);

  const entradasFiltradas = dados.entradas.filter((entrada) => {
    const textoBusca = normalizarTexto(busca.trim());
    const textoEntrada = normalizarTexto(
      [
        entrada.clienteNome,
        entrada.documento,
        entrada.produto,
        entrada.tecido,
        entrada.modelo,
        entrada.placaGola,
        rotuloStatus(entrada.status),
      ].join(" ")
    );

    return (
      (!textoBusca || textoEntrada.includes(textoBusca)) &&
      (filtroStatus === "todos" || entrada.status === filtroStatus) &&
      (!dataEntrada || entrada.dataEntrada === dataEntrada)
    );
  });
  const totalPaginas = Math.max(1, Math.ceil(entradasFiltradas.length / ITENS_POR_PAGINA));
  const entradasVisiveis = entradasFiltradas.slice(
    (pagina - 1) * ITENS_POR_PAGINA,
    pagina * ITENS_POR_PAGINA
  );
  const linhasVazias = Math.max(0, ITENS_POR_PAGINA - entradasVisiveis.length);

  React.useEffect(() => {
    setPagina(1);
  }, [busca, filtroStatus, dataEntrada]);

  React.useEffect(() => {
    if (pagina > totalPaginas) setPagina(totalPaginas);
  }, [pagina, totalPaginas]);

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
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 rounded-lg border bg-card p-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Buscar cliente, produto ou documento..."
            className="pl-9"
            aria-label="Buscar entradas"
          />
        </div>
        <Select
          value={filtroStatus}
          onValueChange={(valor: StatusProducao | "todos") => setFiltroStatus(valor)}
        >
          <SelectTrigger className="w-full sm:w-48" aria-label="Filtrar por status">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="falta_gabaritar">Falta gabaritar</SelectItem>
            <SelectItem value="gabaritado">Gabaritado</SelectItem>
            <SelectItem value="em_producao">Em produção</SelectItem>
            <SelectItem value="finalizado">Finalizado</SelectItem>
          </SelectContent>
        </Select>
        <DatePicker
          id="filtroDataEntrada"
          value={dataEntrada}
          onChange={setDataEntrada}
          placeholder="Data de entrada"
          className="w-full sm:w-44"
        />
        {(busca || filtroStatus !== "todos" || dataEntrada) && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              setBusca("");
              setFiltroStatus("todos");
              setDataEntrada("");
            }}
            aria-label="Limpar busca e filtro"
            title="Limpar busca e filtro"
          >
            <X />
          </Button>
        )}
      </div>

      {entradasFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed py-16 text-center">
          <p className="text-sm font-medium">Nenhuma entrada encontrada</p>
          <p className="text-xs text-muted-foreground">
            Tente ajustar a busca ou selecionar outro status.
          </p>
        </div>
      ) : (
      <div className="rounded-lg border">
      <div className="hidden md:block">
      <Table key={`entradas-pagina-${pagina}`}>
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
          {entradasVisiveis.map((entrada) => (
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
                <Badge
                  variant={
                    entrada.status === "gabaritado"
                      ? "warning"
                      : entrada.status === "em_producao"
                        ? "info"
                        : entrada.status === "finalizado"
                          ? "success"
                          : "secondary"
                  }
                >
                  {rotuloStatus(entrada.status)}
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
                      <Pencil />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => abrirComprovante(entrada)}>
                      <FileText />
                      Gerar comprovante
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => removerEntrada(entrada.id)}
                    >
                      <Trash2 />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {Array.from({ length: linhasVazias }, (_, indice) => (
            <TableRow key={`linha-vazia-${indice}`} aria-hidden="true">
              <TableCell colSpan={12} className="h-12 p-0" />
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>

      <div key={`entradas-mobile-pagina-${pagina}`} className="space-y-3 p-3 md:hidden">
        {entradasVisiveis.map((entrada) => (
          <Card key={`mobile-${entrada.id}`} className="shadow-none">
            <CardHeader className="flex flex-row items-start justify-between gap-3 p-4 pb-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{entrada.clienteNome}</p>
                <p className="truncate text-xs text-muted-foreground">{entrada.documento}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="-mr-2 -mt-2 h-8 w-8 shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Abrir menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setEditando(entrada); }}>
                    <Pencil />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => abrirComprovante(entrada)}>
                    <FileText />
                    Gerar comprovante
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => removerEntrada(entrada.id)}>
                    <Trash2 />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-4 gap-y-3 p-4 pt-0 text-sm">
              <div className="col-span-2 min-w-0">
                <p className="text-xs text-muted-foreground">Produto</p>
                <p className="truncate font-medium">{entrada.produto}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge variant={entrada.status === "gabaritado" ? "warning" : entrada.status === "em_producao" ? "info" : entrada.status === "finalizado" ? "success" : "secondary"}>
                  {rotuloStatus(entrada.status)}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Valor</p>
                <p className="font-semibold">{formatarMoeda(entrada.valor)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Quantidade</p>
                <p>{entrada.quantidade}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Entrada</p>
                <p>{formatarData(entrada.dataEntrada)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Previsão</p>
                <p>{formatarData(entrada.previsaoEntrega)}</p>
              </div>
              <div className="min-w-0 text-right">
                <p className="text-xs text-muted-foreground">Modelo / tecido</p>
                <p className="truncate">{entrada.modelo} / {entrada.tecido}</p>
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
        <EntradaFormDialog
          entradaExistente={editando}
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
