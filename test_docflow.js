const { chromium } = require("playwright");
const https = require("https");
const path = require("path");
const fs = require("fs");

const BASE_URL = "https://www.saneago.com.br";
const docId = process.argv[2] || "396444";

const credentials = {
  usuario: process.env.SANEAGO_USER || "m175374",
  senha: process.env.SANEAGO_PASS || "MJr@@7527"
};

function makeHttpRequest(urlStr, cookieHeader) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(urlStr, BASE_URL);
    const headers = {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Cookie": cookieHeader,
      "Referer": `${BASE_URL}/docflow/xhtml/docflow/geral/login.jsf`
    };

    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: "GET",
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
          text: () => buffer.toString("utf-8")
        });
      });
    });

    req.on("error", reject);
    req.end();
  });
}

async function main() {
  console.log("==================================================================");
  console.log("ETAPA 1: Login Headless via Playwright");
  console.log("==================================================================");
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  const loginUrl = `${BASE_URL}/docflow/xhtml/docflow/geral/login.jsf`;
  console.log(`Navegando para o login: ${loginUrl}`);
  
  try {
    await page.goto(loginUrl, { waitUntil: "networkidle", timeout: 60000 });
  } catch (e) {
    console.warn(`Aviso no carregamento: ${e.message}`);
  }

  console.log(`Preenchendo credenciais (${credentials.usuario})...`);
  await page.fill("#userName", credentials.usuario);
  await page.fill("#password", credentials.senha);

  console.log("Submetendo formulário...");
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle", timeout: 60000 }).catch(() => {}),
    page.click("input[type='submit'][value='Entrar']")
  ]);

  const cookies = await context.cookies();
  console.log(`✅ ${cookies.length} cookie(s) de sessão obtidos via Playwright.`);
  
  await browser.close();

  const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join("; ");

  console.log("\n==================================================================");
  console.log(`ETAPA 2: Requisição HTTP Nativa para o Documento ID #${docId}`);
  console.log("==================================================================");

  const docUrl = `${BASE_URL}/docflow/xhtml/consultarDocumento.jsf?idDocumento=${docId}`;
  console.log(`Buscando documento em: ${docUrl}`);

  const res = await makeHttpRequest(docUrl, cookieHeader);

  console.log(`Status HTTP: ${res.statusCode}`);
  console.log(`Content-Type: ${res.headers["content-type"] || "N/A"}`);

  const scratchDir = path.join(__dirname, "scratch");
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });

  const contentType = res.headers["content-type"] || "";
  if (contentType.includes("pdf")) {
    const pdfPath = path.join(scratchDir, `DocFlow_${docId}_http.pdf`);
    fs.writeFileSync(pdfPath, res.body);
    console.log(`PDF salvo com sucesso em: ${pdfPath}`);
  } else {
    const htmlPath = path.join(scratchDir, `DocFlow_${docId}_http.html`);
    fs.writeFileSync(htmlPath, res.text());
    console.log(`Resposta da requisição salva em: ${htmlPath}`);
  }
}

main().catch(err => {
  console.error("Erro ao processar DocFlow:", err);
  process.exit(1);
});

main().catch(err => {
  console.error("Erro ao processar DocFlow:", err);
  process.exit(1);
});
