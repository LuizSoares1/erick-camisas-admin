import { Entrada } from "@/lib/types";

function escaparHtml(valor: string) {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(iso: string) {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function abrirComprovante(entrada: Entrada) {
  const janela = window.open("", "_blank", "width=760,height=900");
  if (!janela) {
    window.alert("Não foi possível abrir o comprovante. Permita pop-ups para este site.");
    return;
  }

  const status = entrada.status === "falta_gabaritar"
    ? "Falta gabaritar"
    : entrada.status === "gabaritado"
      ? "Gabaritado"
      : entrada.status === "em_producao"
        ? "Em produção"
        : "Finalizado";
  janela.document.write(`<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <title>Comprovante - ${escaparHtml(entrada.clienteNome)}</title>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; padding: 32px; color: #17202a; font: 15px Arial, sans-serif; }
      main { max-width: 680px; margin: 0 auto; border: 1px solid #d8dee4; padding: 32px; }
      header { display: flex; justify-content: space-between; gap: 24px; border-bottom: 2px solid #17202a; padding-bottom: 20px; }
      h1 { margin: 0 0 6px; font-size: 24px; }
      .muted { color: #5f6b76; }
      .number { text-align: right; font-size: 13px; }
      section { margin-top: 26px; }
      h2 { margin: 0 0 12px; font-size: 13px; text-transform: uppercase; letter-spacing: .08em; }
      dl { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 28px; margin: 0; }
      dt { margin-bottom: 4px; color: #5f6b76; font-size: 12px; }
      dd { margin: 0; font-weight: 600; }
      .total { display: flex; justify-content: space-between; border-top: 1px solid #d8dee4; margin-top: 28px; padding-top: 18px; font-size: 20px; font-weight: 700; }
      footer { margin-top: 42px; text-align: center; color: #5f6b76; font-size: 12px; }
      .acoes { max-width: 680px; margin: 16px auto 0; text-align: right; }
      button { border: 0; background: #17202a; color: white; cursor: pointer; padding: 10px 16px; border-radius: 4px; }
      @media print { body { padding: 0; } main { border: 0; padding: 0; } .acoes { display: none; } }
    </style>
  </head>
  <body>
    <main>
      <header>
        <div><h1>Comprovante de pedido</h1><div class="muted">Controle de Produção</div></div>
        <div class="number">Nº ${escaparHtml(entrada.id.slice(0, 8).toUpperCase())}<br />Emitido em ${formatarData(new Date().toISOString().slice(0, 10))}</div>
      </header>
      <section><h2>Cliente</h2><dl>
        <div><dt>Nome</dt><dd>${escaparHtml(entrada.clienteNome)}</dd></div>
        <div><dt>CPF/CNPJ</dt><dd>${escaparHtml(entrada.documento)}</dd></div>
      </dl></section>
      <section><h2>Pedido</h2><dl>
        <div><dt>Produto</dt><dd>${escaparHtml(entrada.produto)}</dd></div>
        <div><dt>Quantidade</dt><dd>${entrada.quantidade}</dd></div>
        <div><dt>Tecido</dt><dd>${escaparHtml(entrada.tecido)}</dd></div>
        <div><dt>Modelo</dt><dd>${escaparHtml(entrada.modelo)}</dd></div>
        <div><dt>Placa de gola</dt><dd>${escaparHtml(entrada.placaGola || "Não informado")}</dd></div>
        <div><dt>Observações</dt><dd>${escaparHtml(entrada.observacoes || "Não informado")}</dd></div>
        <div><dt>Status</dt><dd>${status}</dd></div>
        <div><dt>Data de entrada</dt><dd>${formatarData(entrada.dataEntrada)}</dd></div>
        <div><dt>Previsão de entrega</dt><dd>${formatarData(entrada.previsaoEntrega)}</dd></div>
      </dl></section>
      <div class="total"><span>Valor total</span><span>${formatarMoeda(entrada.valor)}</span></div>
      <footer>Este documento é um comprovante de registro do pedido.</footer>
    </main>
    <div class="acoes"><button onclick="window.print()">Imprimir / Salvar PDF</button></div>
  </body>
</html>`);
  janela.document.close();
  janela.focus();
  janela.setTimeout(() => janela.print(), 250);
}