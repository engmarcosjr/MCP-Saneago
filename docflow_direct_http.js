const https = require("https");
const fs = require("fs");
const path = require("path");
const { URLSearchParams } = require("url");

const BASE_URL = "https://www.saneago.com.br";
const USER = "m175374";
const PASS = "MJr@@7527";

class SimpleHttpClient {
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
        this.cookies.set(key, value);
      }
    }
  }

  request(urlStr, options = {}, redirectCount = 0) {
    if (redirectCount > 5) {
      return Promise.reject(new Error("Muitos redirecionamentos (loop)"));
    }

    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(urlStr, options.baseUrl || BASE_URL);
      const headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        ...options.headers
      };

      const cookieStr = this.getCookieHeader();
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
        this.updateCookies(res.headers["set-cookie"]);

        const chunks = [];
        res.on("data", chunk => chunks.push(chunk));
        res.on("end", async () => {
          const buffer = Buffer.concat(chunks);
          console.log(`[HTTP ${res.statusCode}] ${parsedUrl.toString()}`);
          if (res.headers.location) {
            console.log(` -> Redirect Location: ${res.headers.location}`);
          }

          if (options.followRedirects !== false && (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 303 || res.statusCode === 307)) {
            const redirectUrl = new URL(res.headers.location, parsedUrl.toString()).toString();
            // GET no redirect
            const nextOptions = { ...options, method: "GET", body: null, followRedirects: options.followRedirects };
            delete nextOptions.headers["Content-Type"];
            delete nextOptions.headers["Content-Length"];
            const redirectedRes = await this.request(redirectUrl, nextOptions, redirectCount + 1);
            resolve(redirectedRes);
          } else {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: buffer,
              text: () => buffer.toString("utf-8"),
              url: parsedUrl.toString()
            });
          }
        });
      });

      req.on("error", reject);

      if (options.body) {
        req.write(options.body);
      }
      req.end();
    });
  }
}

async function runDirectHttpRequest() {
  const client = new SimpleHttpClient();

  console.log("--- FAZENDO TUDO VIA REQUISIÇÃO DIRETA HTTP (SEM BROWSER / PLAYWRIGHT) ---\n");

  console.log("1. GET página de login...");
  const loginPageRes = await client.request(`${BASE_URL}/docflow/xhtml/docflow/geral/login.jsf`);
  const loginHtml = loginPageRes.text();

  // Extrair javax.faces.ViewState
  const viewStateMatch = loginHtml.match(/name="javax\.faces\.ViewState"\s+value="([^"]+)"/);
  if (!viewStateMatch) {
    throw new Error("Não foi possível extrair javax.faces.ViewState");
  }
  const viewState = viewStateMatch[1];
  console.log(`ViewState obtido: ${viewState}\n`);

  console.log("2. POST de autenticação (m175374)...");
  const postData = new URLSearchParams();
  postData.append("j_idt58", "j_idt58");
  postData.append("userName", USER);
  postData.append("password", PASS);
  postData.append("j_idt71", "Entrar");
  postData.append("javax.faces.ViewState", viewState);
  const postBody = postData.toString();

  const postRes = await client.request(`${BASE_URL}/docflow/xhtml/docflow/geral/login.jsf`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(postBody),
      "Referer": `${BASE_URL}/docflow/xhtml/docflow/geral/login.jsf`
    },
    body: postBody
  });

  const scratchDir = path.join(__dirname, "scratch");
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });

  fs.writeFileSync(path.join(scratchDir, "post_response.html"), postRes.text());
  console.log(`Resposta do POST recebida. Tamanho: ${postRes.body.length} bytes.\n`);

  // 3. Acessar o documento 396444
  const docId = "396444";
  const docUrl = `${BASE_URL}/docflow/xhtml/consultarDocumento.jsf?idDocumento=${docId}`;
  console.log(`3. Requisitando documento: ${docUrl}...`);

  const docRes = await client.request(docUrl, {
    headers: {
      "Referer": `${BASE_URL}/docflow/xhtml/docflow/geral/login.jsf`
    }
  });

  console.log(`\nURL Final alcançada: ${docRes.url}`);
  console.log(`Status HTTP: ${docRes.statusCode}`);
  console.log(`Content-Type: ${docRes.headers["content-type"]}`);
  console.log(`Content-Disposition: ${docRes.headers["content-disposition"] || "Nenhum"}`);

  if (docRes.headers["content-type"] && docRes.headers["content-type"].includes("application/pdf")) {
    const pdfPath = path.join(scratchDir, `DocFlow_${docId}_direto.pdf`);
    fs.writeFileSync(pdfPath, docRes.body);
    console.log(`\n🎉 SUCESSO! Arquivo PDF salvo diretamente em: ${pdfPath}`);
  } else {
    const htmlText = docRes.text();
    const htmlPath = path.join(scratchDir, `DocFlow_${docId}_direto.html`);
    fs.writeFileSync(htmlPath, htmlText);
    console.log(`\nHTML retornado salvo em: ${htmlPath}`);

    // Procurar URLs de download de PDF ou iframe no HTML
    const pdfMatches = [...htmlText.matchAll(/(?:href|src|action)="([^"]*(?:pdf|download|visualizar|consultar)[^"]*)"/gi)];
    console.log("\nLinks/Recursos encontrados no HTML:");
    pdfMatches.forEach(m => console.log(" -", m[1]));
  }
}

runDirectHttpRequest().catch(console.error);
