"use strict";

const https = require("https");
const fs = require("fs");
const path = require("path");
const { SaneagoHttpClient } = require("/Volumes/Mac_Dados/Repos/saneago-auth/saneago-http.js");
const { extractDtid, uuidByComponentId } = require("/Volumes/Mac_Dados/Repos/saneago-auth/zkau-parser.js");

const USER = "m175374";
const PASS = "MJr@@7527";
const BASE_URL = "https://www.saneago.com.br";

async function main() {
  console.log("==================================================================");
  console.log("MAPEANDO ENDPOINTS DOCFLOW VIA REQUISIÇÃO DIRETA HTTP (0% BROWSER)");
  console.log("==================================================================\n");

  const http = new SaneagoHttpClient({ baseUrl: BASE_URL });

  // 1. Authenticate at Portal ZK
  console.log("1. Autenticando no Portal ZK via HTTP ZKAU...");
  const portalPage = await http.request("/prt/mpt/principal.zul");
  const dtid = extractDtid(portalPage.text);
  const userId = uuidByComponentId(portalPage.text, "numeroMatricula");
  const passId = uuidByComponentId(portalPage.text, "codigoSenha");
  const buttonId = uuidByComponentId(portalPage.text, "btnEntrar");

  const loginRes = await http.zkau(dtid, [
    { cmd: "onChange", uuid: userId, data: { value: USER, start: USER.length } },
    { cmd: "onChange", uuid: passId, data: { value: PASS, start: PASS.length } },
    { cmd: "onClick", uuid: buttonId, data: { pageX: 0, pageY: 0, which: 1, x: 0, y: 0 } },
  ], `${BASE_URL}/prt/mpt/principal.zul`);

  console.log(`Status ZKAU: ${loginRes.status}`);
  console.log(`Cookies obtidos: ${http.jar.header()}\n`);

  const testPaths = [
    "/docflow/xhtml/consultarDocumento.jsf?idDocumento=396444",
    "/docflow/xhtml/docflow/documento/consultarDocumento.jsf?idDocumento=396444",
    "/docflow/xhtml/docflow/documento/visualizarDocumento.jsf?idDocumento=396444",
    "/docflow/xhtml/docflow/geral/principal.jsf",
    "/docflow/servlet/DownloadServlet?idDocumento=396444",
    "/docflow/servlet/DownloadDocumentoServlet?idDocumento=396444",
    "/docflow/download?idDocumento=396444",
    "/docflow/download.jsf?idDocumento=396444",
    "/docflow/exportPDF?idDocumento=396444",
    "/docflow/pdf?idDocumento=396444"
  ];

  console.log("2. Testando candidatos de URL para download/visualização de PDF:\n");

  const scratchDir = path.join(__dirname, "scratch");
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });

  for (const pathUrl of testPaths) {
    try {
      const res = await http.request(pathUrl, {
        headers: { Referer: `${BASE_URL}/prt/mpt/principal.zul` }
      });

      const contentType = res.headers["content-type"] || "sem content-type";
      const location = res.headers["location"] || "sem redirect";
      const size = res.text ? res.text.length : 0;

      console.log(`[HTTP ${res.status}] ${pathUrl}`);
      console.log(`  └─ Content-Type: ${contentType} | Size: ${size} | Location: ${location}`);

      if (res.status === 200 && contentType.includes("pdf")) {
        const pdfFile = path.join(scratchDir, `DocFlow_396444_direct.pdf`);
        fs.writeFileSync(pdfFile, res.text, "binary");
        console.log(`  🎉 ENCONTRADO PDF DIRETO! Salvo em: ${pdfFile}`);
      } else if (res.status === 200 && size > 500) {
        const filename = pathUrl.replace(/[^a-zA-Z0-9]/g, "_") + ".html";
        fs.writeFileSync(path.join(scratchDir, filename), res.text);
      }
    } catch (err) {
      console.log(`[ERRO] ${pathUrl}: ${err.message}`);
    }
  }
}

main().catch(console.error);
