const https = require("https");
const fs = require("fs");
const path = require("path");
const { URLSearchParams } = require("url");

const BASE_URL = "https://www.saneago.com.br";

const usernames = [
  "m175374",
  "M175374",
  "saneago\\m175374",
  "SANEAGO\\m175374",
  "m175374@saneago.com.br"
];

const passwords = [
  "MJr@@7527",
  "MJr@@1511"
];

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

async function testVariants() {
  console.log("=== TESTANDO VARIANTES DE USUÁRIO AD NO DOCFLOW VIA HTTP DIRETO ===\n");

  for (const user of usernames) {
    for (const pass of passwords) {
      const cookieManager = new CookieManager();
      
      const loginGet = await makeRequest(`${BASE_URL}/docflow/xhtml/docflow/geral/login.jsf`, {}, cookieManager);
      const html = loginGet.text();

      const viewStateMatch = html.match(/name="javax\.faces\.ViewState"\s+value="([^"]+)"/);
      const viewState = viewStateMatch ? viewStateMatch[1] : "";

      const postData = new URLSearchParams();
      postData.append("j_idt58", "j_idt58");
      postData.append("userName", user);
      postData.append("password", pass);
      postData.append("j_idt71", "Entrar");
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

      // Requisitar documento 396444
      const docRes = await makeRequest(`${BASE_URL}/docflow/xhtml/consultarDocumento.jsf?idDocumento=396444`, {
        headers: {
          "Referer": `${BASE_URL}/docflow/xhtml/docflow/geral/login.jsf`
        }
      }, cookieManager);

      const isRedirect = docRes.statusCode === 302;
      const statusSymbol = isRedirect ? "❌ Redirecionou 302" : `✅ STATUS ${docRes.statusCode}`;
      console.log(`User: [${user}] | Pass: [${pass}] -> ${statusSymbol} (Location: ${docRes.headers.location || "Nenhum"})`);

      if (!isRedirect && docRes.statusCode === 200) {
        console.log(`\n🎉 SUCESSO DE AUTENTICAÇÃO COM: USER=${user}, PASS=${pass}`);
        const scratchDir = path.join(__dirname, "scratch");
        fs.writeFileSync(path.join(scratchDir, `DocFlow_396444_SUCCESS.html`), docRes.text());
        return;
      }
    }
  }
}

testVariants().catch(console.error);
