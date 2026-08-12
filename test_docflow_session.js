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
  console.log("DIAGNOSTICO DE SESSÃO HTTP DIRETA");
  console.log("==================================================================\n");

  const http = new SaneagoHttpClient({ baseUrl: BASE_URL });

  // 1. Authenticate at Portal ZK
  console.log("1. Autenticando no Portal ZK...");
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
  console.log(`Cookies do Portal pós-login: ${http.jar.header()}`);

  const portalSessionCookie = http.jar.header();

  // 2. Agora vamos requisitar a URL do Docflow usando EXATAMENTE o cookie de sessão do Portal
  console.log("\n2. Requisitando /docflow/xhtml/consultarDocumento.jsf?idDocumento=396444 mantendo cookie de sessão...");
  
  const docUrl = `${BASE_URL}/docflow/xhtml/consultarDocumento.jsf?idDocumento=396444`;
  const docRes = await http.request("/docflow/xhtml/consultarDocumento.jsf?idDocumento=396444", {
    headers: {
      Cookie: portalSessionCookie,
      Referer: `${BASE_URL}/prt/mpt/principal.zul`
    }
  });

  console.log(`Status GET DocFlow: ${docRes.status}`);
  console.log(`Headers recebidos do DocFlow:`, docRes.headers);

  const scratchDir = path.join(__dirname, "scratch");
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });
  fs.writeFileSync(path.join(scratchDir, "docflow_with_portal_session.html"), docRes.text);

  // 3. Testar se o DocFlow requer CAS/SSO ticket ou se tem um link no portal para abrir o DocFlow
  console.log("\n3. Verificando links do DocFlow dentro da página principal do Portal...");
  const principalRes = await http.request("/prt/mpt/principal.zul");
  const docflowLinks = [...principalRes.text.matchAll(/href="([^"]*docflow[^"]*)"/gi)];
  console.log("Links do Docflow encontrados no Portal ZK:");
  console.log(docflowLinks.map(m => m[1]));
}

main().catch(console.error);
