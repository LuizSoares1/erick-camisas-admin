export type StatusProducao = "em_desenvolvimento" | "finalizado";

export interface Entrada {
  id: string;
  clienteNome: string;
  documento: string; // CPF ou CNPJ, já formatado
  produto: string;
  quantidade: number;
  tecido: string;
  modelo: string;
  placaGola: string;
  dataEntrada: string; // ISO yyyy-mm-dd
  previsaoEntrega: string; // ISO yyyy-mm-dd
  status: StatusProducao;
  valor: number;
  criadoEm: string; // ISO datetime
  atualizadoEm: string; // ISO datetime
}

export interface Saida {
  id: string;
  produto: string;
  data: string; // ISO yyyy-mm-dd
  valor: number;
  criadoEm: string;
  atualizadoEm: string;
}

export interface PainelData {
  versao: number;
  atualizadoEm: string;
  entradas: Entrada[];
  saidas: Saida[];
}

export const PAINEL_DATA_VERSAO = 1;

export function criarPainelVazio(): PainelData {
  return {
    versao: PAINEL_DATA_VERSAO,
    atualizadoEm: new Date().toISOString(),
    entradas: [],
    saidas: [],
  };
}
