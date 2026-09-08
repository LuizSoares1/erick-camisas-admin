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

  const totalEntradas = dados.entradas.reduce((acc, e) => acc + e.valor, 0);
  const totalSaidas = dados.saidas.reduce((acc, s) => acc + s.valor, 0);
  const saldo = totalEntradas - totalSaidas;
  const cards = [
    {
      titulo: "Total em entradas",
      valor: formatarMoeda(totalEntradas),
      nota: `${dados.entradas.length} pedido(s) cadastrado(s)`,
    },
    {
      titulo: "Total em saídas",
      valor: formatarMoeda(totalSaidas),
      nota: `${dados.saidas.length} lançamento(s)`,
    },
    {
      titulo: "Saldo",
      valor: formatarMoeda(saldo),
      nota: saldo >= 0 ? "Entradas superam as saídas" : "Saídas superam as entradas",
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
