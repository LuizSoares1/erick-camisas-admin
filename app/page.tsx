"use client";

import * as React from "react";

import { AppSidebar, MobileSidebar } from "@/components/app-sidebar";
import { DataActions } from "@/components/data-actions";
import { DashboardOverview } from "@/components/dashboard-overview";
import { EntradaFormDialog } from "@/components/entrada-form-dialog";
import { EntradasTable } from "@/components/entradas-table";
import { SaidaFormDialog } from "@/components/saida-form-dialog";
import { SaidasTable } from "@/components/saidas-table";
import { ThemeToggle } from "@/components/theme-toggle";
import { PainelProvider, usePainel } from "@/lib/painel-store";

function PainelConteudo() {
  const [aba, setAba] = React.useState<"dashboard" | "entradas" | "saidas">("dashboard");
  const [sidebarRecolhida, setSidebarRecolhida] = React.useState(false);
  const { nomeArquivo } = usePainel();

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar
        abaAtiva={aba}
        onMudarAba={setAba}
        nomeArquivo={nomeArquivo}
        recolhida={sidebarRecolhida}
        onAlternar={() => setSidebarRecolhida((atual) => !atual)}
      />

      <div className="flex flex-1 flex-col">
        <header className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <MobileSidebar abaAtiva={aba} onMudarAba={setAba} />
            <h1 className="text-lg font-semibold">
              {aba === "dashboard" ? "Dashboard" : aba === "entradas" ? "Entradas" : "Saídas"}
            </h1>
          </div>
          <div className="hidden items-center gap-4 md:flex">
            <ThemeToggle />
            <DataActions />
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
          {aba === "dashboard" && <DashboardOverview />}

          {aba === "entradas" && (
            <div className="flex flex-col gap-3">
              <div className="flex justify-end">
                <EntradaFormDialog />
              </div>
              <EntradasTable />
            </div>
          )}

          {aba === "saidas" && (
            <div className="flex flex-col gap-3">
              <div className="flex justify-end">
                <SaidaFormDialog />
              </div>
              <SaidasTable />
            </div>
          )}
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
