"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SummaryCards } from "@/components/summary-cards";
import { usePainel } from "@/lib/painel-store";
import { StatusProducao } from "@/lib/types";

const STATUS: Array<{ id: StatusProducao; label: string; color: string }> = [
  { id: "falta_gabaritar", label: "Falta gabaritar", color: "#94a3b8" },
  { id: "gabaritado", label: "Gabaritado", color: "#f59e0b" },
  { id: "em_producao", label: "Em produção", color: "#3b82f6" },
  { id: "finalizado", label: "Finalizado", color: "#22c55e" },
];

const PERIODOS = [
  { dias: 7, label: "Últimos 7 dias" },
  { dias: 30, label: "Últimos 30 dias" },
  { dias: 90, label: "Últimos 3 meses" },
];

function formatarData(data: string) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}`;
}

function formatarDataLonga(data: string) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

function adicionarDias(data: string, quantidade: number) {
  const atual = new Date(`${data}T12:00:00`);
  atual.setDate(atual.getDate() + quantidade);
  return atual.toISOString().slice(0, 10);
}

function criarDadosGrafico(
  entradas: ReturnType<typeof usePainel>["dados"]["entradas"],
  dias: number
) {
  if (entradas.length === 0) return [];

  const datas = entradas.map((entrada) => entrada.dataEntrada).sort();
  const dataFinal = datas[datas.length - 1];
  const dataInicial = adicionarDias(dataFinal, -(dias - 1));
  const linhas = [];

  for (let indice = 0; indice < dias; indice += 1) {
    const data = adicionarDias(dataInicial, indice);
    const linha: Record<string, number | string> = {
      data,
      label: formatarData(data),
    };

    for (const status of STATUS) {
      linha[status.id] = entradas.filter(
        (entrada) => entrada.dataEntrada === data && entrada.status === status.id
      ).length;
    }

    linhas.push(linha);
  }

  return linhas;
}

export function DashboardOverview() {
  const { dados } = usePainel();
  const [periodo, setPeriodo] = React.useState(30);
  const dadosGrafico = criarDadosGrafico(dados.entradas, periodo);
  const contagemStatus = STATUS.map((status) => ({
    ...status,
    total: dados.entradas.filter((entrada) => entrada.status === status.id).length,
  }));

  return (
    <div className="flex flex-col gap-6">
      <SummaryCards />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {contagemStatus.map((status) => (
          <Card key={status.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle>{status.label}</CardTitle>
                <Badge style={{ backgroundColor: `${status.color}20`, color: status.color }}>
                  Status
                </Badge>
              </div>
              <CardDescription className="text-3xl">{status.total}</CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              pedido(s) nesta etapa
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="gap-4 border-b sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Evolução dos pedidos
            </CardTitle>
            <CardDescription>
              Entradas registradas por status no período selecionado
            </CardDescription>
          </div>
          <div className="grid grid-cols-3 rounded-md border bg-muted p-1 text-xs sm:flex">
            {PERIODOS.map((item) => (
              <button
                key={item.dias}
                type="button"
                onClick={() => setPeriodo(item.dias)}
                className={`rounded px-2 py-1.5 font-medium transition-colors sm:px-3 ${
                  periodo === item.dias
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="sm:hidden">{item.dias}d</span>
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-5 sm:p-6">
          {dadosGrafico.length === 0 ? (
            <div className="flex h-72 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
              Cadastre uma entrada para visualizar o gráfico.
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dadosGrafico} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    {STATUS.map((status) => (
                      <linearGradient key={status.id} id={`fill-${status.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={status.color} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={status.color} stopOpacity={0.02} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid vertical={false} stroke="currentColor" className="text-border" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} minTickGap={24} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
                  <Tooltip
                    labelFormatter={(_, payload) => {
                      const data = payload?.[0]?.payload?.data;
                      return typeof data === "string" ? formatarDataLonga(data) : "";
                    }}
                    contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)" }}
                  />
                  {STATUS.map((status) => (
                    <Area
                      key={status.id}
                      type="monotone"
                      dataKey={status.id}
                      name={status.label}
                      stroke={status.color}
                      strokeWidth={2}
                      fill={`url(#fill-${status.id})`}
                      stackId="1"
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
