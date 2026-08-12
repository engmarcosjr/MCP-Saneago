const https = require("https");
const fs = require("fs");
const path = require("path");
const { URLSearchParams } = require("url");

const BASE_URL = "https://www.saneago.com.br";
const USER = "m175374";
const PASS = "MJr@@1511";

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
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
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

async function runDynamicJsfLogin() {
  const cookieManager = new CookieManager();

  console.log("==================================================================");
  console.log("REQUISIÇÃO DIRETA HTTP DICA DE PARSER DINÂMICO JSF (0% PLAYWRIGHT)");
  console.log("==================================================================\n");

  console.log("1. GET /docflow/xhtml/docflow/geral/login.jsf");
  const loginGet = await makeRequest(`${BASE_URL}/docflow/xhtml/docflow/geral/login.jsf`, {}, cookieManager);
  const html = loginGet.text();

  // Extrair ViewState
  const viewStateMatch = html.match(/name="javax\.faces\.ViewState"\s+value="([^"]+)"/);
  const viewState = viewStateMatch ? viewStateMatch[1] : "";

  // Extrair ID do Form principal (j_idt...)
  const formMatch = html.match(/<form id="([^"]+)" name="([^"]+)" method="post"/i);
  const formId = formMatch ? formMatch[1] : "j_idt58";

  // Extrair inputs dentro do form de login
  // Username input: type="text"
  const userInputMatch = html.match(/<input [^>]*name="([^"]+)"[^>]*class="formlogin"[^>]*type="text"/i) || 
                         html.match(/<input [^>]*type="text"[^>]*name="([^"]+)"[^>]*class="formlogin"/i);
  const userNameFieldName = userInputMatch ? userInputMatch[1] : "userName";

  // Password input: type="password"
  const passInputMatch = html.match(/<input [^>]*name="([^"]+)"[^>]*class="formlogin"[^>]*type="password"/i) || 
                         html.match(/<input [^>]*type="password"[^>]*name="([^"]+)"[^>]*class="formlogin"/i);
  const passFieldName = passInputMatch ? passInputMatch[1] : "password";

  // Submit button input: type="submit" value="Entrar"
  const submitMatch = html.match(/<input [^>]*name="([^"]+)"[^>]*value="Entrar"/i) ||
                      html.match(/<input [^>]*value="Entrar"[^>]*name="([^"]+)"/i);
  const submitFieldName = submitMatch ? submitMatch[1] : "j_idt71";

  console.log(`Parâmetros Dinâmicos JSF Detectados:`);
  console.log(` - Form ID: ${formId}`);
  console.log(` - Campo Usuário: ${userNameFieldName}`);
  console.log(` - Campo Senha: ${passFieldName}`);
  console.log(` - Campo Submit: ${submitFieldName}`);
  console.log(` - ViewState: ${viewState}`);
  console.log(` - Cookies: ${cookieManager.getCookieHeader()}\n`);

  console.log("2. Enviando POST HTTP com parâmetros dinâmicos...");
  const postData = new URLSearchParams();
  postData.append(formId, formId);
  postData.append(userNameFieldName, USER);
  postData.append(passFieldName, PASS);
  postData.append(submitFieldName, "Entrar");
  postData.append("javax.faces.ViewState", viewState);

  const postBody = postData.toString();

  const postRes = await makeRequest(`${BASE_URL}/docflow/xhtml/docflow/geral/login.jsf`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(postBody),
      "Referer": `${BASE_URL}/docflow/xhtml/docflow/geral/login.jsf`
    },
    body: postBody
  }, cookieManager);

  console.log(`Status POST: ${postRes.statusCode}`);
  console.log(`Location Header: ${postRes.headers.location || "Nenhum"}`);
  console.log(`Cookies pós-POST: ${cookieManager.getCookieHeader()}\n`);

  const scratchDir = path.join(__dirname, "scratch");
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });
  fs.writeFileSync(path.join(scratchDir, "post_dynamic_res.html"), postRes.text());

  // 3. Tentar acessar o documento 396444
  const docId = "396444";
  console.log(`3. Requisitando documento ${docId} via GET HTTP direto...`);
  const docRes = await makeRequest(`${BASE_URL}/docflow/xhtml/consultarDocumento.jsf?idDocumento=${docId}`, {
    headers: {
      "Referer": `${BASE_URL}/docflow/xhtml/docflow/geral/login.jsf`
    }
  }, cookieManager);

  console.log(`Status GET Documento: ${docRes.statusCode}`);
  console.log(`Location Header: ${docRes.headers.location || "Nenhum"}`);
  console.log(`Content-Type: ${docRes.headers["content-type"]}`);

  if (docRes.headers.location) {
    console.log(`Seguindo redirecionamento para: ${docRes.headers.location}`);
    const redirectRes = await makeRequest(new URL(docRes.headers.location, BASE_URL).toString(), {}, cookieManager);
    console.log(`Status Final: ${redirectRes.statusCode}`);
    console.log(`Content-Type Final: ${redirectRes.headers["content-type"]}`);
    fs.writeFileSync(path.join(scratchDir, "doc_redirect_res.html"), redirectRes.text());
  } else {
    fs.writeFileSync(path.join(scratchDir, "doc_direct_res.html"), docRes.text());
  }
}

runDynamicJsfLogin().catch(console.error);
