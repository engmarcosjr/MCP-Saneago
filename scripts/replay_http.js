"use strict";
/**
 * Replay HTTP de telas de CONSULTA: preenche um campo, clica Consultar, segue o
 * echo e le a grade. Serve de prova reproduzivel — o doc so recebe status
 * REPLICADO se este script devolver linhas reais para a tela.
 *
 * Somente leitura: nunca aciona botao de gravacao.
 *
 *   node scripts/replay_http.js LRS208 numeroRA 31041602025
 *   node scripts/replay_http.js ECO707 intbxConta 2238097
 */
const fs = require("fs");
const path = require("path");
const { PortalHttp } = require("../src/http/portal-http");
const { echoUuid } = require("../src/http/zk-tree");

const capacidades = require("../config/capacidades.json");

const PROIBIDO = /incluir|gravar|salvar|confirmar|alterar|excluir|distribuir|lan[cç]ar/i;

/** O ZK serializa acentos como \xNN — sem decodificar, a grade sai ilegivel. */
function decodificar(s) {
  return String(s).replace(/\\x([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

/** Le as linhas da grade a partir dos Listcell/Listitem da resposta AU. */
function lerGrade(texto) {
  const linhas = [];
  for (const bloco of texto.split("zul.sel.Listitem").slice(1)) {
    const celulas = [...bloco.matchAll(/'zul\.sel\.Listcell','[^']+',\{([^}]*)\}/g)]
      .map((m) => {
        const lab = m[1].match(/label:'((?:[^'\\]|\\.)*)'/);
        return lab ? decodificar(lab[1]) : "";
      });
    const links = [...bloco.matchAll(/'zul\.wgt\.A','[^']+',\{[^}]*label:'([^']*)'/g)].map((m) => m[1]);
    const linha = [...links, ...celulas].filter((c) => c !== "");
    if (linha.length) linhas.push(linha);
  }
  return linhas;
}

async function main() {
  const [codigo, campo, valor] = process.argv.slice(2);
  if (!codigo || !campo || valor === undefined) {
    console.error("uso: node scripts/replay_http.js <APP> <idCampo> <valor>");
    process.exitCode = 1;
    return;
  }

  const app = capacidades.find((a) => a.codigo === codigo);
  if (!app || !app.url_real) throw new Error(`${codigo} sem url_real no capacidades.json`);
  const caminho = new URL(app.url_real).pathname;

  const portal = new PortalHttp();
  await portal.login();

  const t0 = Date.now();
  const tela = await portal.abrir(caminho);
  const uuidCampo = tela.uuid(campo);
  const uuidBotao = tela.uuid("btnConsultar");
  if (!uuidCampo) throw new Error(`campo ${campo} nao encontrado na arvore do ${codigo}`);
  if (!uuidBotao) throw new Error(`btnConsultar nao encontrado na arvore do ${codigo}`);

  // Trava de seguranca: so clicamos em Consultar.
  if (PROIBIDO.test("btnConsultar")) throw new Error("botao de escrita bloqueado");

  const numerico = /^\d+$/.test(valor) && /Intbox/.test(tela.texto.slice(
    Math.max(0, tela.texto.indexOf(`id:'${campo}'`) - 200),
    tela.texto.indexOf(`id:'${campo}'`),
  ));
  const dado = numerico ? { value: Number(valor), start: String(valor).length }
                        : { value: String(valor), start: String(valor).length };

  const r1 = await portal.http.zkau(tela.dtid, [
    { cmd: "onChange", uuid: uuidCampo, data: dado },
    { cmd: "onClick", uuid: uuidBotao, data: { pageX: 0, pageY: 0, which: 1, x: 0, y: 0 } },
  ], tela.url);

  const echo = echoUuid(r1.text, "onConsultar") || echoUuid(r1.text, "onClick");
  let resposta = r1.text;
  if (echo) {
    const r2 = await portal.http.zkau(tela.dtid, [
      { cmd: "echo", uuid: echo, opt: "i", data: { "": ["onConsultar"] } },
    ], tela.url);
    resposta = r2.text;
  }
  const ms = Date.now() - t0;

  const linhas = lerGrade(resposta);
  console.error(`${codigo}: ${linhas.length} linha(s) em ${ms}ms`);
  for (const l of linhas.slice(0, 5)) console.error("  " + l.join(" | "));

  if (linhas.length === 0) {
    console.error("SEM LINHAS — nao gerar prova de replay (o ZK responde vazio em silencio quando o payload esta errado)");
    process.exitCode = 1;
    return;
  }

  const destino = path.join(__dirname, "..", "docs", "http", `_replay_${codigo}.txt`);
  const prova = [
    `REPLAY HTTP — ${codigo}`,
    `Data: ${new Date().toISOString().slice(0, 10)}`,
    `Reproduzir: node scripts/replay_http.js ${codigo} ${campo} ${valor}`,
    `Tempo: ${ms} ms | linhas: ${linhas.length}`,
    "",
    `GET ${caminho}`,
    `POST /prt/zkau  cmd_0=onChange uuid_0=<${campo}> data_0=${JSON.stringify(dado)}`,
    `                cmd_1=onClick  uuid_1=<btnConsultar>`,
    echo ? `POST /prt/zkau  cmd_0=echo opt_0=i data_0={"":["onConsultar"]}` : "(sem echo)",
    "",
    "LINHAS LIDAS (primeiras 5):",
    ...linhas.slice(0, 5).map((l) => "  " + l.join(" | ")),
  ].join("\n");
  fs.writeFileSync(destino, prova + "\n", "utf8");
  console.error(`prova -> docs/http/_replay_${codigo}.txt`);
}

main().catch((e) => {
  console.error("ERRO:", e.message);
  process.exitCode = 1;
});
