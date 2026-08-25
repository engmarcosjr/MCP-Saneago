const https = require("https");
const fs = require("fs");
const path = require("path");
const { URLSearchParams } = require("url");

const BASE_URL = "https://www.saneago.com.br";
const USER = "m175374";
const PASS = "MJr@@7527";

class CookieManager {
  constructor() {
    this.cookies = new Map();
  }

  getCookieHeader() {
    return Array.from(this.cookies.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
  }

  updateCookies(setCookieHeader) {
    if (!setCookieHeader) return;
    const cookiesList = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    for (const header of cookiesList) {
      const parts = header.split(";")[0].split("=");
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join("=").trim();
        if (value && value !== '""') {
          this.cookies.set(key, value);
        }
      }
    }
  }
}

function makeRequest(urlStr, options = {}, cookieManager) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(urlStr);
    const headers = {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      ...options.headers
    };

    const cookieStr = cookieManager.getCookieHeader();
    if (cookieStr) {
      headers["Cookie"] = cookieStr;
    }

    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || "GET",
      headers,
      rejectUnauthorized: false
    };

    const req = https.request(reqOptions, (res) => {
      cookieManager.updateCookies(res.headers["set-cookie"]);

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

async function testDocFlowHttpAuth() {
  const cookieManager = new CookieManager();

  console.log("=== TESTANDO AUTENTICAÇÃO DIRETA HTTP NO DOCFLOW ===\n");

  console.log("1. GET /docflow/xhtml/docflow/geral/login.jsf");
  const loginGet = await makeRequest(`${BASE_URL}/docflow/xhtml/docflow/geral/login.jsf`, {}, cookieManager);
  console.log(`Status: ${loginGet.statusCode}`);
  console.log(`Cookies obtidos: ${cookieManager.getCookieHeader()}`);

  const htmlText = loginGet.text();
  const viewStateMatch = htmlText.match(/name="javax\.faces\.ViewState"\s+value="([^"]+)"/);
  if (!viewStateMatch) {
    throw new Error("ViewState não encontrado!");
  }
  const viewState = viewStateMatch[1];
  console.log(`ViewState: ${viewState}\n`);

  // Testar combinação de POST
  console.log("2. POST /docflow/xhtml/docflow/geral/login.jsf");
  const postData = new URLSearchParams();
  postData.append("j_idt58", "j_idt58");
  postData.append("userName", USER);
  postData.append("password", PASS);
  postData.append("j_idt71", "Entrar");
  postData.append("javax.faces.ViewState", viewState);

  const postBodyStr = postData.toString();

  const loginPost = await makeRequest(`${BASE_URL}/docflow/xhtml/docflow/geral/login.jsf`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(postBodyStr),
      "Referer": `${BASE_URL}/docflow/xhtml/docflow/geral/login.jsf`
    },
    body: postBodyStr
  }, cookieManager);

  console.log(`Status POST: ${loginPost.statusCode}`);
  console.log(`Location Header: ${loginPost.headers.location || "Nenhum (Permaneceu na mesma página ou 200)"}`);
  console.log(`Cookies após POST: ${cookieManager.getCookieHeader()}`);

  const postResText = loginPost.text();

  // Verificar se há mensagem de erro ou redirecionamento no HTML retornado
  if (postResText.includes("Inválido") || postResText.includes("incorret") || postResText.includes("Atenção")) {
    console.log("⚠️ Possível alerta na página:");
    const alertMatch = postResText.match(/<span class="txtModalSubmit">([^<]+)<\/span>/i) || postResText.match(/jAlert\('([^']+)'/);
    if (alertMatch) console.log("Alerta:", alertMatch[1]);
  }

  // Tentar acessar o documento 396444 agora que a sessão do DocFlow foi tentada
  console.log("\n3. GET /docflow/xhtml/consultarDocumento.jsf?idDocumento=396444");
  const docRes = await makeRequest(`${BASE_URL}/docflow/xhtml/consultarDocumento.jsf?idDocumento=396444`, {
    headers: {
      "Referer": `${BASE_URL}/docflow/xhtml/docflow/geral/login.jsf`
    }
  }, cookieManager);

  console.log(`Status GET documento: ${docRes.statusCode}`);
  console.log(`Location: ${docRes.headers.location || "Nenhum"}`);

  if (docRes.statusCode === 302 && docRes.headers.location) {
    console.log(`Redirecionado para: ${docRes.headers.location}`);
    const followRes = await makeRequest(new URL(docRes.headers.location, BASE_URL).toString(), {}, cookieManager);
    console.log(`Status da página redirecionada: ${followRes.statusCode}`);
  } else {
    console.log(`Content-Type: ${docRes.headers["content-type"]}`);
    console.log(`Tamanho do Body: ${docRes.body.length} bytes`);
  }
}

testDocFlowHttpAuth().catch(console.error);
