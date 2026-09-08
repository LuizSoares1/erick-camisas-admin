"use client";

import * as React from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { DataActions } from "@/components/data-actions";
import { EntradaFormDialog } from "@/components/entrada-form-dialog";
import { EntradasTable } from "@/components/entradas-table";
import { SaidaFormDialog } from "@/components/saida-form-dialog";
import { SaidasTable } from "@/components/saidas-table";
import { SummaryCards } from "@/components/summary-cards";
import { PainelProvider, usePainel } from "@/lib/painel-store";

function PainelConteudo() {
  const [aba, setAba] = React.useState<"entradas" | "saidas">("entradas");
  const { nomeArquivo } = usePainel();

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar abaAtiva={aba} onMudarAba={setAba} nomeArquivo={nomeArquivo} />

      <div className="flex flex-1 flex-col">
        <header className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h1 className="text-lg font-semibold">Controle de Produção</h1>
            <p className="text-sm text-muted-foreground">
              Entradas e saídas de pedidos, salvos em um arquivo JSON seu.
            </p>
          </div>
          <DataActions />
        </header>

        <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
          <SummaryCards />

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="inline-flex h-9 items-center gap-1 rounded-lg bg-muted p-1 text-sm">
                <button
                  onClick={() => setAba("entradas")}
                  className={`rounded-md px-3 py-1 font-medium transition-colors ${
                    aba === "entradas"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  Entradas
                </button>
                <button
                  onClick={() => setAba("saidas")}
                  className={`rounded-md px-3 py-1 font-medium transition-colors ${
                    aba === "saidas"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  Saídas
                </button>
              </div>

              {aba === "entradas" ? <EntradaFormDialog /> : <SaidaFormDialog />}
            </div>

            {aba === "entradas" ? <EntradasTable /> : <SaidasTable />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function PaginaPainel() {
  return (
    <PainelProvider>
      <PainelConteudo />
    </PainelProvider>
  );
}
