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
  console.log("=== INSPEÇÃO DE SSO E SERVIÇOS INTEGRADOS SANEAGO ===\n");

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

  console.log(`Status ZKAU Login: ${loginRes.status}`);

  // 2. Requisitar principal.zul pós-login
  const mainPortal = await http.request("/prt/mpt/principal.zul");
  console.log(`Tamanho do HTML do Portal Principal: ${mainPortal.text.length} bytes`);

  const scratchDir = path.join(__dirname, "scratch");
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });
  fs.writeFileSync(path.join(scratchDir, "authenticated_principal.html"), mainPortal.text);

  // 3. Requisitar a lista de menus do portal
  console.log("\n2. Requisitando /prt/mpt/montarMenu.zul...");
  const menuRes = await http.request("/prt/mpt/montarMenu.zul", {
    headers: { Referer: `${BASE_URL}/prt/mpt/principal.zul` }
  });

  fs.writeFileSync(path.join(scratchDir, "montarMenu.html"), menuRes.text);
  console.log(`Tamanho do HTML montarMenu: ${menuRes.text.length} bytes`);

  // Procurar por menções de docflow, ged, consultar, documento no menu
  const menuMatches = [...menuRes.text.matchAll(/(?:href|onclick|src|url)="([^"]*)"/gi)];
  console.log("\nURLs encontradas no menu:");
  const urls = menuMatches.map(m => m[1]).filter(u => u.includes("docflow") || u.includes("ged") || u.includes("consultar"));
  console.log(urls);

  // 4. Testar endpoints comuns de SSO do Spring Security / CAS
  const ssoPaths = [
    "/docflow/j_spring_cas_security_check",
    "/docflow/j_spring_security_check",
    "/docflow/loginSSO",
    "/docflow/sso",
    "/docflow/xhtml/docflow/geral/principal.jsf"
  ];

  console.log("\n3. Testando endpoints de SSO do DocFlow:");
  for (const ssoPath of ssoPaths) {
    const res = await http.request(ssoPath, {
      headers: { Referer: `${BASE_URL}/prt/mpt/principal.zul` }
    });
    console.log(`[HTTP ${res.status}] ${ssoPath}`);
    if (res.headers.location) console.log(`  └─ Location: ${res.headers.location}`);
  }
}

main().catch(console.error);
