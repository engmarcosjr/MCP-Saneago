"use strict";

const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname, "..");
const docsHttpDir = path.join(rootDir, "docs", "http");
const scratchDir = path.join(rootDir, "scratch");

const APPS = [
  "LRS010", "LRS034", "LRS041", "LRS100", "LRS105", "LRS208", "LRS272",
  "ECO151", "ECO154", "ECO202", "ECO205", "ECO701", "ECO707", "ECO708",
  "ECO709", "ECO711", "ECO712", "ECO731", "MTG020"
];

function validar() {
  console.log("Iniciando validação estrita dos documentos HTTP vs Capturas em scratch/...\n");
  let totalErros = 0;
  const divergencias = [];

  for (const appCode of APPS) {
    const docPath = path.join(docsHttpDir, `${appCode}.md`);
    const zkauPath = path.join(scratchDir, `zkau_${appCode}.txt`);

    if (!fs.existsSync(docPath)) {
      divergencias.push(`[${appCode}] Documento não existe: docs/http/${appCode}.md`);
      totalErros++;
      continue;
    }
    if (!fs.existsSync(zkauPath)) {
      divergencias.push(`[${appCode}] Captura não existe: scratch/zkau_${appCode}.txt`);
      totalErros++;
      continue;
    }

    const docContent = fs.readFileSync(docPath, "utf8");
    const zkauData = JSON.parse(fs.readFileSync(zkauPath, "utf8"));
    const rawContent = JSON.stringify(zkauData);

    const idsEstaveisCaptura = new Set(zkauData.idsEstaveis || []);
    for (const b of zkauData.botoes || []) {
      if (b.id) idsEstaveisCaptura.add(b.id);
    }

    // Extrair IDs citados nas tabelas de IDs e Botoes do documento Markdown
    // padrao: | `idName` | ...
    const tableIdMatches = [...docContent.matchAll(/\|\s*`([a-zA-Z0-9_]+)`\s*\|/g)];
    const idsDoc = new Set();

    for (const match of tableIdMatches) {
      const val = match[1];
      // Ignorar cabecalhos ou palavras reservadas de tabela
      if (val === "ID Estáve" || val === "Tipo ZK" || val === "Rótulo" || val === "UUID Na Captura") continue;
      // Ignorar classes ZK (ex: zul.inp.Textbox)
      if (val.startsWith("zul.")) continue;
      idsDoc.add(val);
    }

    // Checar cada ID citado no doc contra a captura
    for (const idDoc of idsDoc) {
      if (!idsEstaveisCaptura.has(idDoc) && !rawContent.includes(`"${idDoc}"`)) {
        divergencias.push(`[${appCode}] ID inventado/ausente na captura: '${idDoc}' citado em docs/http/${appCode}.md`);
        totalErros++;
      }
    }

    // Checar se Status CONFIRMADO existe sem prova de replay
    if (docContent.includes("Status: **CONFIRMADO**") || docContent.includes("Status: CONFIRMADO")) {
      const replayPath = path.join(docsHttpDir, `_replay_${appCode}.txt`);
      if (!fs.existsSync(replayPath)) {
        divergencias.push(`[${appCode}] Documento declara CONFIRMADO mas não possui _replay_${appCode}.txt`);
        totalErros++;
      }
    }

    // Checar colunas da grade
    const colunasDocMatches = [...docContent.matchAll(/-\s*`([^`]+)`/g)];
    const colunasDoc = colunasDocMatches.map(m => m[1]);
    const colunasGradeCaptura = zkauData.colunasGrade || [];

    for (const colCaptura of colunasGradeCaptura) {
      if (!docContent.includes(`\`${colCaptura}\``)) {
        divergencias.push(`[${appCode}] Coluna da captura '${colCaptura}' ausente no documento`);
        totalErros++;
      }
    }
  }

  if (totalErros > 0) {
    console.error("❌ FALHA NA VALIDAÇÃO! Divergências encontradas:\n");
    divergencias.forEach(d => console.error("  - " + d));
    process.exit(1);
  } else {
    console.log("✅ VALIDAÇÃO CONCLUÍDA COM SUCESSO!");
    console.log("  - 0 IDs inventados");
    console.log("  - 0 declarações 'CONFIRMADO' sem prova de replay");
    console.log("  - Colunas da grade 100% fiéis às capturas");
  }
}

validar();
