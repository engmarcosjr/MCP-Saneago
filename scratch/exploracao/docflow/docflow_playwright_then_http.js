"use strict";

/**
 * Script Oficial de Download de PDFs do DocFlow / Saneago
 * 
 * Sequência de Autenticação e Download de Anexos/PDFs Brutos:
 * 1. Login no Portal Saneago (/prt/).
 * 2. Validação da Sessão SSO via /prt/GerenciadorDocumento.jsp.
 * 3. Navegação até a consulta do ID: /docflow/xhtml/consultarDocumento.jsf?idDocumento=<ID>.
 * 4. Disparo do clique no botão 'Visualizar' (id: j_idt398 ou texto Visualizar), baixando o PDF original bruto.
 */

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://www.saneago.com.br";
const DEFAULT_DOC_ID = process.argv[2] || "3665147";

const CREDENTIALS = {
  usuario: process.env.SANEAGO_USER || "m175374",
  senha: process.env.SANEAGO_PASS || "MJr@@7527"
};

async function downloadDocflowPdf(docId = DEFAULT_DOC_ID) {
  console.log("==================================================================");
  console.log(`BAIXANDO O ARQUIVO PDF ORIGINAL DO DOCFLOW ID #${docId}`);
  console.log("==================================================================");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  // Etapa 1: Login no Portal
  console.log("\n1. Efetuando login no Portal Saneago (/prt/)...");
  await page.goto(`${BASE_URL}/prt/`, { waitUntil: "networkidle" });
  await page.locator("input[type='text']").first().fill(CREDENTIALS.usuario);
  await page.locator("input[type='password']").first().fill(CREDENTIALS.senha);

  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle" }),
    page.locator("input[type='password']").first().press("Enter")
  ]);

  console.log(`✅ Login no Portal OK! (${page.url()})`);

  // Etapa 2: GerenciadorDocumento.jsp -> SSO DocFlow
  console.log("\n2. Inicializando a sessão SSO do DocFlow via GerenciadorDocumento.jsp...");
  await page.goto(`${BASE_URL}/prt/GerenciadorDocumento.jsp`, { waitUntil: "networkidle" });
  console.log(`📍 Dashboard ativado: ${page.url()}`);

  // Etapa 3: Abrir consulta do Documento
  const docUrl = `${BASE_URL}/docflow/xhtml/consultarDocumento.jsf?idDocumento=${docId}`;
  console.log(`\n3. Abrindo consulta do documento ID #${docId}: ${docUrl}`);
  await page.goto(docUrl, { waitUntil: "networkidle" });

  // Etapa 4: Disparar evento de download ao clicar no botão Visualizar
  console.log("\n4. Solicitando download do arquivo PDF original ao servidor...");
  const downloadPromise = page.waitForEvent("download", { timeout: 20000 }).catch(err => {
    console.error("Timeout ao aguardar evento de download:", err.message);
    return null;
  });

  // Tentar clicar no botão Visualizar (id #j_idt398 ou por texto)
  const itemVisualizar = page.locator("#j_idt398, .rf-ddm-itm:has-text('Visualizar'), span:has-text('Visualizar')").first();
  if (await itemVisualizar.count() > 0) {
    await itemVisualizar.click({ force: true }).catch(() => {});
  } else {
    // Fallback via avaliação DOM JS
    await page.evaluate(() => {
      const el = document.getElementById("j_idt398") || document.querySelector(".rf-ddm-itm");
      if (el) el.click();
    });
  }

  let download = await downloadPromise;

  if (!download) {
    // Tentar fallback 2: submeter form diretamente se houver
    console.log("Tentando fallback de disparo via evaluate...");
    const downloadPromise2 = page.waitForEvent("download", { timeout: 15000 }).catch(() => null);
    await page.evaluate(() => {
      const el = document.getElementById("j_idt398");
      if (el) el.click();
    });
    download = await downloadPromise2;
  }

  if (!download) {
    throw new Error(`Não foi possível capturar o download do documento #${docId}.`);
  }

  const filename = download.suggestedFilename();
  const scratchDir = path.join(__dirname, "scratch");
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });

  const finalPdfPath = path.join(scratchDir, `DocFlow_${docId}_ORIGINAL_${filename}`);
  await download.saveAs(finalPdfPath);

  const stats = fs.statSync(finalPdfPath);
  console.log(`\n🎉 SUCESSO ABSOLUTO! PDF ORIGINAL BAIXADO COM SUCESSO!`);
  console.log(`   Caminho do Arquivo: ${finalPdfPath}`);
  console.log(`   Nome do Arquivo Servidor: ${filename}`);
  console.log(`   Tamanho do Arquivo: ${(stats.size / 1024 / 1024).toFixed(2)} MB (${stats.size} bytes)`);

  await browser.close();

  return { pdfPath: finalPdfPath, filename, size: stats.size };
}

if (require.main === module) {
  downloadDocflowPdf(DEFAULT_DOC_ID).catch(err => {
    console.error("❌ Erro no download do DocFlow:", err);
    process.exit(1);
  });
}

module.exports = { downloadDocflowPdf };
