"use client";

import * as React from "react";

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  LayoutDashboard,
  WalletCards,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Shirt,
  Package,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DataActions } from "@/components/data-actions";
import { ThemeToggle } from "@/components/theme-toggle";

import { cn } from "@/lib/utils";

interface AppSidebarProps {
  abaAtiva: "inicio" | "dashboard" | "realizar-venda" | "entradas" | "saidas" | "produtos";
  onMudarAba: (aba: "inicio" | "dashboard" | "realizar-venda" | "entradas" | "saidas" | "produtos") => void;
  nomeArquivo: string | null;
  recolhida: boolean;
  onAlternar: () => void;
}

const itens = [
  { id: "inicio" as const, label: "Início", icon: LayoutDashboard },
  { id: "dashboard" as const, label: "Financeiro", icon: WalletCards },
  { id: "entradas" as const, label: "Vendas", icon: ArrowDownToLine },
  { id: "saidas" as const, label: "Gastos", icon: ArrowUpFromLine },
  { id: "produtos" as const, label: "Produtos", icon: Package },
];

interface MobileSidebarProps {
  abaAtiva: AppSidebarProps["abaAtiva"];
  onMudarAba: AppSidebarProps["onMudarAba"];
}

export function MobileSidebar({ abaAtiva, onMudarAba }: MobileSidebarProps) {
  const [aberta, setAberta] = React.useState(false);

  return (
    <div className="md:hidden">
      <Dialog open={aberta} onOpenChange={setAberta}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-muted-foreground shadow-xs hover:bg-accent hover:text-accent-foreground"
            aria-label="Abrir menu de navegação"
          >
            <Menu className="h-4 w-4" />
          </button>
        </DialogTrigger>
        <DialogContent className="left-0 top-0 h-full max-h-none w-72 max-w-[85vw] translate-x-0 translate-y-0 rounded-none border-y-0 border-l-0 p-0 sm:rounded-none">
          <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
            <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <Shirt className="h-4 w-4" />
              </div>
              <DialogTitle className="text-sm text-sidebar-foreground">EA Produção</DialogTitle>
            </div>
            <nav className="flex flex-1 flex-col gap-1 p-3">
              {itens.map((item) => {
                const Icon = item.icon;
                const ativo = abaAtiva === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onMudarAba(item.id);
                      setAberta(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium",
                      ativo
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
            <div className="border-t border-sidebar-border p-3">
              <div className="mb-3 border-b border-sidebar-border pb-3">
                <ThemeToggle compacto />
              </div>
              <p className="mb-2 text-xs font-medium text-sidebar-foreground/60">Arquivo</p>
              <DataActions compacto />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function AppSidebar({
  abaAtiva,
  onMudarAba,
  nomeArquivo,
  recolhida,
  onAlternar,
}: AppSidebarProps) {
  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:flex",
        recolhida ? "w-16" : "w-60"
      )}
    >
      <div className={cn("flex h-14 items-center border-b border-sidebar-border", recolhida ? "justify-center" : "gap-2 px-4")}>
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
          <Shirt className="h-4 w-4" />
        </div>
        {!recolhida && <span className="text-sm font-semibold">EA Produção</span>}
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-2">
        {itens.map((item) => {
          const Icon = item.icon;
          const ativo = abaAtiva === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onMudarAba(item.id)}
              className={cn(
                "flex items-center rounded-md py-2 text-sm font-medium transition-colors",
                recolhida ? "justify-center px-0" : "gap-2 px-3",
                ativo
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {!recolhida && item.label}
            </button>
          );
        })}
      </nav>

      <div className="flex flex-col gap-2 border-t border-sidebar-border p-3 text-xs text-sidebar-foreground/60">
        {!recolhida && (
          nomeArquivo ? (
            <>
              <p className="font-medium text-sidebar-foreground">Arquivo carregado</p>
              <p className="truncate">{nomeArquivo}</p>
            </>
          ) : (
            <p>Nenhum arquivo carregado. Os dados ficam só nesta sessão até você exportar.</p>
          )
        )}
        <button
          type="button"
          onClick={onAlternar}
          className={cn(
            "flex items-center rounded-md py-2 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            recolhida ? "justify-center" : "gap-2 px-3"
          )}
          title={recolhida ? "Expandir menu" : "Recolher menu"}
          aria-label={recolhida ? "Expandir menu" : "Recolher menu"}
        >
          {recolhida ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          {!recolhida && "Recolher menu"}
        </button>
      </div>
    </aside>
  );
}
