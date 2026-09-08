import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatarValorInput(valor: number) {
  return valor.toFixed(2).replace(".", ",");
}

export function converterValorInput(valor: string) {
  const normalizado = valor.includes(",")
    ? valor.replace(/\./g, "").replace(",", ".")
    : valor;
  return Number(normalizado);
}
