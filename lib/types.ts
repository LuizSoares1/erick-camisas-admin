export type StatusProducao =
  | "falta_gabaritar"
  | "gabaritado"
  | "em_producao"
  | "finalizado";


  
export interface Entrada {
  id: string;
  clienteNome: string;
  documento: string; // CPF ou CNPJ, já formatado
  produto: string;
  quantidade: number;
  tecido: string;
  modelo: string;
  placaGola: string;
  observacoes: string;
  dataEntrada: string; // ISO yyyy-mm-dd
  previsaoEntrega: string; // ISO yyyy-mm-dd
  status: StatusProducao;
  valor: number;
  criadoEm: string; // ISO datetime
  atualizadoEm: string; // ISO datetime
}

export interface Venda {
  id: string;
  numeroComprovante: string;
  clienteNome: string;
  documento: string;
  produto: string;
  tipo: string;
  placaGola: string;
  tamanho: string;
  quantidade: number;
  dataVenda: string;
  previsaoEntrega: string;
  formaPagamento: string;
  valor: number;
  observacoes: string;
  status?: StatusProducao;
  itens?: VendaItem[];
  criadoEm: string;
  atualizadoEm: string;
}

export interface VendaItem {
  codigoProduto: string;
  produto: string;
  tipo: string;
  placaGola: string;
  tamanho: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface Saida {
  id: string;
  produto: string;
  data: string; // ISO yyyy-mm-dd
  valor: number;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Produto {
  id: string;
  codigo: string;
  nome: string;
  tipo: string;
  descricao: string;
  valor: number;
  criadoEm: string;
  atualizadoEm: string;
}

export interface PainelData {
  versao: number;
  atualizadoEm: string;
  entradas: Entrada[];
  saidas: Saida[];
  produtos: Produto[];
  vendas: Venda[];
}

export const PAINEL_DATA_VERSAO = 1;

export function criarPainelVazio(): PainelData {
  return {
    versao: PAINEL_DATA_VERSAO,
    atualizadoEm: new Date().toISOString(),
    entradas: [],
    saidas: [],
    produtos: [],
    vendas: [],
  };
}
