"use strict";

/**
 * Script Híbrido DocFlow:
 * 1. Playwright realiza o login no Portal Saneago (/prt/) e captura os cookies de sessão.
 * 2. Módulo HTTP nativo do Node.js utiliza esses cookies para fazer requisições diretas de documentos por ID.
 */

const { chromium } = require("playwright");
const https = require("https");
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://www.saneago.com.br";
const DEFAULT_DOC_ID = process.argv[2] || "396444";

const CREDENTIALS = {
  usuario: process.env.SANEAGO_USER || "m175374",
  senha: process.env.SANEAGO_PASS || "MJr@@7527"
};

/**
 * Faz o login no Portal Saneago usando o Playwright e retorna a string de cookies
 */
async function loginWithPlaywright() {
  console.log("==================================================================");
  console.log("ETAPA 1: Login no Portal Saneago (/prt/) via Playwright");
  console.log("==================================================================");
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  const portalUrl = `${BASE_URL}/prt/`;
  console.log(`🌐 Navegando para o Portal Saneago: ${portalUrl}`);
  
  try {
    await page.goto(portalUrl, { waitUntil: "networkidle", timeout: 60000 });
  } catch (err) {
    console.warn(`⚠️ Aviso no carregamento do Portal: ${err.message}`);
  }

  console.log(`📝 Preenchendo usuário '${CREDENTIALS.usuario}' e senha no Portal ZK...`);
  const userInput = page.locator("input[type='text']").first();
  const passInput = page.locator("input[type='password']").first();

  await userInput.fill(CREDENTIALS.usuario);
  await userInput.dispatchEvent("change");
  await userInput.dispatchEvent("blur");

  await passInput.fill(CREDENTIALS.senha);
  await passInput.dispatchEvent("change");
  await passInput.dispatchEvent("blur");

  console.log("🚀 Submetendo login (Pressionando Enter)...");
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle", timeout: 60000 }).catch(e => console.warn(`Aviso no pós-navigation: ${e.message}`)),
    passInput.press("Enter")
  ]);

  console.log(`📍 Página atual pós-login: ${page.url()}`);

  const scratchDir = path.join(__dirname, "scratch");
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });
  await page.screenshot({ path: path.join(scratchDir, "portal_playwright_login.png"), fullPage: true });

  // Capturar todos os cookies do contexto
  const cookies = await context.cookies();
  console.log(`✅ ${cookies.length} cookie(s) de sessão capturado(s):`);
  cookies.forEach(c => console.log(`   - ${c.name}=${c.value.substring(0, 35)}... (domain: ${c.domain})`));

  // Fechar o navegador
  await browser.close();

  // Converter cookies para string de cabeçalho HTTP
  const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join("; ");
  return cookieHeader;
}

/**
 * Realiza requisição HTTP nativa usando os cookies capturados do Portal
 */
function makeHttpRequest(urlStr, cookieHeader, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(urlStr, BASE_URL);
    const headers = {
      "Host": parsedUrl.hostname,
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      "Cookie": cookieHeader,
      "Referer": `${BASE_URL}/prt/mpt/principal.zul`,
      ...options.headers
    };

    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || "GET",
      headers,
      rejectUnauthorized: false
    };

    const req = https.request(reqOptions, (res) => {
      const chunks = [];
      res.on("data", chunk => chunks.push(chunk));
      res.on("end", () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: buffer,
          text: () => buffer.toString("utf-8"),
          url: parsedUrl.toString()
        });
      });
    });

    req.on("error", reject);

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

/**
 * Função Principal
 */
async function main() {
  const docId = DEFAULT_DOC_ID;

  // 1. Playwright faz login no Portal Saneago e retorna os cookies
  const cookieHeader = await loginWithPlaywright();

  if (!cookieHeader) {
    throw new Error("Nenhum cookie foi retornado após o login no Portal via Playwright!");
  }

  // 2. HTTP nativo faz a requisição do documento por ID
  console.log("\n==================================================================");
  console.log(`ETAPA 2: Requisição HTTP Nativa do Documento ID #${docId}`);
  console.log("==================================================================");

  const docUrl = `${BASE_URL}/docflow/xhtml/consultarDocumento.jsf?idDocumento=${docId}`;
  console.log(`🌐 Efetuando GET HTTP para: ${docUrl}`);

  const response = await makeHttpRequest(docUrl, cookieHeader);

  console.log(`📊 Status HTTP: ${response.statusCode}`);
  console.log(`📋 Content-Type: ${response.headers["content-type"] || "não especificado"}`);
  console.log(`📏 Tamanho do Body: ${response.body.length} bytes`);

  const scratchDir = path.join(__dirname, "scratch");
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });

  const contentType = response.headers["content-type"] || "";
  if (contentType.includes("pdf")) {
    const pdfPath = path.join(scratchDir, `docflow_${docId}_http.pdf`);
    fs.writeFileSync(pdfPath, response.body);
    console.log(`🎉 Sucesso! PDF do documento #${docId} salvo em: ${pdfPath}`);
  } else {
    const htmlPath = path.join(scratchDir, `docflow_${docId}_http.html`);
    fs.writeFileSync(htmlPath, response.text());
    console.log(`📄 Resposta da requisição HTTP salva em: ${htmlPath}`);

    if (response.statusCode === 302 || response.statusCode === 301) {
      console.log(`➡️ Redirecionado para: ${response.headers.location}`);
    }
  }

  console.log("\n✅ Processo Híbrido Concluído com Sucesso!");
}

main().catch(err => {
  console.error("❌ Erro durante a execução:", err);
  process.exit(1);
});
