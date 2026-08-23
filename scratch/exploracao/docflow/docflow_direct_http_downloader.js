"use strict";

/**
 * DocFlow PDF Downloader via 100% Direta Requisição HTTP (sem Browser/UI/Playwright)
 * 
 * Requisitos: Node.js (módulo nativo https)
 */

const https = require("https");
const fs = require("fs");
const path = require("path");
const { URLSearchParams } = require("url");

const BASE_URL = "https://www.saneago.com.br";
const DEFAULT_DOC_ID = "396444";

const CREDENTIALS = {
  user: process.env.SANEAGO_USER || "m175374",
  pass: process.env.SANEAGO_PASS || "MJr@@7527"
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

async function downloadDocflowPdf(docId = DEFAULT_DOC_ID, outputDir = __dirname) {
  console.log("==================================================================");
  console.log(`OBTENDO DOCUMENTO DOCFLOW ID #${docId} VIA REQUISIÇÃO DIRETA HTTP`);
  console.log("==================================================================\n");

  const http = new SaneagoDirectHttpClient();

  // PASS 1: Autenticação via ZKAU no Portal Saneago (/prt/mpt/principal.zul)
  console.log("1. GET /prt/mpt/principal.zul (Portal ZK)...");
  const portalGet = await http.request("/prt/mpt/principal.zul");
  const portalText = portalGet.text();
  console.log(`   [HTTP ${portalGet.statusCode}] Cookie obtido.`);

  const dtid = extractRegex(portalText, /dtid="([^"]+)"/) || extractRegex(portalText, /dt:'([^']+)'/);
  const userId = extractRegex(portalText, /id:'([^']+)'.*?numeroMatricula/) || extractRegex(portalText, /id:'([^']+)'.*?value:'/);
  const passId = extractRegex(portalText, /id:'([^']+)'.*?codigoSenha/);
  const buttonId = extractRegex(portalText, /id:'([^']+)'.*?btnEntrar/);

  console.log(`   ZKAU Metadata -> DTID: ${dtid}`);

  if (dtid && userId && passId && buttonId) {
    console.log("2. POST /prt/zkau (Autenticação ZKAU HTTP direta)...");
    const zkauRes = await http.zkau(dtid, [
      { cmd: "onChange", uuid: userId, data: { value: CREDENTIALS.user, start: CREDENTIALS.user.length } },
      { cmd: "onChange", uuid: passId, data: { value: CREDENTIALS.pass, start: CREDENTIALS.pass.length } },
      { cmd: "onClick", uuid: buttonId, data: { pageX: 0, pageY: 0, which: 1, x: 0, y: 0 } },
    ], `${BASE_URL}/prt/mpt/principal.zul`);

    console.log(`   [HTTP ${zkauRes.statusCode}] Resposta ZKAU: ${zkauRes.text.substring(0, 150)}...`);
  }

  // PASS 2: Obter formulário e ViewState do DocFlow em /docflow/xhtml/docflow/geral/login.jsf
  console.log("\n3. GET /docflow/xhtml/docflow/geral/login.jsf (DocFlow)...");
  const docflowLoginGet = await http.request("/docflow/xhtml/docflow/geral/login.jsf");
  console.log(`   [HTTP ${docflowLoginGet.statusCode}] Form carregado.`);

  const viewState = extractRegex(docflowLoginGet.text(), /name="javax\.faces\.ViewState"\s+value="([^"]+)"/);
  console.log(`   JSF ViewState: ${viewState}`);

  // PASS 3: Autenticação JSF no DocFlow
  console.log("4. POST /docflow/xhtml/docflow/geral/login.jsf (Autenticação JSF HTTP)...");
  const postData = new URLSearchParams();
  postData.append("j_idt58", "j_idt58");
  postData.append("userName", CREDENTIALS.user);
  postData.append("password", CREDENTIALS.pass);
  postData.append("j_idt71", "Entrar");
  postData.append("javax.faces.ViewState", viewState || "");

  const loginPostRes = await http.request("/docflow/xhtml/docflow/geral/login.jsf", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Referer": `${BASE_URL}/docflow/xhtml/docflow/geral/login.jsf`
    },
    body: postData.toString()
  });

  console.log(`   [HTTP ${loginPostRes.statusCode}] Login submetido.`);

  // PASS 4: Requisitar o documento em consultarDocumento.jsf
  const docUrl = `/docflow/xhtml/consultarDocumento.jsf?idDocumento=${docId}`;
  console.log(`\n5. GET ${docUrl} (Download do Documento PDF)...`);

  const docRes = await http.request(docUrl, {
    headers: {
      "Referer": `${BASE_URL}/docflow/xhtml/docflow/geral/login.jsf`
    }
  });

  console.log(`   [HTTP ${docRes.statusCode}] Content-Type: ${docRes.headers["content-type"] || "não especificativo"}`);

  const outputPath = path.join(outputDir, `DocFlow_${docId}.pdf`);
  if (docRes.headers["content-type"] && docRes.headers["content-type"].includes("pdf")) {
    fs.writeFileSync(outputPath, docRes.body);
    console.log(`\n🎉 SUCESSO! PDF salvo com sucesso em: ${outputPath}`);
  } else {
    console.log("   Verificando via digitalSignChecker.jsf...");
    const checkerGet = await http.request("/docflow/digitalSignChecker.jsf");
    const checkerVS = extractRegex(checkerGet.text(), /name="javax\.faces\.ViewState"\s+value="([^"]+)"/);

    const checkerPostData = new URLSearchParams();
    checkerPostData.append("formBody", "formBody");
    checkerPostData.append("signId", docId);
    checkerPostData.append("verifierBtn", "Verificar");
    checkerPostData.append("javax.faces.ViewState", checkerVS || "");

    const checkerPostRes = await http.request("/docflow/digitalSignChecker.jsf", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Referer": `${BASE_URL}/docflow/digitalSignChecker.jsf`
      },
      body: checkerPostData.toString()
    });

    const htmlPath = path.join(outputDir, `DocFlow_${docId}_resposta.html`);
    fs.writeFileSync(htmlPath, docRes.text() || checkerPostRes.text());
    console.log(`\n📄 Resposta da requisição HTTP salva em: ${htmlPath}`);
  }
}

downloadDocflowPdf(DEFAULT_DOC_ID, path.join(__dirname, "scratch")).catch(console.error);
