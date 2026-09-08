"use client";

import * as React from "react";
import { Download, FolderOpen, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePainel } from "@/lib/painel-store";

export function DataActions() {
  const { exportarJson, importarJson, abrirEconectarArquivo, suportaSalvarDireto, nomeArquivo } =
    usePainel();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [erro, setErro] = React.useState<string | null>(null);
  const [aviso, setAviso] = React.useState<string | null>(null);

  const mostrarAviso = (mensagem: string) => {
    setAviso(mensagem);
    window.setTimeout(() => setAviso(null), 3000);
  };

  const handleImportarClique = () => inputRef.current?.click();

  const handleArquivoSelecionado = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const arquivo = event.target.files?.[0];
    event.target.value = "";
    if (!arquivo) return;
    try {
      setErro(null);
      await importarJson(arquivo);
      mostrarAviso("Dados importados com sucesso.");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível ler o arquivo.");
    }
  };

  const handleExportar = async () => {
    try {
      setErro(null);
      await exportarJson();
      mostrarAviso(nomeArquivo ? `Salvo em ${nomeArquivo}.` : "Arquivo JSON baixado.");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar o arquivo.");
    }
  };

  const handleConectarArquivo = async () => {
    try {
      setErro(null);
      await abrirEconectarArquivo();
      mostrarAviso("Arquivo conectado. Ao exportar, ele será atualizado direto.");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível conectar o arquivo.");
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center gap-2">
        {suportaSalvarDireto && (
          <Button variant="outline" size="sm" onClick={handleConectarArquivo}>
            <FolderOpen />
            Conectar arquivo
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={handleImportarClique}>
          <Upload />
          Importar JSON
        </Button>
        <Button size="sm" onClick={handleExportar}>
          <Download />
          {nomeArquivo ? "Salvar" : "Exportar JSON"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleArquivoSelecionado}
        />
      </div>
      {erro && <p className="text-xs text-destructive">{erro}</p>}
      {aviso && <p className="text-xs text-success">{aviso}</p>}
    </div>
  );
}
