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

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SummaryCards } from "@/components/summary-cards";
import { usePainel } from "@/lib/painel-store";

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

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function adicionarDias(data: string, quantidade: number) {
  const atual = new Date(`${data}T12:00:00`);
  atual.setDate(atual.getDate() + quantidade);
  return atual.toISOString().slice(0, 10);
}

function criarDadosGrafico(
  vendas: ReturnType<typeof usePainel>["dados"]["vendas"],
  gastos: ReturnType<typeof usePainel>["dados"]["saidas"],
  dias: number
) {
  if (vendas.length === 0 && gastos.length === 0) return [];

  const datas = [
    ...vendas.map((venda) => venda.dataVenda),
    ...gastos.map((gasto) => gasto.data),
  ].sort();
  const dataFinal = datas[datas.length - 1];
  const dataInicial = adicionarDias(dataFinal, -(dias - 1));
  const linhas = [];

  for (let indice = 0; indice < dias; indice += 1) {
    const data = adicionarDias(dataInicial, indice);
    const linha: Record<string, number | string> = {
      data,
      label: formatarData(data),
    };

    linha.vendas = vendas
      .filter((venda) => venda.dataVenda === data)
      .reduce((total, venda) => total + venda.valor, 0);
    linha.gastos = gastos
      .filter((gasto) => gasto.data === data)
      .reduce((total, gasto) => total + gasto.valor, 0);

    linhas.push(linha);
  }

  return linhas;
}

export function DashboardOverview() {
  const { dados } = usePainel();
  const [periodo, setPeriodo] = React.useState(30);
  const dadosGrafico = criarDadosGrafico(dados.vendas, dados.saidas, periodo);

  return (
    <div className="flex flex-col gap-6">
      <SummaryCards />

      <Card className="overflow-hidden">
        <CardHeader className="gap-4 border-b sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Movimentação financeira
            </CardTitle>
            <CardDescription>
              Valores de vendas e gastos no período selecionado
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
              Registre uma venda ou gasto para visualizar o gráfico.
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dadosGrafico} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fill-vendas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="fill-gastos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="currentColor" className="text-border" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} minTickGap={24} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
                  <Tooltip
                    labelFormatter={(_, payload) => {
                      const data = payload?.[0]?.payload?.data;
                      return typeof data === "string" ? formatarDataLonga(data) : "";
                    }}
                    formatter={(valor) => typeof valor === "number" ? formatarMoeda(valor) : valor}
                    contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)" }}
                  />
                  <Area type="monotone" dataKey="vendas" name="Vendas" stroke="#2563eb" strokeWidth={2} fill="url(#fill-vendas)" />
                  <Area type="monotone" dataKey="gastos" name="Gastos" stroke="#dc2626" strokeWidth={2} fill="url(#fill-gastos)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
