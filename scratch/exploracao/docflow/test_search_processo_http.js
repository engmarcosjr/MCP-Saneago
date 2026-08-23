"use strict";

const https = require("https");
const fs = require("fs");
const path = require("path");
const { URLSearchParams } = require("url");

const BASE_URL = "https://www.saneago.com.br";

let credsFromFile = {};
try {
  const credPath = path.join(__dirname, "config", "credentials.json");
  if (fs.existsSync(credPath)) {
    credsFromFile = JSON.parse(fs.readFileSync(credPath, "utf-8"));
  }
} catch (e) {}

const CREDENTIALS = {
  user: process.env.SANEAGO_USER || credsFromFile.usuario || "",
  pass: process.env.SANEAGO_PASS || credsFromFile.senha || ""
};

class SaneagoDirectHttpClient {
  constructor() {
    this.cookies = new Map();
    this.zkSid = 1;
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

  request(urlStr, options = {}) {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(urlStr, BASE_URL);
      const headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
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
        lookup: (hostname, options, callback) => {
          const cb = typeof options === "function" ? options : callback;
          const opts = typeof options === "object" ? options : {};
          if (hostname === "www.saneago.com.br") {
            if (opts.all) {
              return cb(null, [{ address: "198.17.232.242", family: 4 }]);
            }
            return cb(null, "198.17.232.242", 4);
          }
          require("dns").lookup(hostname, options, cb);
        },
        rejectUnauthorized: false
      };

      const req = https.request(reqOptions, (res) => {
        this.updateCookies(res.headers["set-cookie"]);

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

  zkau(dtid, events, refererUrl) {
    const body = new URLSearchParams();
    body.set("dtid", dtid);
    events.forEach((event, index) => {
      body.set(`cmd_${index}`, event.cmd);
      body.set(`uuid_${index}`, event.uuid);
      if (event.data !== undefined) body.set(`data_${index}`, JSON.stringify(event.data));
      if (event.opt !== undefined) body.set(`opt_${index}`, event.opt);
    });

    const bodyStr = body.toString();
    return this.request("/prt/zkau", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        "Referer": refererUrl,
        "zk-sid": String(this.zkSid++)
      },
      body: bodyStr
    });
  }
}

function extractRegex(str, regex, groupIndex = 1) {
  if (typeof str !== "string") return null;
  const match = str.match(regex);
  return match ? match[groupIndex] : null;
}

async function testSearchProcesso() {
  const http = new SaneagoDirectHttpClient();

  console.log("1. GET /prt/mpt/principal.zul (Portal ZK)...");
  const portalGet = await http.request("/prt/mpt/principal.zul");
  const portalText = portalGet.text();

  const dtid = extractRegex(portalText, /dtid="([^"]+)"/) || extractRegex(portalText, /dt:'([^']+)'/);
  const userId = extractRegex(portalText, /id:'([^']+)'.*?numeroMatricula/) || extractRegex(portalText, /id:'([^']+)'.*?value:'/);
  const passId = extractRegex(portalText, /id:'([^']+)'.*?codigoSenha/);
  const buttonId = extractRegex(portalText, /id:'([^']+)'.*?btnEntrar/);

  if (dtid && userId && passId && buttonId) {
    console.log("2. POST /prt/zkau (Autenticação)...");
    await http.zkau(dtid, [
      { cmd: "onChange", uuid: userId, data: { value: CREDENTIALS.user, start: CREDENTIALS.user.length } },
      { cmd: "onChange", uuid: passId, data: { value: CREDENTIALS.pass, start: CREDENTIALS.pass.length } },
      { cmd: "onClick", uuid: buttonId, data: { pageX: 0, pageY: 0, which: 1, x: 0, y: 0 } },
    ], `${BASE_URL}/prt/mpt/principal.zul`);
  }

  console.log("3. GET /docflow/xhtml/docflow/geral/login.jsf...");
  const docflowLoginGet = await http.request("/docflow/xhtml/docflow/geral/login.jsf");
  const viewState = extractRegex(docflowLoginGet.text(), /name="javax\.faces\.ViewState"\s+value="([^"]+)"/);

  console.log("4. POST Login no DocFlow...");
  const postData = new URLSearchParams();
  postData.append("j_idt58", "j_idt58");
  postData.append("userName", CREDENTIALS.user);
  postData.append("password", CREDENTIALS.pass);
  postData.append("j_idt71", "Entrar");
  postData.append("javax.faces.ViewState", viewState || "");

  await http.request("/docflow/xhtml/docflow/geral/login.jsf", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Referer": `${BASE_URL}/docflow/xhtml/docflow/geral/login.jsf`
    },
    body: postData.toString()
  });

  console.log("5. GET /docflow/xhtml/docflow/geral/principal.jsf...");
  const principalRes = await http.request("/docflow/xhtml/docflow/geral/principal.jsf");
  console.log(`[HTTP ${principalRes.statusCode}] Size: ${principalRes.text().length}`);

  const scratchDir = path.join(__dirname, "scratch");
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });
  fs.writeFileSync(path.join(scratchDir, "principal.html"), principalRes.text());

  // Procurar links/menus no HTML da página principal
  const html = principalRes.text();
  const links = [...html.matchAll(/href="([^"]+)"/gi)].map(m => m[1]);
  console.log("\nLinks encontrados na página principal:");
  links.filter(l => l.includes(".jsf") || l.includes("protocolo")).forEach(l => console.log(" -", l));

  // Testar candidatos de URL para Consulta por Protocolo / Processo
  const candidateUrls = [
    "/docflow/xhtml/docflow/protocolo/consultarProtocolo.jsf",
    "/docflow/xhtml/docflow/protocolo/pesquisarProtocolo.jsf",
    "/docflow/xhtml/docflow/protocolo/protocolo.jsf",
    "/docflow/xhtml/docflow/processo/consultarProcesso.jsf",
    "/docflow/xhtml/docflow/processo/pesquisarProcesso.jsf",
    "/docflow/xhtml/consultarProtocolo.jsf",
    "/docflow/xhtml/consultarProcesso.jsf",
    "/docflow/xhtml/docflow/documento/consultarDocumento.jsf"
  ];

  console.log("\n6. Testando URLs de consulta de protocolo/processo:");
  for (const cUrl of candidateUrls) {
    const res = await http.request(cUrl);
    console.log(`[HTTP ${res.statusCode}] ${cUrl} (Size: ${res.text().length})`);
    if (res.statusCode === 200 && res.text().length > 1000) {
      const fn = cUrl.replace(/[^a-zA-Z0-9]/g, "_") + ".html";
      fs.writeFileSync(path.join(scratchDir, fn), res.text());
      console.log(`   Salvo em scratch/${fn}`);
      // Procurar se a página tem inputs de formulário
      const forms = [...res.text().matchAll(/<form[\s\S]*?<\/form>/gi)];
      console.log(`   Forms encontrados: ${forms.length}`);
    }
  }
}

testSearchProcesso().catch(console.error);
