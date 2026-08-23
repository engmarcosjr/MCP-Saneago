"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const AdmZip = require("adm-zip");
const { PDFParse } = require("pdf-parse");

const BASE_DIR = path.join(__dirname, "downloads_anexos");
const ORGANIZED_DIR = path.join(__dirname, "projetos_organizados_anapolis");

if (!fs.existsSync(ORGANIZED_DIR)) {
  fs.mkdirSync(ORGANIZED_DIR, { recursive: true });
}

function getFileHash(bufferOrPath) {
  const hash = crypto.createHash("sha256");
  if (typeof bufferOrPath === "string") {
    hash.update(fs.readFileSync(bufferOrPath));
  } else {
    hash.update(bufferOrPath);
  }
  return hash.digest("hex");
}

function sanitizarNome(str) {
  return (str || "").replace(/[/\\?%*:|"<>]/g, "_").trim();
}

async function extrairInfoProjetistaDePdf(uint8Data) {
  try {
    const parser = new PDFParse(uint8Data);
    await parser.load();
    const textResult = await parser.getText();
    const text = textResult ? (textResult.text || "") : "";

    let empresa = null;
    let responsavel = null;
    let crea = null;
    let art = null;

    if (!text) return null;

    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Padrões de Empresa
      if (/TECNOCAD\s+ENGENHARIA/i.test(line)) empresa = "TECNOCAD ENGENHARIA LTDA";
      else if (/NOME:\s*([A-Z0-9\s\.\-&]{3,}(?:LTDA|EIRELI|S\/A|ENGENHARIA|CONSULTORIA|PROJETOS))/i.test(line)) {
        const m = line.match(/NOME:\s*([A-Z0-9\s\.\-&]{3,}(?:LTDA|EIRELI|S\/A|ENGENHARIA|CONSULTORIA|PROJETOS))/i);
        if (m && !empresa) empresa = m[1].trim();
      } else if (/EMPRESA:\s*([A-Z0-9\s\.\-&]{3,})/i.test(line)) {
        const m = line.match(/EMPRESA:\s*([A-Z0-9\s\.\-&]{3,})/i);
        if (m && !empresa) empresa = m[1].trim();
      }

      // Padrões de Responsável Técnico / Engenheiro
      if (/Rodrigo\s+Ribeiro\s+Braga\s+Godoy/i.test(line)) {
        responsavel = "Eng. Rodrigo Ribeiro Braga Godoy";
      } else if (/(?:Responsável\s+Técnico|Projetista|Autor\s+do\s+Projeto|Elaboração|Engenheiro(?:\s+Civil)?)\s*[:\-]?\s*(Eng[ºª\.]*\s+[A-ZÀ-Ú][a-zà-úA-ZÀ-Ú\s\.\-]+)/i.test(line)) {
        const m = line.match(/(?:Responsável\s+Técnico|Projetista|Autor\s+do\s+Projeto|Elaboração|Engenheiro(?:\s+Civil)?)\s*[:\-]?\s*(Eng[ºª\.]*\s+[A-ZÀ-Ú][a-zà-úA-ZÀ-Ú\s\.\-]+)/i);
        if (m && !responsavel) responsavel = m[1].trim();
      } else if (/^Eng[ºª\.]*\s+([A-ZÀ-Ú][a-zà-úA-ZÀ-Ú\s\.\-]+)/i.test(line)) {
        const m = line.match(/^Eng[ºª\.]*\s+([A-ZÀ-Ú][a-zà-úA-ZÀ-Ú\s\.\-]+)/i);
        if (m && !responsavel) responsavel = line.trim();
      }

      // Padrões de CREA / CAU
      if (/CREA\s*[:\-]?\s*([0-9\.\-\/\sA-Z]+(?:GO|DF|SP|MG|RJ|PR|SC|RS|BA|D\-GO))/i.test(line)) {
        const m = line.match(/CREA\s*[:\-]?\s*([0-9\.\-\/\sA-Z]+(?:GO|DF|SP|MG|RJ|PR|SC|RS|BA|D\-GO))/i);
        if (m && !crea) crea = m[1].trim();
      } else if (/CAU\s*[:\-]?\s*([0-9\.\-\/\sA-Z]+)/i.test(line)) {
        const m = line.match(/CAU\s*[:\-]?\s*([0-9\.\-\/\sA-Z]+)/i);
        if (m && !crea) crea = `CAU ${m[1].trim()}`;
      }

      // Padrões de ART / RRT
      if (/ART\s*[:\-]?\s*([0-9\.\-\/]+)/i.test(line)) {
        const m = line.match(/ART\s*[:\-]?\s*([0-9\.\-\/]+)/i);
        if (m && !art) art = m[1].trim();
      }
    }

    return { empresa, responsavel, crea, art, textLength: text.length };
  } catch (e) {
    return null;
  }
}

async function processarPastaProjeto(pastaOrigem) {
  const nomePasta = path.basename(pastaOrigem);
  const destinoProjeto = path.join(ORGANIZED_DIR, nomePasta);

  if (!fs.existsSync(destinoProjeto)) {
    fs.mkdirSync(destinoProjeto, { recursive: true });
  }

  const arquivos = fs.readdirSync(pastaOrigem);
  const zips = arquivos.filter(f => f.toLowerCase().endsWith(".zip"));
  const rars = arquivos.filter(f => f.toLowerCase().endsWith(".rar") || f.toLowerCase().endsWith(".7z"));
  const relatoriosMd = arquivos.filter(f => f.toLowerCase().endsWith(".md"));
  const manifestos = arquivos.filter(f => f.toLowerCase().endsWith(".json"));

  console.log(`\n==================================================================`);
  console.log(`📂 ORGANIZANDO: ${nomePasta}`);
  console.log(`==================================================================`);

  // Copiar relatórios e manifesto
  for (const f of [...relatoriosMd, ...manifestos]) {
    fs.copyFileSync(path.join(pastaOrigem, f), path.join(destinoProjeto, f));
  }

  const hashesVistos = new Set();
  const arquivosExtraidos = [];
  let projetistasDetectados = [];

  // Descompactar e deduplicar ZIPs
  for (const zipNome of zips) {
    const zipPath = path.join(pastaOrigem, zipNome);
    try {
      const zip = new AdmZip(zipPath);
      const entries = zip.getEntries();
      console.log(`   📦 Descompactando ${zipNome} (${entries.length} itens)...`);

      for (const entry of entries) {
        if (entry.isDirectory) continue;

        const entryBuffer = entry.getData();
        const hash = getFileHash(entryBuffer);

        if (hashesVistos.has(hash)) {
          // Arquivo idêntico já extraído
          continue;
        }
        hashesVistos.add(hash);

        // Caminho de extração organizado dentro da pasta do projeto
        const subPath = entry.entryName.replace(/^[\/\\]+/, "");
        const targetPath = path.join(destinoProjeto, "arquivos_descompactados", subPath);
        const targetDir = path.dirname(targetPath);

        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        fs.writeFileSync(targetPath, entryBuffer);
        arquivosExtraidos.push({
          arquivo: subPath,
          tamanhoBytes: entryBuffer.length,
          tamanhoMB: (entryBuffer.length / (1024 * 1024)).toFixed(2),
          hash
        });

        // Se for PDF, analisar conteúdo para encontrar projetista/empresa
        if (entry.entryName.toLowerCase().endsWith(".pdf")) {
          const info = await extrairInfoProjetistaDePdf(new Uint8Array(entryBuffer));
          if (info && (info.empresa || info.responsavel || info.crea)) {
            projetistasDetectados.push({
              arquivoFonte: subPath,
              ...info
            });
          }
        }
      }
    } catch (err) {
      console.error(`   ⚠️ Erro ao descompactar ${zipNome}:`, err.message);
    }
  }

  // Consolidar melhor inferência de Projetista e Empresa
  let melhorEmpresa = null;
  let melhorResponsavel = null;
  let melhorCrea = null;

  for (const p of projetistasDetectados) {
    if (!melhorEmpresa && p.empresa) melhorEmpresa = p.empresa;
    if (!melhorResponsavel && p.responsavel) melhorResponsavel = p.responsavel;
    if (!melhorCrea && p.crea) melhorCrea = p.crea;
  }

  console.log(`   🎯 Autoria Identificada:`);
  console.log(`      Empresa Projetista: ${melhorEmpresa || "Não identificada automaticamente"}`);
  console.log(`      Responsável Técnico: ${melhorResponsavel || "Não identificado automaticamente"}`);
  console.log(`      Registro CREA/CAU: ${melhorCrea || "-"}`);
  console.log(`      Total de arquivos únicos extraídos: ${arquivosExtraidos.length}`);

  // Salvar sumário de autoria e arquivos organizados
  const infoAutoria = {
    projeto: nomePasta,
    empresaProjetista: melhorEmpresa,
    responsavelTecnico: melhorResponsavel,
    registroProfissional: melhorCrea,
    totalArquivosUnicos: arquivosExtraidos.length,
    arquivos: arquivosExtraidos,
    evidencias: projetistasDetectados
  };

  fs.writeFileSync(
    path.join(destinoProjeto, "autoria_e_arquivos.json"),
    JSON.stringify(infoAutoria, null, 2)
  );

  // Atualizar o relatório Markdown com os dados do projetista/empresa
  if (relatoriosMd.length > 0) {
    const mdOrig = path.join(destinoProjeto, relatoriosMd[0]);
    let mdText = fs.readFileSync(mdOrig, "utf-8");

    let blocoAutoria = `\n## 👷 4. Autoria Técnica e Empresa Projetista\n\n`;
    blocoAutoria += `| Identificação Técnica | Detalhe |\n|---|---|\n`;
    blocoAutoria += `| **Empresa Projetista** | **${melhorEmpresa || "Consultar pranchas/memoriais"}** |\n`;
    blocoAutoria += `| **Responsável Técnico** | **${melhorResponsavel || "Consultar pranchas/memoriais"}** |\n`;
    blocoAutoria += `| **Registro Profissional** | ${melhorCrea || "-"} |\n`;
    blocoAutoria += `| **Total Arquivos Únicos (Deduplicados)** | **${arquivosExtraidos.length}** |\n\n`;

    if (!mdText.includes("## 👷 4. Autoria Técnica")) {
      mdText += blocoAutoria;
      fs.writeFileSync(mdOrig, mdText, "utf-8");
    }
  }

  return infoAutoria;
}

async function executarOrganizacao() {
  const pastas = fs.readdirSync(BASE_DIR).filter(p => p.startsWith("PROJETO_"));
  console.log(`Encontradas ${pastas.length} pastas de projetos em ${BASE_DIR}...`);

  const resultados = [];
  for (const pasta of pastas) {
    const res = await processarPastaProjeto(path.join(BASE_DIR, pasta));
    resultados.push(res);
  }

  fs.writeFileSync(
    path.join(ORGANIZED_DIR, "consolidado_projetistas_anapolis.json"),
    JSON.stringify(resultados, null, 2)
  );

  console.log(`\n✅ Organização e identificação concluída para ${resultados.length} projetos!`);
}

if (require.main === module) {
  executarOrganizacao().catch(console.error);
}

module.exports = { processarPastaProjeto, executarOrganizacao };
