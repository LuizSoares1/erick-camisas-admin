"use client";

import * as React from "react";
import { AppSidebar, MobileSidebar } from "@/components/app-sidebar";
import { DataActions } from "@/components/data-actions";
import { DashboardOverview } from "@/components/dashboard-overview";
import { RealizarVenda } from "@/components/realizar-venda";
import { OperacoesInicio } from "@/components/operacoes-inicio";
import { VendasTable } from "@/components/vendas-table";
import { SaidaFormDialog } from "@/components/saida-form-dialog";
import { SaidasTable } from "@/components/saidas-table";
import { ProdutoFormDialog } from "@/components/produto-form-dialog";
import { ProdutosTable } from "@/components/produtos-table";
import { ThemeToggle } from "@/components/theme-toggle";
import { PainelProvider, usePainel } from "@/lib/painel-store";

function PainelConteudo() {
  const [aba, setAba] = React.useState<"inicio" | "dashboard" | "realizar-venda" | "entradas" | "saidas" | "produtos">("inicio");
  const [gastoInicioAberto, setGastoInicioAberto] = React.useState(false);
  const [vendaInicioAberta, setVendaInicioAberta] = React.useState(false);
  const [sidebarRecolhida, setSidebarRecolhida] = React.useState(false);
  const { nomeArquivo } = usePainel();
  const mudarAba = (novaAba: typeof aba) => {
    setAba(novaAba);
  };

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar
        abaAtiva={aba}
        onMudarAba={mudarAba}
        nomeArquivo={nomeArquivo}
        recolhida={sidebarRecolhida}
        onAlternar={() => setSidebarRecolhida((atual) => !atual)}
      />

      <div className="flex flex-1 flex-col">
        <header className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <MobileSidebar abaAtiva={aba} onMudarAba={mudarAba} />
            <h1 className="text-lg font-semibold">
              {aba === "inicio" ? "Início" : aba === "dashboard" ? "Financeiro" : aba === "realizar-venda" ? "Realizar Venda" : aba === "entradas" ? "Vendas" : aba === "saidas" ? "Gastos" : "Produtos"}
            </h1>
          </div>
          <div className="hidden items-center gap-4 md:flex">
            <ThemeToggle />
            <DataActions />
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
          {aba === "inicio" && (
            <>
              <OperacoesInicio
                onRealizarVenda={() => setVendaInicioAberta(true)}
                onRegistrarGasto={() => setGastoInicioAberto(true)}
              />
              <RealizarVenda
                open={vendaInicioAberta}
                onOpenChange={setVendaInicioAberta}
              />
              <SaidaFormDialog
                open={gastoInicioAberto}
                onOpenChange={setGastoInicioAberto}
              />
            </>
          )}
          {aba === "dashboard" && <DashboardOverview />}

          {aba === "entradas" && (
            <VendasTable />
          )}

          {aba === "saidas" && (
            <SaidasTable />
          )}

          {aba === "produtos" && (
            <div className="flex flex-col gap-3">
              <div className="flex justify-end">
                <ProdutoFormDialog />
              </div>
              <ProdutosTable />
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
