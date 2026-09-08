"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";

import { cn } from "@/lib/utils";

const CHAVE_TEMA = "painel-administrativo-tema";

interface ThemeToggleProps {
  compacto?: boolean;
}

export function ThemeToggle({ compacto = false }: ThemeToggleProps) {
  const [escuro, setEscuro] = React.useState(false);

  React.useEffect(() => {
    const salvo = window.localStorage.getItem(CHAVE_TEMA);
    const prefereEscuro = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const temaEscuro = salvo ? salvo === "dark" : prefereEscuro;

    setEscuro(temaEscuro);
    document.documentElement.classList.toggle("dark", temaEscuro);
  }, []);

  const alternarTema = () => {
    const proximo = !escuro;
    setEscuro(proximo);
    document.documentElement.classList.toggle("dark", proximo);
    window.localStorage.setItem(CHAVE_TEMA, proximo ? "dark" : "light");
  };

  return (
    <div className={cn("flex items-center gap-2", compacto && "w-full justify-between")}>
      {compacto && <span className="text-sm font-medium">Tema escuro</span>}
      <button
        type="button"
        role="switch"
        aria-checked={escuro}
        aria-label={escuro ? "Ativar tema claro" : "Ativar tema escuro"}
        title={escuro ? "Ativar tema claro" : "Ativar tema escuro"}
        onClick={alternarTema}
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border border-input p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          escuro ? "bg-primary" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm transition-transform",
            escuro ? "translate-x-5" : "translate-x-0"
          )}
        >
          {escuro ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
        </span>
      </button>
    </div>
  );
}
