"use strict";
/**
 * Reprova qualquer doc de contrato HTTP que cite coisa que nao existe na captura.
 *
 * Existe porque a primeira versao destes docs foi escrita "por cima" das capturas
 * e inventou 42 ids (intbxNumeroRa, btnLimpar, dtbxDataInicial...) que nao existem
 * em tela nenhuma. Um id inventado nao da erro: o ZK responde a grade vazia em
 * silencio. Este script e a rede que pega isso antes do commit.
 *
 *   node scripts/validar_docs_http.js
 */
const fs = require("fs");
const path = require("path");

const docsDir = path.join(__dirname, "..", "docs", "http");
const arvores = path.join(__dirname, "..", "scratch", "arvores");

function idsCitados(md) {
  // Ids aparecem em crase, nas colunas "id estavel" das tabelas.
  return [...new Set([...md.matchAll(/^\|\s*`([A-Za-z][A-Za-z0-9_]*)`/gm)].map((m) => m[1]))];
}

function main() {
  const docs = fs.readdirSync(docsDir).filter((f) => /^[A-Z]{3}\d{3}\.md$/.test(f));
  let falhas = 0;
  let totalIds = 0;

  for (const arquivo of docs) {
    const codigo = arquivo.replace(".md", "");
    const md = fs.readFileSync(path.join(docsDir, arquivo), "utf8");
    const arvore = path.join(arvores, `${codigo}.html`);

    if (!fs.existsSync(arvore)) {
      console.error(`FALHA ${codigo}: doc existe mas nao ha arvore capturada`);
      falhas++;
      continue;
    }
    const html = fs.readFileSync(arvore, "utf8");
    const ids = idsCitados(md);
    totalIds += ids.length;
    const inexistentes = ids.filter((id) => !html.includes(`id:'${id}'`));

    // Status REPLICADO exige prova de replay em disco.
    const declaraReplicado = /\*\*Status:\*\* REPLICADO|Status:\*\* REPLICADO|Status: REPLICADO/.test(md);
    const temProva = fs.existsSync(path.join(docsDir, `_replay_${codigo}.txt`));

    if (inexistentes.length) {
      console.error(`FALHA ${codigo}: ${inexistentes.length} id(s) citados que nao existem na arvore -> ${inexistentes.join(", ")}`);
      falhas++;
    }
    if (declaraReplicado && !temProva) {
      console.error(`FALHA ${codigo}: declara REPLICADO sem docs/http/_replay_${codigo}.txt`);
      falhas++;
    }
    if (/CONFIRMADO/.test(md)) {
      console.error(`FALHA ${codigo}: usa o rotulo CONFIRMADO (status valido: REPLICADO / POSTS CAPTURADOS / ARVORE CAPTURADA)`);
      falhas++;
    }
  }

  console.error(`\n${docs.length} docs, ${totalIds} ids verificados contra a arvore real.`);
  if (falhas) {
    console.error(`${falhas} FALHA(S) — nao commitar.`);
    process.exitCode = 1;
  } else {
    console.error("OK: todo id citado existe na captura e todo REPLICADO tem prova.");
  }
}

main();
