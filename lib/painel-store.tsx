"use client";

import * as React from "react";

import {
  Entrada,
  PainelData,
  Produto,
  Saida,
  Venda,
  StatusProducao,
  criarPainelVazio,
  PAINEL_DATA_VERSAO,
} from "@/lib/types";

type FileSystemFileHandleLike = {
  createWritable: () => Promise<{
    write: (data: string) => Promise<void>;
    close: () => Promise<void>;
  }>;
  getFile: () => Promise<File>;
};

interface PainelContextValue {
  dados: PainelData;
  carregado: boolean;
  nomeArquivo: string | null;
  suportaSalvarDireto: boolean;
  adicionarEntrada: (entrada: Omit<Entrada, "id" | "criadoEm" | "atualizadoEm">) => void;
  atualizarEntrada: (id: string, entrada: Omit<Entrada, "id" | "criadoEm" | "atualizadoEm">) => void;
  removerEntrada: (id: string) => void;
  adicionarSaida: (saida: Omit<Saida, "id" | "criadoEm" | "atualizadoEm">) => void;
  atualizarSaida: (id: string, saida: Omit<Saida, "id" | "criadoEm" | "atualizadoEm">) => void;
  removerSaida: (id: string) => void;
  adicionarProduto: (produto: Omit<Produto, "id" | "criadoEm" | "atualizadoEm">) => void;
  atualizarProduto: (id: string, produto: Omit<Produto, "id" | "criadoEm" | "atualizadoEm">) => void;
  removerProduto: (id: string) => void;
  adicionarVenda: (venda: Omit<Venda, "id" | "numeroComprovante" | "criadoEm" | "atualizadoEm">) => Venda;
  atualizarVenda: (id: string, venda: Omit<Venda, "id" | "criadoEm" | "atualizadoEm">) => void;
  removerVenda: (id: string) => void;
  exportarJson: () => Promise<void>;
  importarJson: (arquivo: File) => Promise<void>;
  abrirEconectarArquivo: () => Promise<void>;
}

const PainelContext = React.createContext<PainelContextValue | null>(null);
const CHAVE_PERSISTENCIA = "painel-administrativo-dados";

function gerarId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function validarPainelData(json: unknown): json is PainelData {
  if (!json || typeof json !== "object") return false;
  const dados = json as Partial<PainelData>;
  return Array.isArray(dados.entradas) && Array.isArray(dados.saidas);
}

function migrarStatus(status: unknown): StatusProducao {
  if (status === "finalizado") return "finalizado";
  if (status === "gabaritado") return "gabaritado";
  if (status === "em_producao") return "em_producao";
  return "falta_gabaritar";
}

