"use client";

import { ArrowUpFromLine, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface OperacoesInicioProps {
  onRealizarVenda: () => void;
  onRegistrarGasto: () => void;
}

export function OperacoesInicio({ onRealizarVenda, onRegistrarGasto }: OperacoesInicioProps) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Operações</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">O que você deseja fazer?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Escolha uma opção para começar um novo lançamento.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex flex-col border-primary/20 bg-primary/[0.03]">
          <CardHeader>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <CardTitle>Realizar Venda</CardTitle>
            <CardDescription>
              Cadastre uma nova venda com produto, cliente, pagamento e entrega.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <Button type="button" onClick={onRealizarVenda} className="w-full sm:w-auto">
              Realizar Venda
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
              <ArrowUpFromLine className="h-5 w-5" />
            </div>
            <CardTitle>Registrar Gasto</CardTitle>
            <CardDescription>
              Registre um gasto informando o produto, a data e o valor.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto">
            <Button type="button" variant="outline" onClick={onRegistrarGasto} className="w-full sm:w-auto">
              Registrar Gasto
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}