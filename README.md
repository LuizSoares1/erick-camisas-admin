# Painel Administrativo — Controle de Entradas e Saídas

Dashboard construído com **Next.js 16**, **Tailwind CSS v4** e componentes no
estilo **shadcn/ui (new-york)**, inspirado em
https://ui.shadcn.com/view/new-york-v4/dashboard-01.

## Como os dados são salvos (sem banco de dados e sem servidor)

Em vez de salvar no `localStorage` do navegador ou em um banco de dados, o
app trabalha com um **arquivo JSON próprio** que fica com você:

- **Exportar JSON**: baixa um arquivo `.json` com todas as entradas e
  saídas cadastradas até o momento.
- **Importar JSON**: carrega um arquivo `.json` exportado anteriormente,
  trazendo de volta todos os dados.
- **Conectar arquivo** (Chrome/Edge, opcional): usando a *File System
  Access API*, o navegador guarda uma referência a um arquivo no seu
  computador. Depois disso, o botão "Salvar" sobrescreve esse mesmo
  arquivo diretamente, sem precisar baixar um novo toda vez. Em
  navegadores sem suporte (Firefox, Safari), o app cai automaticamente
  para "baixar um novo arquivo" — nada quebra.

Ou seja: **nenhum dado trafega para um servidor**. Tudo roda no navegador
do usuário, e o arquivo `.json` é o "banco de dados" portátil dele —
pode guardar no computador, num pendrive, no Google Drive, etc. Basta
importar esse mesmo arquivo sempre que for continuar o trabalho.

> Sugestão de uso no dia a dia: a pessoa abre o site, clica em
> **Importar JSON** (ou **Conectar arquivo**) escolhendo o arquivo salvo
> da última vez, faz as alterações, e clica em **Salvar/Exportar** antes
> de fechar. Sem login, sem mensalidade de banco de dados.

## Campos cadastrados

**Entradas**
- Nome do cliente ou empresa
- CPF ou CNPJ — com máscara automática (`000.000.000-00` /
  `00.000.000/0000-00`), limite de dígitos correto para cada tipo, e
  **validação real dos dígitos verificadores** (não só o formato)
- Produto, Quantidade, Tecido, Modelo, Placa de gola
- Data de entrada, Previsão de entrega
- Estado do produto: **Em desenvolvimento** (padrão ao cadastrar) ou
  **Finalizado** (quando entregue)
- Valor

**Saídas**
- Produto, Data, Valor

A tela inicial também mostra cards de resumo: total em entradas, total em
saídas, saldo e quantos pedidos ainda estão em desenvolvimento.

## Rodando o projeto

```bash
npm install
npm run dev
```

Acesse http://localhost:3000.

Para gerar a versão de produção (arquivos estáticos, prontos para
hospedar em qualquer lugar):

```bash
npm run build
```

O resultado fica na pasta `out/` — são arquivos HTML/CSS/JS puros, sem
necessidade de servidor Node.js rodando. Dá para hospedar de graça em:

- **Vercel** (free tier) — `vercel deploy`
- **Netlify** (free tier) — arrastar a pasta `out/` no painel deles
- **GitHub Pages** — subir o conteúdo de `out/` para o branch de páginas
- Ou simplesmente abrir os arquivos localmente / distribuir por pendrive

Como não há banco de dados nem backend, **não há custo de servidor**.

## Estrutura do projeto

```
app/
  layout.tsx        Layout raiz
  page.tsx           Página única do painel (sidebar + abas)
  globals.css        Tema (tokens de cor no estilo shadcn new-york)
components/
  ui/                Componentes base (button, input, table, dialog...)
  app-sidebar.tsx    Barra lateral com navegação Entradas/Saídas
  data-actions.tsx   Botões de Exportar / Importar / Conectar arquivo
  summary-cards.tsx  Cards de resumo do topo
  entrada-form-dialog.tsx / entradas-table.tsx
  saida-form-dialog.tsx  / saidas-table.tsx
lib/
  types.ts           Tipos de dados (Entrada, Saida, PainelData)
  cpf-cnpj.ts         Máscara + validação de CPF/CNPJ
  painel-store.tsx    Estado do app + exportar/importar JSON
```

## Extensões possíveis

- Trocar o "Conectar arquivo" por sincronização automática com Google
  Drive/Dropbox (via API deles), mantendo o mesmo formato de JSON.
- Adicionar autenticação simples (ex: senha local) se mais de uma pessoa
  usar o mesmo computador.
- Gerar relatórios em PDF a partir dos mesmos dados.
