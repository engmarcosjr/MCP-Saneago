"use strict";

/**
 * Sniffer de Rede Avançado para Captura do Download de Documentos DocFlow
 */

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const scratchDir = path.join(__dirname, "scratch");
if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });

const logFilePath = path.join(scratchDir, "network_capture.log");
const jsonLogPath = path.join(scratchDir, "network_capture.json");

const capturedItems = [];
const logStream = fs.createWriteStream(logFilePath, { flags: "a" });

function log(msg) {
  console.log(msg);
  logStream.write(msg + "\n");
}

async function startSniffer() {
  log("\n==================================================================");
  log("🔥 SNIFFER DE REDE ATIVO (HEADLESS: FALSE)");
  log("==================================================================");
  log("Instruções:");
  log("1. Na janela do navegador que abriu, faça o login no Portal.");
  log("2. Abra a aplicação DocFlow / Gestão de Documentos.");
  log("3. Acesse o documento desejado e clique no botão para BAIXAR / EXPORTAR o PDF.");
  log("==================================================================\n");

  const browser = await chromium.launch({
    headless: false,
    args: ["--start-maximized"]
  });

  const context = await browser.newContext({
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    ignoreHTTPSErrors: true,
    viewport: null
  });

  const page = await context.newPage();

  // Escutar requisições
  page.on("request", req => {
    const item = {
      time: new Date().toISOString(),
      type: "REQUEST",
      method: req.method(),
      url: req.url(),
      headers: req.headers(),
      postData: req.postData() || null
    };
    capturedItems.push(item);

    if (item.url.includes("docflow") || item.url.includes("Download") || item.url.includes("export") || item.url.includes("zkau")) {
      log(`\n[REQ ${item.method}] ${item.url}`);
      if (item.postData) {
        log(`   Payload: ${item.postData.substring(0, 400)}`);
      }
    }
  });

  // Escutar respostas
  page.on("response", async res => {
    const contentType = res.headers()["content-type"] || "";
    const contentDisposition = res.headers()["content-disposition"] || "";

    const item = {
      time: new Date().toISOString(),
      type: "RESPONSE",
      status: res.status(),
      url: res.url(),
      contentType,
      contentDisposition,
      headers: res.headers()
    };
    capturedItems.push(item);

    if (contentType.includes("pdf") || contentDisposition.includes("attachment") || res.url().includes("Download") || res.url().includes("export") || res.url().includes("consultarDocumento")) {
      log(`\n🔥 [RES ${item.status}] ${item.url}`);
      log(`   Content-Type: ${contentType}`);
      log(`   Content-Disposition: ${contentDisposition}`);
      if (res.headers()["set-cookie"]) {
        log(`   Set-Cookie: ${JSON.stringify(res.headers()["set-cookie"])}`);
      }
    }
  });

  // Escutar evento de download
  page.on("download", async download => {
    const filename = download.suggestedFilename();
    const url = download.url();
    log(`\n🎉🎉🎉 DOWNLOAD CAPTURADO COM SUCESSO! 🎉🎉🎉`);
    log(`   URL do Download: ${url}`);
    log(`   Nome do Arquivo: ${filename}`);

    const savePath = path.join(scratchDir, `REAL_DOWNLOAD_${filename}`);
    await download.saveAs(savePath);
    log(`   Salvo em: ${savePath}`);

    // Salvar estado dos cookies imediatamente
    const cookies = await context.cookies();
    fs.writeFileSync(path.join(scratchDir, "download_cookies.json"), JSON.stringify(cookies, null, 2));
    log(`   Cookies de sessão salvos em scratch/download_cookies.json`);
  });

  log("Abrindo Portal Saneago: https://www.saneago.com.br/prt/ ...");
  await page.goto("https://www.saneago.com.br/prt/");

  // Manter o navegador ativo por 30 minutos
  await page.waitForTimeout(1800000).catch(() => {});

  fs.writeFileSync(jsonLogPath, JSON.stringify(capturedItems, null, 2));
  await browser.close();
}

startSniffer().catch(console.error);
