const https = require("https");
const fs = require("fs");
const path = require("path");
const { URLSearchParams } = require("url");

const BASE_URL = "https://www.saneago.com.br";
const USER = "m175374";

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

async function testCombinations() {
  const passwords = ["MJr@@1511", "MJr@@7527"];

  for (const pass of passwords) {
    console.log(`\n==================================================`);
    console.log(`TESTANDO COM A SENHA: ${pass}`);
    console.log(`==================================================`);

    const cookieManager = new CookieManager();
    const loginGet = await makeRequest(`${BASE_URL}/docflow/xhtml/docflow/geral/login.jsf`, {}, cookieManager);
    const html = loginGet.text();

    const viewStateMatch = html.match(/name="javax\.faces\.ViewState"\s+value="([^"]+)"/);
    const formActionMatch = html.match(/action="([^"]+)"/);

    const viewState = viewStateMatch ? viewStateMatch[1] : "";
    const formAction = formActionMatch ? formActionMatch[1] : "/docflow/xhtml/docflow/geral/login.jsf";

    console.log(`ViewState: ${viewState}`);
    console.log(`Form Action: ${formAction}`);

    const postUrl = formAction.startsWith("http") ? formAction : `${BASE_URL}${formAction}`;

    // Testar combinação completa de campos
    const postData = new URLSearchParams();
    postData.append("j_idt58", "j_idt58");
    postData.append("userName", USER);
    postData.append("password", pass);
    postData.append("j_idt58:userName", USER);
    postData.append("j_idt58:password", pass);
    postData.append("j_idt71", "Entrar");
    postData.append("j_idt58:j_idt71", "Entrar");
    postData.append("javax.faces.ViewState", viewState);

    const postBody = postData.toString();

    const postRes = await makeRequest(postUrl, {
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
    console.log(`Cookies pós-POST: ${cookieManager.getCookieHeader()}`);

    // Requisitar o documento 396444
    const docRes = await makeRequest(`${BASE_URL}/docflow/xhtml/consultarDocumento.jsf?idDocumento=396444`, {
      headers: {
        "Referer": postUrl
      }
    }, cookieManager);

    console.log(`Status GET Documento 396444: ${docRes.statusCode}`);
    console.log(`Location Documento: ${docRes.headers.location || "Nenhum"}`);

    if (docRes.statusCode === 200 && docRes.headers["content-type"] && docRes.headers["content-type"].includes("pdf")) {
      console.log(`🎉 SUCESSO ABSOLUTO! PDF OBTIDO COM A SENHA ${pass}`);
      const pdfPath = path.join(__dirname, "scratch", `DocFlow_396444_${pass}.pdf`);
      fs.writeFileSync(pdfPath, docRes.body);
      return;
    }
  }
}

testCombinations().catch(console.error);
