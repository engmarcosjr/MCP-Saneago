"use strict";

const path = require("path");
const fs = require("fs");
const { SaneagoHttpClient } = require("/Volumes/Mac_Dados/Repos/saneago-auth/saneago-http.js");
const { extractDtid, uuidByComponentId } = require("/Volumes/Mac_Dados/Repos/saneago-auth/zkau-parser.js");

const USER = "m175374";
const PASS = "MJr@@7527";
const BASE_URL = "https://www.saneago.com.br";

async function fetchWithRedirects(http, pathOrUrl, options = {}, maxRedirects = 10) {
  let currentUrl = pathOrUrl;
  let redirects = 0;

  while (redirects < maxRedirects) {
    const res = await http.request(currentUrl, options);
    console.log(`[HTTP ${res.status}] ${currentUrl}`);
    
    if (res.headers.location && (res.status === 301 || res.status === 302 || res.status === 303 || res.status === 307)) {
      currentUrl = res.headers.location;
      console.log(` -> Redirect ${res.status} para: ${currentUrl}`);
      redirects++;
    } else {
      return { ...res, finalUrl: currentUrl };
    }
  }

  throw new Error("Muitos redirecionamentos (max 10)");
}

async function main() {
  console.log("==================================================================");
  console.log("REQUISIÇÃO DIRETA HTTP (0% PLAYWRIGHT, 0% UI / BROWSER)");
  console.log("==================================================================\n");

  const http = new SaneagoHttpClient({ baseUrl: BASE_URL });

  // Step 1: Obter a página inicial do Portal ZK
  console.log("1. GET /prt/mpt/principal.zul (Portal Saneago ZK)...");
  const portalPage = await http.request("/prt/mpt/principal.zul");

  const dtid = extractDtid(portalPage.text);
  const userId = uuidByComponentId(portalPage.text, "numeroMatricula");
  const passId = uuidByComponentId(portalPage.text, "codigoSenha");
  const buttonId = uuidByComponentId(portalPage.text, "btnEntrar");

  console.log(`DTID: ${dtid} | User: ${userId} | Pass: ${passId} | Button: ${buttonId}`);

  // Step 2: Autenticação via ZKAU
  console.log("\n2. POST /prt/zkau (Autenticação ZKAU via HTTP)...");
  const loginRes = await http.zkau(dtid, [
    { cmd: "onChange", uuid: userId, data: { value: USER, start: USER.length } },
    { cmd: "onChange", uuid: passId, data: { value: PASS, start: PASS.length } },
    { cmd: "onClick", uuid: buttonId, data: { pageX: 0, pageY: 0, which: 1, x: 0, y: 0 } },
  ], `${BASE_URL}/prt/mpt/principal.zul`);

  console.log(`Resposta ZKAU: ${loginRes.text}`);

  // Step 3: Requisitar a página principal pós-login para confirmar cookies e sessão do portal
  console.log("\n3. GET /prt/mpt/principal.zul (Confirmar sessão)...");
  await fetchWithRedirects(http, "/prt/mpt/principal.zul");

  // Step 4: Acessar DocFlow base para inicializar a sessão do DocFlow
  console.log("\n4. GET /docflow/ (Inicializar sessão do DocFlow)...");
  const docflowBaseRes = await fetchWithRedirects(http, "/docflow/", {
    headers: { Referer: `${BASE_URL}/prt/mpt/principal.zul` }
  });

  // Step 5: Acessar a URL do documento 396444
  const docId = "396444";
  const docPath = `/docflow/xhtml/consultarDocumento.jsf?idDocumento=${docId}`;
  console.log(`\n5. GET ${docPath} (Requisitando Documento ${docId})...`);

  const docRes = await fetchWithRedirects(http, docPath, {
    headers: { Referer: `${BASE_URL}/docflow/` }
  });

  console.log(`\nURL Final Alcançada: ${docRes.finalUrl}`);
  console.log(`Content-Type: ${docRes.headers["content-type"]}`);
  console.log(`Content-Length: ${docRes.headers["content-length"] || docRes.text.length}`);

  const scratchDir = path.join(__dirname, "scratch");
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });

  const htmlPath = path.join(scratchDir, `DocFlow_${docId}_direto.html`);
  fs.writeFileSync(htmlPath, docRes.text);
  console.log(`HTML da resposta salvo em: ${htmlPath}`);

  // Extrair qualquer URL de PDF ou IFrame
  const pdfLinks = [...docRes.text.matchAll(/(?:href|src|action)="([^"]*(?:pdf|download|export|anexo|visualizar)[^"]*)"/gi)];
  console.log("\nLinks/Imagens/PDFs encontrados na página do documento:");
  pdfLinks.forEach(m => console.log(" -", m[1]));
}

main().catch(err => {
  console.error("Erro:", err);
  process.exit(1);
});
