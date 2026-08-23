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

async function testRichFacesAjax() {
  const cookieManager = new CookieManager();

  console.log("1. GET /docflow/xhtml/docflow/geral/login.jsf");
  const loginGet = await makeRequest(`${BASE_URL}/docflow/xhtml/docflow/geral/login.jsf`, {}, cookieManager);
  const html = loginGet.text();

  const viewStateMatch = html.match(/name="javax\.faces\.ViewState"\s+value="([^"]+)"/);
  const viewState = viewStateMatch ? viewStateMatch[1] : "";

  console.log(`ViewState: ${viewState}`);
  console.log(`Cookies: ${cookieManager.getCookieHeader()}\n`);

  console.log("2. POST RichFaces AJAX Login...");
  const postData = new URLSearchParams();
  postData.append("javax.faces.partial.ajax", "true");
  postData.append("javax.faces.source", "j_idt58:j_idt71");
  postData.append("javax.faces.partial.execute", "@all");
  postData.append("javax.faces.partial.render", "@all");
  postData.append("j_idt58:j_idt71", "j_idt58:j_idt71");
  postData.append("j_idt58", "j_idt58");
  postData.append("userName", USER);
  postData.append("password", PASS);
  postData.append("j_idt71", "Entrar");
  postData.append("javax.faces.ViewState", viewState);

  const postBody = postData.toString();

  const postRes = await makeRequest(`${BASE_URL}/docflow/xhtml/docflow/geral/login.jsf`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "Faces-Request": "partial/ajax",
      "X-Requested-With": "XMLHttpRequest",
      "Content-Length": Buffer.byteLength(postBody),
      "Referer": `${BASE_URL}/docflow/xhtml/docflow/geral/login.jsf`
    },
    body: postBody
  }, cookieManager);

  console.log(`Status AJAX POST: ${postRes.statusCode}`);
  console.log(`Content-Type: ${postRes.headers["content-type"]}`);
  console.log(`Body (primeiros 500 chars):\n${postRes.text().substring(0, 500)}\n`);

  const scratchDir = path.join(__dirname, "scratch");
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });
  fs.writeFileSync(path.join(scratchDir, "ajax_post_res.xml"), postRes.text());

  // Check if XML contains redirect tag or extension
  const redirectMatch = postRes.text().match(/<redirect url="([^"]+)"/i);
  if (redirectMatch) {
    console.log(`🚀 REDIRECT ENCONTRADO NO AJAX: ${redirectMatch[1]}`);
    const navUrl = new URL(redirectMatch[1], BASE_URL).toString();
    const navRes = await makeRequest(navUrl, {}, cookieManager);
    console.log(`Status da navegação pós-login: ${navRes.statusCode}`);
  }

  // 3. Tentar acessar o documento 396444
  console.log("\n3. GET /docflow/xhtml/consultarDocumento.jsf?idDocumento=396444");
  const docRes = await makeRequest(`${BASE_URL}/docflow/xhtml/consultarDocumento.jsf?idDocumento=396444`, {
    headers: {
      "Referer": `${BASE_URL}/docflow/xhtml/docflow/geral/login.jsf`
    }
  }, cookieManager);

  console.log(`Status GET Documento: ${docRes.statusCode}`);
  console.log(`Location Header: ${docRes.headers.location || "Nenhum"}`);
  console.log(`Content-Type: ${docRes.headers["content-type"]}`);

  if (!docRes.headers.location) {
    fs.writeFileSync(path.join(scratchDir, "DocFlow_396444_AJAX_SUCCESS.html"), docRes.text());
    console.log("HTML do documento salvo!");
  }
}

testRichFacesAjax().catch(console.error);
