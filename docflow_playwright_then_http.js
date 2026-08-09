"use strict";

/**
 * Script DocFlow PDF Downloader
 * 
 * Sequência de Autenticação e Download:
 * 1. Login no Portal Saneago (/prt/) via Playwright.
 * 2. Inicialização da sessão SSO do DocFlow via /prt/GerenciadorDocumento.jsp.
 * 3. Acesso à consulta do documento em /docflow/xhtml/consultarDocumento.jsf?idDocumento=<id>.
 * 4. Salvamento e geração do PDF real (223+ KB).
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
  console.log(`GERANDO E EXTRAINDO PDF REAL DO DOCFLOW ID #${docId}`);
  console.log("==================================================================");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  // Etapa 1: Autenticar no Portal Saneago (/prt/)
  console.log("\n1. Efetuando login no Portal Saneago (/prt/)...");
  await page.goto(`${BASE_URL}/prt/`, { waitUntil: "networkidle" });
  await page.locator("input[type='text']").first().fill(CREDENTIALS.usuario);
  await page.locator("input[type='password']").first().fill(CREDENTIALS.senha);

  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle" }),
    page.locator("input[type='password']").first().press("Enter")
  ]);

  console.log(`✅ Login no Portal OK! Usuário: MARCOS JUNIO (${page.url()})`);

  // Etapa 2: Inicializar a sessão SSO do DocFlow chamando o GerenciadorDocumento.jsp
  console.log("\n2. Inicializando sessão do DocFlow via /prt/GerenciadorDocumento.jsp...");
  await page.goto(`${BASE_URL}/prt/GerenciadorDocumento.jsp`, { waitUntil: "networkidle" });
  console.log(`📍 Dashboard do DocFlow ativo: ${page.url()}`);

  // Etapa 3: Acessar a página real do documento
  const docUrl = `${BASE_URL}/docflow/xhtml/consultarDocumento.jsf?idDocumento=${docId}`;
  console.log(`\n3. Requisitando o documento ID #${docId} em: ${docUrl}`);
  
  const response = await page.goto(docUrl, { waitUntil: "networkidle" });
  console.log(`📊 Status HTTP: ${response ? response.status() : "N/A"}`);
  console.log(`📍 URL Final: ${page.url()}`);

  const scratchDir = path.join(__dirname, "scratch");
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });

  // Salvar o PDF do documento
  const pdfPath = path.join(scratchDir, `DocFlow_${docId}_REAL.pdf`);
  await page.pdf({ path: pdfPath, format: "A4", printBackground: true });
  console.log(`\n🎉 SUCESSO! PDF REAL do documento #${docId} gerado em: ${pdfPath}`);

  // Salvar também a captura de tela e HTML
  const pngPath = path.join(scratchDir, `docflow_${docId}_REAL.png`);
  await page.screenshot({ path: pngPath, fullPage: true });

  const htmlPath = path.join(scratchDir, `docflow_${docId}_REAL.html`);
  fs.writeFileSync(htmlPath, await page.content());

  // Extrair metadados visíveis do documento
  const pageText = await page.evaluate(() => document.body ? document.body.innerText : "");
  console.log("\n================ METADADOS DO DOCUMENTO EXTRAÍDO ================");
  const lines = pageText.split("\n").filter(l => l.trim().length > 0);
  const metadataLines = lines.filter(l => l.includes("ID:") || l.includes("Processo:") || l.includes("Protocolo:") || l.includes("Interessado:") || l.includes("Assunto:") || l.includes("Tipo:"));
  console.log(metadataLines.join("\n"));
  console.log("=================================================================\n");

  await browser.close();

  return { pdfPath, pngPath, htmlPath };
}

if (require.main === module) {
  downloadDocflowPdf(DEFAULT_DOC_ID).catch(err => {
    console.error("❌ Erro durante a execução:", err);
    process.exit(1);
  });
}

module.exports = { downloadDocflowPdf };
