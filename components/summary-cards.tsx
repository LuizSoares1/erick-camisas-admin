"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePainel } from "@/lib/painel-store";

function formatarMoeda(valor: number) {
  const [inteiro, centavos] = Math.abs(valor).toFixed(2).split(".");
  const inteiroFormatado = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${valor < 0 ? "-" : ""}R$ ${inteiroFormatado},${centavos}`;
}

export function SummaryCards() {
  const { dados } = usePainel();

  const totalVendas = dados.vendas.reduce((acc, venda) => acc + venda.valor, 0);
  const totalSaidas = dados.saidas.reduce((acc, s) => acc + s.valor, 0);
  const saldo = totalVendas - totalSaidas;
  const cards = [
    {
      titulo: "Total em vendas",
      valor: formatarMoeda(totalVendas),
      nota: `${dados.vendas.length} venda(s) cadastrada(s)`,
    },
    {
      titulo: "Total em gastos",
      valor: formatarMoeda(totalSaidas),
      nota: `${dados.saidas.length} gasto(s) registrado(s)`,
    },
    {
      titulo: "Saldo",
      valor: formatarMoeda(saldo),
      nota: saldo >= 0 ? "Vendas superam as saídas" : "Saídas superam as vendas",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.titulo}>
          <CardHeader className="pb-2">
            <CardTitle>{card.titulo}</CardTitle>
            <CardDescription>{card.valor}</CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {card.nota}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
