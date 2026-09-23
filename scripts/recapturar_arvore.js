"use strict";
/**
 * Recaptura a arvore de widgets COMPLETA de cada tela, por HTTP puro (somente GET).
 *
 * Motivo: as capturas em scratch/zkau_<APP>.txt guardam apenas 3000 chars da
 * serializacao zkmx, o que corta a classe ZK da maioria dos componentes — e a
 * classe e justamente o que determina o tipo do data_N em cada POST.
 *
 * NAO opera nenhuma tela: so abre o .zul e grava o HTML. Nada e gravado no portal.
 *
 *   node scripts/recapturar_arvore.js [APP ...]
 */
const fs = require("fs");
const path = require("path");
const { PortalHttp } = require("../src/http/portal-http");

const APPS = [
  "LRS010", "LRS034", "LRS041", "LRS100", "LRS105", "LRS208", "LRS272",
  "ECO151", "ECO154", "ECO202", "ECO205", "ECO701", "ECO707", "ECO708",
  "ECO709", "ECO711", "ECO712", "ECO731", "MTG020",
];

const destino = path.join(__dirname, "..", "scratch", "arvores");

function caminhoDaApp(codigo) {
  const capacidades = require("../config/capacidades.json");
  const app = capacidades.find((a) => a.codigo === codigo);
  if (!app || !app.url_real) return null;
  return new URL(app.url_real).pathname;
}

async function main() {
  const alvos = process.argv.slice(2).length ? process.argv.slice(2) : APPS;
  fs.mkdirSync(destino, { recursive: true });

  const portal = new PortalHttp();
  await portal.login();
  console.error("login ok");

  const resumo = [];
  for (const codigo of alvos) {
    const caminho = caminhoDaApp(codigo);
    if (!caminho) {
      console.error(`${codigo}: sem url_real no capacidades.json`);
      resumo.push({ codigo, ok: false, erro: "sem url_real" });
      continue;
    }
    try {
      const tela = await portal.abrir(caminho);
      const arquivo = path.join(destino, `${codigo}.html`);
      fs.writeFileSync(arquivo, tela.texto, "utf8");
      console.error(`${codigo}: ${tela.texto.length} chars -> ${path.basename(arquivo)}`);
      resumo.push({ codigo, ok: true, chars: tela.texto.length, caminho });
    } catch (e) {
      console.error(`${codigo}: FALHOU (${e.message})`);
      resumo.push({ codigo, ok: false, erro: e.message });
      // sessao pode ter caido; o proximo abrir() refaz o login sozinho
    }
  }

  fs.writeFileSync(path.join(destino, "_resumo.json"), JSON.stringify(resumo, null, 2), "utf8");
  const ok = resumo.filter((r) => r.ok).length;
  console.error(`\n${ok}/${resumo.length} arvores capturadas`);
}

main().catch((e) => {
  console.error("ERRO:", e.message);
  process.exitCode = 1;
});
