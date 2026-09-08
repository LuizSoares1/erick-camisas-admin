"use client";

import { ArrowDownToLine, ArrowUpFromLine, Shirt } from "lucide-react";

import { cn } from "@/lib/utils";

interface AppSidebarProps {
  abaAtiva: "entradas" | "saidas";
  onMudarAba: (aba: "entradas" | "saidas") => void;
  nomeArquivo: string | null;
}

const itens = [
  { id: "entradas" as const, label: "Entradas", icon: ArrowDownToLine },
  { id: "saidas" as const, label: "Saídas", icon: ArrowUpFromLine },
];

export function AppSidebar({ abaAtiva, onMudarAba, nomeArquivo }: AppSidebarProps) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
          <Shirt className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold">EA Produção</span>
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
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
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

      <div className="border-t border-sidebar-border p-3 text-xs text-sidebar-foreground/60">
        {nomeArquivo ? (
          <>
            <p className="font-medium text-sidebar-foreground">Arquivo carregado</p>
            <p className="truncate">{nomeArquivo}</p>
          </>
        ) : (
          <p>Nenhum arquivo carregado. Os dados ficam só nesta sessão até você exportar.</p>
        )}
      </div>
    </aside>
  );
}
