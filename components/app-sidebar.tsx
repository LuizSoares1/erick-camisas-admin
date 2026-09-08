"use client";

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  PanelLeftClose,
  PanelLeftOpen,
  Shirt,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface AppSidebarProps {
  abaAtiva: "entradas" | "saidas";
  onMudarAba: (aba: "entradas" | "saidas") => void;
  nomeArquivo: string | null;
  recolhida: boolean;
  onAlternar: () => void;
}

const itens = [
  { id: "entradas" as const, label: "Entradas", icon: ArrowDownToLine },
  { id: "saidas" as const, label: "Saídas", icon: ArrowUpFromLine },
];

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
