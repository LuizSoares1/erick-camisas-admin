"use client";

import * as React from "react";

import {
  Entrada,
  PainelData,
  Saida,
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
  exportarJson: () => Promise<void>;
  importarJson: (arquivo: File) => Promise<void>;
  abrirEconectarArquivo: () => Promise<void>;
}

const PainelContext = React.createContext<PainelContextValue | null>(null);

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

export function PainelProvider({ children }: { children: React.ReactNode }) {
  const [dados, setDados] = React.useState<PainelData>(criarPainelVazio());
  const [carregado, setCarregado] = React.useState(false);
  const [nomeArquivo, setNomeArquivo] = React.useState<string | null>(null);
  const [suportaSalvarDireto, setSuportaSalvarDireto] = React.useState(false);
  const fileHandleRef = React.useRef<FileSystemFileHandleLike | null>(null);

  React.useEffect(() => {
    setSuportaSalvarDireto("showOpenFilePicker" in window);
  }, []);

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
      entradas: json.entradas,
      saidas: json.saidas,
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
