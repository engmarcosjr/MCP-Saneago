"use strict";
/**
 * Gera docs/http/<APP>.md a partir da arvore de widgets capturada em
 * scratch/arvores/<APP>.html.
 *
 * REGRA CENTRAL: tudo que entra no documento e extraido da captura por parsing.
 * Este script nao infere, nao completa e nao adivinha nenhum id, rotulo ou coluna.
 * O que nao esta na arvore fica de fora, e o status do documento e CALCULADO,
 * nunca escrito a mao — foi a documentacao redigida "por cima" das capturas que
 * introduziu ids inexistentes (intbxNumeroRa, btnLimpar, dtbxDataInicial...) na
 * primeira versao destes docs.
 *
 *   node src/gerar_doc_http.js [APP ...]
 */
const fs = require("fs");
const path = require("path");

const raizArvores = path.join(__dirname, "..", "scratch", "arvores");
const destino = path.join(__dirname, "..", "docs", "http");
const capacidades = require("../config/capacidades.json");

const APPS = [
  "LRS010", "LRS034", "LRS041", "LRS100", "LRS105", "LRS208", "LRS272",
  "ECO151", "ECO154", "ECO202", "ECO205", "ECO701", "ECO707", "ECO708",
  "ECO709", "ECO711", "ECO712", "ECO731", "MTG020",
];

/** Telas de escrita: so podem ser abertas e lidas, nunca operadas. */
const TELAS_ESCRITA = new Set(["LRS010", "LRS105", "ECO151", "ECO202", "ECO701", "ECO731"]);

/** Classes ZK que representam entrada de dados, e o tipo esperado no data_N. */
const TIPOS = {
  "zul.inp.Textbox": "string — `{\"value\":\"texto\"}`",
  "zul.inp.Intbox": "inteiro — `{\"value\":12345}` (mandar string faz consultar vazio em silencio)",
  "zul.inp.Decimalbox": "decimal — `{\"value\":12.34}`",
  "zul.inp.Doublebox": "decimal — `{\"value\":12.34}`",
  "zul.db.Datebox": "data — `{\"value\":\"2024.1.1.0.0.0.0\",\"z$dateKeys\":[\"value\"]}` (mes 1-based)",
  "zul.db.Timebox": "hora — mesmo formato do Datebox",
  "zul.inp.Combobox": "combo — `onChange` com o texto + `onSelect` do item",
  "zul.sel.Radiogroup": "radio — `onCheck` no item escolhido",
  "zul.wgt.Checkbox": "booleano — `{\"checked\":true}`",
};

