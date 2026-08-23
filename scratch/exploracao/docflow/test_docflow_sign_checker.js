const https = require("https");
const fs = require("fs");
const path = require("path");
const { URLSearchParams } = require("url");

const BASE_URL = "https://www.saneago.com.br";

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

async function testSignChecker() {
  const cookieManager = new CookieManager();

  console.log("1. GET /docflow/digitalSignChecker.jsf");
  const resGet = await makeRequest(`${BASE_URL}/docflow/digitalSignChecker.jsf`, {}, cookieManager);
  
  console.log(`Status GET: ${resGet.statusCode}`);
  const html = resGet.text();
  
  const scratchDir = path.join(__dirname, "scratch");
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });
  fs.writeFileSync(path.join(scratchDir, "digitalSignChecker.html"), html);

  const viewStateMatch = html.match(/name="javax\.faces\.ViewState"\s+value="([^"]+)"/);
  const formMatch = html.match(/<form [^>]*id="([^"]+)"/i);

  console.log(`ViewState: ${viewStateMatch ? viewStateMatch[1] : "Não encontrado"}`);
  console.log(`Form ID: ${formMatch ? formMatch[1] : "Não encontrado"}`);

  // Testar requisição direta com idDocumento 396444 no checker
  if (viewStateMatch && formMatch) {
    console.log("\n2. POST no digitalSignChecker.jsf para documento 396444...");
    const formId = formMatch[1];
    const postData = new URLSearchParams();
    postData.append(formId, formId);
    postData.append("codigo", "396444");
    postData.append("idDocumento", "396444");
    postData.append("javax.faces.ViewState", viewStateMatch[1]);

    const postBody = postData.toString();
    const resPost = await makeRequest(`${BASE_URL}/docflow/digitalSignChecker.jsf`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(postBody),
        "Referer": `${BASE_URL}/docflow/digitalSignChecker.jsf`
      },
      body: postBody
    }, cookieManager);

    console.log(`Status POST: ${resPost.statusCode}`);
    console.log(`Content-Type: ${resPost.headers["content-type"]}`);
    fs.writeFileSync(path.join(scratchDir, "digitalSignChecker_post.html"), resPost.text());
  }
}

testSignChecker().catch(console.error);
