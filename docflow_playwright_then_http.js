"use strict";

/**
 * Script Híbrido DocFlow:
 * 1. Playwright realiza o login no formulário JSF/Portal e captura os cookies de sessão.
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
 * Faz o login no DocFlow usando o Playwright e retorna a lista de cookies de sessão
 */
async function loginWithPlaywright() {
  console.log("==================================================================");
  console.log("ETAPA 1: Login via Playwright no DocFlow");
  console.log("==================================================================");
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  const loginUrl = `${BASE_URL}/docflow/xhtml/docflow/geral/login.jsf`;
  console.log(`🔑 Navegando para a página de login: ${loginUrl}`);
  
  try {
    await page.goto(loginUrl, { waitUntil: "networkidle", timeout: 60000 });
  } catch (err) {
    console.warn(`⚠️ Aviso no carregamento inicial da página de login: ${err.message}`);
  }

  console.log(`📝 Preenchendo credenciais para usuário '${CREDENTIALS.usuario}'...`);
  await page.fill("#userName", CREDENTIALS.usuario);
  await page.fill("#password", CREDENTIALS.senha);

  console.log("🚀 Submetendo formulário de login...");
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle", timeout: 60000 }).catch(e => console.warn(`Aviso no pós-navigation: ${e.message}`)),
    page.click("input[type='submit'][value='Entrar']")
  ]);

  console.log(`📍 Página atual pós-login: ${page.url()}`);

  // Capturar todos os cookies do contexto
  const cookies = await context.cookies();
  console.log(`✅ ${cookies.length} cookie(s) de sessão capturado(s):`);
  cookies.forEach(c => console.log(`   - ${c.name}=${c.value.substring(0, 35)}...`));

  const scratchDir = path.join(__dirname, "scratch");
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });
  await page.screenshot({ path: path.join(scratchDir, "docflow_playwright_login.png"), fullPage: true });

  // Fechar o navegador
  await browser.close();

  // Converter cookies para string de cabeçalho HTTP
  const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join("; ");
  return cookieHeader;
}

/**
 * Realiza requisição HTTP nativa usando a string de cookie capturada
 */
function makeHttpRequest(urlStr, cookieHeader, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(urlStr, BASE_URL);
    const headers = {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      "Cookie": cookieHeader,
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

  // 1. Playwright faz login e retorna os cookies
  const cookieHeader = await loginWithPlaywright();

  if (!cookieHeader) {
    throw new Error("Nenhum cookie foi retornado após o login via Playwright!");
  }

  // 2. HTTP nativo faz a requisição do documento por ID
  console.log("\n==================================================================");
  console.log(`ETAPA 2: Requisição HTTP Nativa do Documento ID #${docId}`);
  console.log("==================================================================");

  const docUrl = `${BASE_URL}/docflow/xhtml/consultarDocumento.jsf?idDocumento=${docId}`;
  console.log(`🌐 Efetuando GET HTTP para: ${docUrl}`);

  const response = await makeHttpRequest(docUrl, cookieHeader, {
    headers: {
      "Referer": `${BASE_URL}/docflow/xhtml/docflow/geral/login.jsf`
    }
  });

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

    // Se houver redirecionamento 302 ou verificação adicional
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