function decodificar(s) {
  return String(s).replace(/\\x([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

/** Extrai [{classe, uuid, props}] de toda a serializacao zkmx da pagina. */
function parsearWidgets(html) {
  const widgets = [];
  const re = /\['(zul\.[a-zA-Z]+\.[A-Za-z]+)','([^']+)',\{([\s\S]*?)\},\{/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    widgets.push({ classe: m[1], uuid: m[2], props: m[3] });
  }
  return widgets;
}

function prop(props, nome) {
  const re = new RegExp(nome + ":'((?:[^'\\\\]|\\\\.)*)'");
  const m = props.match(re);
  return m ? decodificar(m[1]) : null;
}

function temFlag(props, nome) {
  return new RegExp("(?:^|,)" + nome + ":true").test(props);
}

/**
 * Associa a cada componente com id o rotulo que o antecede na arvore.
 * Nas telas ZK da Saneago o padrao e Label seguido do campo, dentro de Cells.
 */
function rotulosAnteriores(widgets) {
  const mapa = new Map();
  let ultimoLabel = null;
  for (const w of widgets) {
    if (w.classe === "zul.wgt.Label") {
      const v = prop(w.props, "value");
      if (v && v.trim()) ultimoLabel = v.trim();
      continue;
    }
    const id = prop(w.props, "id");
    if (id && ultimoLabel) mapa.set(id, ultimoLabel);
  }
  return mapa;
}

function extrair(codigo) {
  const arquivo = path.join(raizArvores, `${codigo}.html`);
  if (!fs.existsSync(arquivo)) return null;
  const html = fs.readFileSync(arquivo, "utf8");
  const widgets = parsearWidgets(html);
  const rotulos = rotulosAnteriores(widgets);

  const campos = [];
  const botoes = [];
  const listboxes = [];

  for (const w of widgets) {
    const id = prop(w.props, "id");
    if (w.classe === "zul.wgt.Button" || w.classe === "zul.wgt.Toolbarbutton") {
      const label = prop(w.props, "label");
      if (id || label) {
        botoes.push({
          id,
          label,
          visivel: !/visible:false/.test(w.props),
        });
      }
      continue;
    }
    if (TIPOS[w.classe]) {
      if (!id) continue;
      campos.push({
        id,
        classe: w.classe,
        rotulo: rotulos.get(id) || null,
        readonly: temFlag(w.props, "readonly") || temFlag(w.props, "disabled"),
        visivel: !/visible:false/.test(w.props),
      });
      continue;
    }
    if (w.classe === "zul.sel.Listbox" && id) {
      listboxes.push({ id });
    }
  }

  // Colunas de grade: os Listheader carregam o rotulo de cada coluna do resultado.
  const colunas = [...html.matchAll(/\['zul\.sel\.Listheader','[^']+',\{([\s\S]*?)\},\{/g)]
    .map((m) => prop(m[1], "label"))
    .filter((c) => c && c.trim());

  const titulo = (() => {
    const cap = widgets.find((w) => prop(w.props, "id") === "tituloAplicacao");
    return cap ? prop(cap.props, "label") : null;
  })();

  return { codigo, campos, botoes, listboxes, colunas, titulo, widgets: widgets.length };
}

/**
 * O status nunca e digitado: sai do que existe em disco.
 *  REPLICADO           — ha prova de replay HTTP em docs/http/_replay_<APP>.txt
 *  POSTS CAPTURADOS    — a captura zkau contem POSTs reais observados
 *  ARVORE CAPTURADA    — so o GET da arvore (ids/tipos reais, contrato nao observado)
 */
function calcularStatus(codigo) {
  const replay = path.join(destino, `_replay_${codigo}.txt`);
  if (fs.existsSync(replay)) return "REPLICADO";
  const zkau = path.join(__dirname, "..", "scratch", `zkau_${codigo}.txt`);
  if (fs.existsSync(zkau) && /cmd_0/.test(fs.readFileSync(zkau, "utf8"))) return "POSTS CAPTURADOS";
  return "ARVORE CAPTURADA (sem POST)";
}

function gerar(codigo) {
  const dados = extrair(codigo);
  if (!dados) return null;

  const app = capacidades.find((a) => a.codigo === codigo) || {};
  const status = calcularStatus(codigo);
  const escrita = TELAS_ESCRITA.has(codigo);
  const caminhoZul = app.url_real ? new URL(app.url_real).pathname : "(desconhecido)";

  const L = [];
  L.push(`# Contrato HTTP — ${codigo}${app.nome ? ` (${app.nome})` : ""}`);
  L.push("");
  L.push(`- **URL ZK:** \`${caminhoZul}\``);
  L.push(`- **Status:** ${status}`);
  L.push(`- **Natureza:** ${escrita ? "ESCRITA (aqui so leitura — nunca operar botao de gravacao)" : "consulta"}`);
  L.push(`- **Origem:** \`scratch/arvores/${codigo}.html\` (GET da arvore, ${dados.widgets} widgets)`);
  if (dados.titulo) L.push(`- **Titulo na tela:** ${dados.titulo}`);
  L.push("");

  if (status === "ARVORE CAPTURADA (sem POST)") {
    L.push("> **Atencao — leia antes de automatizar.** Os ids, tipos e colunas abaixo sao");
    L.push("> reais, extraidos da arvore de widgets da tela. Mas a **sequencia de POSTs**");
    L.push("> desta tela ainda **nao foi observada**: use as regras gerais de");
    L.push("> `docs/HTTP-ECO707-ECO709.md` como hipotese e confirme contra a tela antes de");
    L.push("> confiar. Um POST em campo errado faz o ZK responder vazio **sem erro algum**.");
    L.push("");
  }
  if (escrita) {
    L.push("> **Tela de escrita.** Este documento cobre apenas a abertura e a leitura da");
    L.push("> estrutura. Nenhum botao de gravacao foi acionado, e nenhum deve ser acionado");
    L.push("> sem o gate de escrita do MCP.");
    L.push("");
  }

  L.push("## Abertura");
  L.push("");
  L.push("```http");
  L.push(`GET ${caminhoZul}`);
  L.push("Host: prod.saneago.com.br");
  L.push("Referer: https://prod.saneago.com.br/prt/mpt/principal.zul");
  L.push("```");
  L.push("");
  L.push("A resposta traz o `dtid` e a arvore serializada. Os `uuid` mudam a cada abertura:");
  L.push("resolva sempre pelo **id estavel** com `uuidByComponentId` de `src/http/zk-tree.js`.");
  L.push("");

  L.push("## Campos (ids estaveis reais)");
  L.push("");
  if (dados.campos.length === 0) {
    L.push("_Nenhum campo de entrada com id estavel encontrado na arvore._");
  } else {
    L.push("| id estavel | rotulo na tela | classe ZK | tipo do `data_N` | obs |");
    L.push("|---|---|---|---|---|");
    for (const c of dados.campos) {
      const obs = [c.readonly ? "somente leitura" : null, c.visivel ? null : "invisivel"]
        .filter(Boolean).join(", ") || "—";
      L.push(`| \`${c.id}\` | ${c.rotulo || "—"} | \`${c.classe}\` | ${TIPOS[c.classe]} | ${obs} |`);
    }
  }
  L.push("");

  L.push("## Botoes");
  L.push("");
  if (dados.botoes.length === 0) {
    L.push("_Nenhum botao com id ou rotulo encontrado na arvore._");
  } else {
    L.push("| id estavel | rotulo | natureza |");
    L.push("|---|---|---|");
    for (const b of dados.botoes) {
      const gravacao = /incluir|gravar|salvar|confirmar|alterar|excluir|distribuir|lan[cç]ar/i
        .test(`${b.id || ""} ${b.label || ""}`);
      L.push(`| ${b.id ? `\`${b.id}\`` : "—"} | ${b.label || "—"} | ${gravacao ? "**ESCRITA — exige gate**" : "leitura"} |`);
    }
  }
  L.push("");

  L.push("## Grade de resultado");
  L.push("");
  if (dados.colunas.length === 0) {
    L.push("_A arvore inicial nao traz colunas (a grade so e montada apos a consulta)._");
  } else {
    L.push(`Listbox: ${dados.listboxes.map((l) => `\`${l.id}\``).join(", ") || "—"}`);
    L.push("");
    dados.colunas.forEach((c, i) => L.push(`${i + 1}. ${c}`));
    L.push("");
    L.push("Ancore a leitura pelo conteudo (ex.: RA por `/^\\d{9,11}$/`), nao contando celulas:");
    L.push("colunas de botao entram como celulas vazias.");
  }
  L.push("");

  L.push("## Protocolo");
  L.push("");
  L.push("As regras gerais do ZK por HTTP (onChange+onClick no mesmo POST, `echo` com");
  L.push("`opt=i`, reuso do `dtid`, queda de sessao) estao em `docs/HTTP-ECO707-ECO709.md`.");
  L.push("Elas valem para qualquer tela — mas o payload concreto so esta confirmado nas telas");
  L.push("com status `REPLICADO`.");
  L.push("");
  L.push("---");
  L.push(`*Gerado por \`src/gerar_doc_http.js\` em ${new Date().toISOString().slice(0, 10)}. Nao editar a mao: reexecute o gerador.*`);

  const saida = path.join(destino, `${codigo}.md`);
  fs.writeFileSync(saida, L.join("\n") + "\n", "utf8");
  return { codigo, status, campos: dados.campos.length, botoes: dados.botoes.length, colunas: dados.colunas.length };
}

function main() {
  const alvos = process.argv.slice(2).length ? process.argv.slice(2) : APPS;
  fs.mkdirSync(destino, { recursive: true });
  const resumo = [];
  for (const codigo of alvos) {
    const r = gerar(codigo);
    if (!r) { console.error(`${codigo}: sem arvore capturada — pule ou rode scripts/recapturar_arvore.js`); continue; }
    resumo.push(r);
    console.error(`${codigo}: ${r.status} | campos ${r.campos} | botoes ${r.botoes} | colunas ${r.colunas}`);
  }
  return resumo;
}

if (require.main === module) main();
module.exports = { gerar, extrair, calcularStatus };
