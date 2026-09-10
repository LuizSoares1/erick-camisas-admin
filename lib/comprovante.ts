import { Entrada, Venda } from "@/lib/types";

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

export function abrirComprovante(registro: Venda | Entrada) {
  const venda: Venda = "numeroComprovante" in registro
    ? registro
    : {
        id: registro.id,
        numeroComprovante: registro.id.slice(0, 8).toUpperCase(),
        clienteNome: registro.clienteNome,
        documento: registro.documento,
        produto: registro.produto,
        tipo: registro.modelo || "Não informado",
        placaGola: registro.placaGola ?? "",
        tamanho: "",
        quantidade: registro.quantidade,
        dataVenda: registro.dataEntrada,
        previsaoEntrega: registro.previsaoEntrega,
        formaPagamento: "Não informado",
        valor: registro.valor,
        observacoes: registro.observacoes,
        criadoEm: registro.criadoEm,
        atualizadoEm: registro.atualizadoEm,
      };
  const janela = window.open("", "_blank", "width=760,height=900");
  if (!janela) {
    window.alert("Não foi possível abrir o comprovante. Permita pop-ups para este site.");
    return;
  }

  janela.document.write(`<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <title>Comprovante - ${escaparHtml(venda.clienteNome)}</title>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; padding: 24px; color: #111; background: #f4f4f4; font: 13px "Courier New", monospace; }
      main { max-width: 430px; margin: 0 auto; background: #fff; padding: 24px 20px 28px; box-shadow: 0 2px 12px rgb(0 0 0 / 10%); }
      header { border-bottom: 1px dashed #111; padding-bottom: 14px; text-align: center; }
      h1 { margin: 0 0 8px; font-size: 20px; letter-spacing: .04em; }
      .muted { font-size: 12px; }
      .number { margin-top: 10px; font-weight: 700; }
      section { margin-top: 20px; }
      h2 { margin: 0 0 10px; font-size: 13px; text-decoration: underline; }
      dl { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 28px; margin: 0; }
      dl > div { min-width: 0; }
      dt { font-weight: 700; }
      dd { margin: 4px 0 0; overflow-wrap: anywhere; }
      .pedido { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; gap: 6px 12px; border-bottom: 1px dashed #111; padding-bottom: 12px; }
      .pedido strong { font-weight: 700; }
      .pedido span:nth-child(5) { text-align: right; }
      .pedido span:nth-child(6) { text-align: right; }
      .entrega { margin-top: 10px; display: flex; justify-content: space-between; gap: 16px; }
      .total { display: flex; justify-content: space-between; border-top: 1px solid #111; margin-top: 18px; padding-top: 12px; font-size: 16px; font-weight: 700; }
      footer { margin-top: 34px; display: flex; justify-content: space-between; gap: 20px; text-align: center; font-size: 11px; }
      .assinatura { flex: 1; border-top: 1px solid #111; padding-top: 6px; }
      .acoes { max-width: 430px; margin: 16px auto 0; text-align: right; }
      button { border: 0; background: #111; color: white; cursor: pointer; padding: 10px 16px; font: inherit; }
      @media print { body { padding: 0; background: white; } main { box-shadow: none; padding: 0; } .acoes { display: none; } }
    </style>
  </head>
  <body>
    <main>
      <header>
        <h1>EA PRODUÇÃO</h1>
        <div class="muted">COMPROVANTE DE PEDIDO</div>
        <div class="number">PEDIDO ${escaparHtml(venda.numeroComprovante)}</div>
        <div>${formatarData(venda.dataVenda)}</div>
      </header>
      <section><h2>DADOS DO CLIENTE:</h2><dl>
        <div><dt>Nome</dt><dd>${escaparHtml(venda.clienteNome)}</dd></div>
        <div><dt>CPF/CNPJ</dt><dd>${escaparHtml(venda.documento)}</dd></div>
      </dl></section>
      <section><h2>DADOS DO PEDIDO:</h2>
        <div class="pedido"><strong>Produto</strong><strong>Qtd.</strong><strong>Valor</strong>
          <span>${escaparHtml(venda.produto)}${venda.tipo ? ` - ${escaparHtml(venda.tipo)}` : ""} ${venda.tamanho ? `(${escaparHtml(venda.tamanho)})` : ""}</span>
          <span>${venda.quantidade}</span><span>${formatarMoeda(venda.valor)}</span>
          <span>Placa de gola: ${escaparHtml(venda.placaGola || "Não informado")}</span>
          <span></span><span></span>
        </div>
        <div class="entrega"><strong>Previsão de entrega</strong><span>${formatarData(venda.previsaoEntrega)}</span></div>
      </section>
      <section><h2>DADOS DE PAGAMENTO:</h2><dl>
        <div><dt>Total de quantidades</dt><dd>${venda.quantidade}</dd></div>
        <div><dt>Valor dos produtos</dt><dd>${formatarMoeda(venda.valor)}</dd></div>
        <div><dt>Valor do pedido</dt><dd>${formatarMoeda(venda.valor)}</dd></div>
        <div><dt>Pagamento</dt><dd>${escaparHtml(venda.formaPagamento)}</dd></div>
      </dl></section>
      <div class="total"><span>TOTAL</span><span>${formatarMoeda(venda.valor)}</span></div>
      <footer><div class="assinatura">Data do aceite</div><div class="assinatura">Assinatura do sacado</div></footer>
    </main>
    <div class="acoes"><button onclick="window.print()">Imprimir / Salvar PDF</button></div>
  </body>
</html>`);
  janela.document.close();
  janela.focus();
  janela.setTimeout(() => janela.print(), 250);
}