export function PainelProvider({ children }: { children: React.ReactNode }) {
  const [dados, setDados] = React.useState<PainelData>(criarPainelVazio());
  const [carregado, setCarregado] = React.useState(false);
  const [nomeArquivo, setNomeArquivo] = React.useState<string | null>(null);
  const [suportaSalvarDireto, setSuportaSalvarDireto] = React.useState(false);
  const fileHandleRef = React.useRef<FileSystemFileHandleLike | null>(null);

  React.useEffect(() => {
    setSuportaSalvarDireto("showOpenFilePicker" in window);
  }, []);

  React.useEffect(() => {
    try {
      const salvo = window.localStorage.getItem(CHAVE_PERSISTENCIA);
      if (!salvo) {
        setCarregado(true);
        return;
      }

      const estado = JSON.parse(salvo) as {
        dados?: unknown;
        nomeArquivo?: unknown;
      };
      if (!validarPainelData(estado.dados)) {
        setCarregado(true);
        return;
      }

      setDados({
        versao: estado.dados.versao ?? PAINEL_DATA_VERSAO,
        atualizadoEm: estado.dados.atualizadoEm ?? new Date().toISOString(),
        entradas: estado.dados.entradas.map((entrada) => ({
          ...entrada,
          observacoes: entrada.observacoes ?? "",
          status: migrarStatus(entrada.status),
        })),
        saidas: estado.dados.saidas,
        produtos: Array.isArray(estado.dados.produtos) ? estado.dados.produtos : [],
        vendas: Array.isArray(estado.dados.vendas)
          ? estado.dados.vendas.map((venda) => ({
              ...venda,
              placaGola: venda.placaGola ?? "",
              tamanho: venda.tamanho ?? "",
            }))
          : estado.dados.entradas.map((entrada) => ({
              id: entrada.id,
              numeroComprovante: entrada.id.slice(0, 8).toUpperCase(),
              clienteNome: entrada.clienteNome,
              documento: entrada.documento,
              produto: entrada.produto,
              tipo: entrada.modelo || "Não informado",
              placaGola: entrada.placaGola ?? "",
              tamanho: "",
              quantidade: entrada.quantidade,
              dataVenda: entrada.dataEntrada,
              previsaoEntrega: entrada.previsaoEntrega,
              formaPagamento: "Não informado",
              valor: entrada.valor,
              observacoes: entrada.observacoes ?? "",
              criadoEm: entrada.criadoEm,
              atualizadoEm: entrada.atualizadoEm,
            })),
      });
      setCarregado(true);
      if (typeof estado.nomeArquivo === "string") {
        setNomeArquivo(estado.nomeArquivo);
      }
    } catch {
      window.localStorage.removeItem(CHAVE_PERSISTENCIA);
      setCarregado(true);
    }
  }, []);

  React.useEffect(() => {
    if (!carregado) return;

    try {
      window.localStorage.setItem(
        CHAVE_PERSISTENCIA,
        JSON.stringify({ dados, nomeArquivo })
      );
    } catch {
      // O armazenamento pode estar bloqueado ou indisponível no navegador.
    }
  }, [carregado, dados, nomeArquivo]);

  const persistir = React.useCallback(
    (mutador: (atual: PainelData) => PainelData) => {
      setDados((atual) =>
        mutador({
          ...atual,
          atualizadoEm: new Date().toISOString(),
        })
      );
    },
    []
  );

  const adicionarEntrada: PainelContextValue["adicionarEntrada"] = (entrada) => {
    const agora = new Date().toISOString();
    persistir((atual) => ({
      ...atual,
      entradas: [
        ...atual.entradas,
        { ...entrada, id: gerarId(), criadoEm: agora, atualizadoEm: agora },
      ],
    }));
  };

  const atualizarEntrada: PainelContextValue["atualizarEntrada"] = (id, entrada) => {
    const agora = new Date().toISOString();
    persistir((atual) => ({
      ...atual,
      entradas: atual.entradas.map((item) =>
        item.id === id ? { ...item, ...entrada, atualizadoEm: agora } : item
      ),
    }));
  };

  const removerEntrada: PainelContextValue["removerEntrada"] = (id) => {
    persistir((atual) => ({
      ...atual,
      entradas: atual.entradas.filter((item) => item.id !== id),
    }));
  };

  const adicionarSaida: PainelContextValue["adicionarSaida"] = (saida) => {
    const agora = new Date().toISOString();
    persistir((atual) => ({
      ...atual,
      saidas: [
        ...atual.saidas,
        { ...saida, id: gerarId(), criadoEm: agora, atualizadoEm: agora },
      ],
    }));
  };

  const atualizarSaida: PainelContextValue["atualizarSaida"] = (id, saida) => {
    const agora = new Date().toISOString();
    persistir((atual) => ({
      ...atual,
      saidas: atual.saidas.map((item) =>
        item.id === id ? { ...item, ...saida, atualizadoEm: agora } : item
      ),
    }));
  };

  const removerSaida: PainelContextValue["removerSaida"] = (id) => {
    persistir((atual) => ({
      ...atual,
      saidas: atual.saidas.filter((item) => item.id !== id),
    }));
  };

  const adicionarProduto: PainelContextValue["adicionarProduto"] = (produto) => {
    const agora = new Date().toISOString();
    persistir((atual) => ({
      ...atual,
      produtos: [
        ...atual.produtos,
        { ...produto, id: gerarId(), criadoEm: agora, atualizadoEm: agora },
      ],
    }));
  };

  const atualizarProduto: PainelContextValue["atualizarProduto"] = (id, produto) => {
    const agora = new Date().toISOString();
    persistir((atual) => ({
      ...atual,
      produtos: atual.produtos.map((item) =>
        item.id === id ? { ...item, ...produto, atualizadoEm: agora } : item
      ),
    }));
  };

  const removerProduto: PainelContextValue["removerProduto"] = (id) => {
    persistir((atual) => ({
      ...atual,
      produtos: atual.produtos.filter((item) => item.id !== id),
    }));
  };

  const adicionarVenda: PainelContextValue["adicionarVenda"] = (venda) => {
    const agora = new Date().toISOString();
    const id = gerarId();
    const novaVenda: Venda = {
      ...venda,
      id,
      numeroComprovante: id.slice(0, 8).toUpperCase(),
      criadoEm: agora,
      atualizadoEm: agora,
    };
    persistir((atual) => ({
      ...atual,
      vendas: [...atual.vendas, novaVenda],
    }));
    return novaVenda;
  };

  const atualizarVenda: PainelContextValue["atualizarVenda"] = (id, venda) => {
    const agora = new Date().toISOString();
    persistir((atual) => ({
      ...atual,
      vendas: atual.vendas.map((item) =>
        item.id === id ? { ...item, ...venda, atualizadoEm: agora } : item
      ),
    }));
  };

  const removerVenda: PainelContextValue["removerVenda"] = (id) => {
    persistir((atual) => ({
      ...atual,
      vendas: atual.vendas.filter((item) => item.id !== id),
    }));
  };

  const serializar = React.useCallback((): string => {
    const payload: PainelData = {
      ...dados,
      versao: PAINEL_DATA_VERSAO,
      atualizadoEm: new Date().toISOString(),
    };
    return JSON.stringify(payload, null, 2);
  }, [dados]);

  // Exporta o JSON: se o navegador suportar a File System Access API e já
  // houver um arquivo conectado, sobrescreve o mesmo arquivo. Caso
  // contrário, baixa um novo arquivo .json (funciona em qualquer navegador).
  const exportarJson: PainelContextValue["exportarJson"] = async () => {
    const conteudo = serializar();

    if (fileHandleRef.current) {
      const writable = await fileHandleRef.current.createWritable();
      await writable.write(conteudo);
      await writable.close();
      return;
    }

    const blob = new Blob([conteudo], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dataFormatada = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = nomeArquivo ?? `painel-dados-${dataFormatada}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const carregarConteudo = (conteudo: string, nome: string | null) => {
    const json = JSON.parse(conteudo);
    if (!validarPainelData(json)) {
      throw new Error(
        "Arquivo inválido: o JSON não contém os campos 'entradas' e 'saidas'."
      );
    }
    setDados({
      versao: json.versao ?? PAINEL_DATA_VERSAO,
      atualizadoEm: json.atualizadoEm ?? new Date().toISOString(),
      entradas: json.entradas.map((entrada) => ({
        ...entrada,
        observacoes: entrada.observacoes ?? "",
        status: migrarStatus(entrada.status),
      })),
      saidas: json.saidas,
      produtos: Array.isArray(json.produtos) ? json.produtos : [],
      vendas: Array.isArray(json.vendas)
        ? json.vendas.map((venda) => ({
            ...venda,
            placaGola: venda.placaGola ?? "",
            tamanho: venda.tamanho ?? "",
          }))
        : json.entradas.map((entrada) => ({
            id: entrada.id,
            numeroComprovante: entrada.id.slice(0, 8).toUpperCase(),
            clienteNome: entrada.clienteNome,
            documento: entrada.documento,
            produto: entrada.produto,
            tipo: entrada.modelo || "Não informado",
            placaGola: entrada.placaGola ?? "",
            tamanho: "",
            quantidade: entrada.quantidade,
            dataVenda: entrada.dataEntrada,
            previsaoEntrega: entrada.previsaoEntrega,
            formaPagamento: "Não informado",
            valor: entrada.valor,
            observacoes: entrada.observacoes ?? "",
            criadoEm: entrada.criadoEm,
            atualizadoEm: entrada.atualizadoEm,
          })),
    });
    setCarregado(true);
    if (nome) setNomeArquivo(nome);
  };

  // Importa um arquivo .json escolhido via <input type="file"> (funciona em
  // qualquer navegador, sem precisar de servidor).
  const importarJson: PainelContextValue["importarJson"] = async (arquivo) => {
    const conteudo = await arquivo.text();
    carregarConteudo(conteudo, arquivo.name);
  };

  // Alternativa: usa a File System Access API (Chrome/Edge) para abrir um
  // arquivo e manter a referência, permitindo salvar por cima dele depois
  // sem precisar baixar um novo arquivo a cada exportação.
  const abrirEconectarArquivo: PainelContextValue["abrirEconectarArquivo"] = async () => {
    const picker = (window as unknown as {
      showOpenFilePicker?: (options: unknown) => Promise<FileSystemFileHandleLike[]>;
    }).showOpenFilePicker;

    if (!picker) {
      throw new Error(
        "Este navegador não suporta conectar um arquivo diretamente. Use importar/exportar."
      );
    }

    const [handle] = await picker({
      types: [
        {
          description: "Arquivo de dados do painel",
          accept: { "application/json": [".json"] },
        },
      ],
      multiple: false,
    });

    const arquivo = await handle.getFile();
    const conteudo = await arquivo.text();
    carregarConteudo(conteudo, arquivo.name);
    fileHandleRef.current = handle;
  };

  const value: PainelContextValue = {
    dados,
    carregado,
    nomeArquivo,
    suportaSalvarDireto,
    adicionarEntrada,
    atualizarEntrada,
    removerEntrada,
    adicionarSaida,
    atualizarSaida,
    removerSaida,
    adicionarProduto,
    atualizarProduto,
    removerProduto,
    adicionarVenda,
    atualizarVenda,
    removerVenda,
    exportarJson,
    importarJson,
    abrirEconectarArquivo,
  };

  return <PainelContext.Provider value={value}>{children}</PainelContext.Provider>;
}

export function usePainel() {
  const ctx = React.useContext(PainelContext);
  if (!ctx) {
    throw new Error("usePainel precisa ser usado dentro de <PainelProvider>.");
  }
  return ctx;
}
