"use strict";

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://www.saneago.com.br";
const PROCESSO_NUM = "14652/2026";

const CREDENTIALS = {
  usuario: process.env.SANEAGO_USER || "",
  senha: process.env.SANEAGO_PASS || ""
};

async function mapProcesso() {
  console.log("==================================================================");
  console.log(`MAPEANDO CONSULTA DE PROCESSO: ${PROCESSO_NUM}`);
  console.log("==================================================================");

  const scratchDir = path.join(__dirname, "scratch");
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });

  const requestsLog = [];

  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu"
    ]
  });
  const context = await browser.newContext({
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  page.on("request", req => {
    if (req.url().includes("docflow") || req.url().includes("prt")) {
      requestsLog.push({
        method: req.method(),
        url: req.url(),
        postData: req.postData(),
        headers: req.headers()
      });
      console.log(`[REQ] ${req.method()} ${req.url()}`);
      if (req.postData()) {
        console.log(`      POST Data: ${req.postData().substring(0, 300)}...`);
      }
    }
  });

  page.on("response", async res => {
    if (res.url().includes("docflow") || res.url().includes("prt")) {
      console.log(`[RES ${res.status()}] ${res.url()}`);
    }
  });

  // Etapa 1: Login no Portal
  console.log("\n1. Efetuando login no Portal Saneago (/prt/)...");
  await page.goto(`${BASE_URL}/prt/`, { waitUntil: "networkidle" });
  await page.locator("input[type='text']").first().fill(CREDENTIALS.usuario);
  await page.locator("input[type='password']").first().fill(CREDENTIALS.senha);

  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle" }),
    page.locator("input[type='password']").first().press("Enter")
  ]);

  console.log(`✅ Login no Portal OK! (${page.url()})`);

  // Etapa 2: Acessar DocFlow
  console.log("\n2. Acessando GerenciadorDocumento.jsp...");
  await page.goto(`${BASE_URL}/prt/GerenciadorDocumento.jsp`, { waitUntil: "networkidle" });
  console.log(`📍 URL Atual: ${page.url()}`);

  await page.screenshot({ path: path.join(scratchDir, "step2_gerenciador.png") });

  // Salvar HTML inicial para ver o menu
  const htmlDocflow = await page.content();
  fs.writeFileSync(path.join(scratchDir, "step2_docflow.html"), htmlDocflow);

  // Procurar no menu a opção Protocolo -> Consulta por Protocolo
  console.log("\n3. Mapeando menus e procurando 'Protocolo'...");

  // Tentar encontrar o elemento contendo texto "Protocolo" ou a opção no menu
  const protocoloMenu = page.locator("text=Protocolo").first();
  if (await protocoloMenu.count() > 0) {
    console.log("Encontrado menu 'Protocolo', passando o mouse / clicando...");
    await protocoloMenu.hover().catch(() => {});
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(scratchDir, "step3_protocolo_hover.png") });

    const consultaProtocolo = page.locator("text=Consulta por Protocolo").first();
    if (await consultaProtocolo.count() > 0) {
      console.log("Encontrado 'Consulta por Protocolo', clicando...");
      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle" }).catch(() => {}),
        consultaProtocolo.click({ force: true })
      ]);
    } else {
      console.log("'Consulta por Protocolo' não visível diretamente. Tentando clicar no Protocolo...");
      await protocoloMenu.click({ force: true }).catch(() => {});
    }
  }

  console.log(`📍 URL após menu Protocolo: ${page.url()}`);
  await page.screenshot({ path: path.join(scratchDir, "step4_consulta_page.png") });
  const htmlConsulta = await page.content();
  fs.writeFileSync(path.join(scratchDir, "step4_consulta.html"), htmlConsulta);

  // Mapear os elementos do formulário de consulta na página atual
  console.log("\n4. Inspecionando formulário na página...");
  const inputsInfo = await page.evaluate(() => {
    const forms = Array.from(document.forms).map(f => ({
      id: f.id,
      name: f.name,
      action: f.action,
      method: f.method,
      inputs: Array.from(f.querySelectorAll("input, select, textarea, button")).map(i => ({
        id: i.id,
        name: i.name,
        type: i.type,
        value: i.value,
        checked: i.checked,
        outerHTML: i.outerHTML
      }))
    }));
    return {
      forms,
      bodyText: document.body.innerText.substring(0, 1000)
    };
  });
  console.log("Informações dos formulários:", JSON.stringify(inputsInfo, null, 2));

  // Tentar encontrar radio de 'Número Processo' ou caixa de texto de número de processo
  console.log("\n5. Selecionando opção 'Número Processo' e preenchendo '14652/2026'...");

  // Verificar se há radio buttons
  const radioProcesso = page.locator("input[type='radio'][value='NUMERO_PROCESSO'], input[type='radio']").nth(1); // ou por label
  const labelProcesso = page.locator("label:has-text('Número Processo'), span:has-text('Número Processo')").first();

  if (await labelProcesso.count() > 0) {
    console.log("Clicando na label 'Número Processo'...");
    await labelProcesso.click().catch(() => {});
  }

  // Preencher campo de pesquisa
  const searchInput = page.locator("input[type='text']").first();
  await searchInput.fill(PROCESSO_NUM);

  await page.screenshot({ path: path.join(scratchDir, "step5_filled.png") });

  // Clicar em Pesquisar
  console.log("\n6. Clicando em 'Pesquisar'...");
  const btnPesquisar = page.locator("input[type='submit'][value*='Pesquisar'], button:has-text('Pesquisar'), input[value='Pesquisar']").first();

  if (await btnPesquisar.count() > 0) {
    console.log("Botão Pesquisar encontrado! Clicando...");
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle" }).catch(() => {}),
      btnPesquisar.click()
    ]);
  } else {
    console.log("Tentando submeter o formulário via Enter ou evaluate...");
    await searchInput.press("Enter");
    await page.waitForTimeout(3000);
  }

  console.log(`📍 URL após Pesquisar: ${page.url()}`);
  await page.screenshot({ path: path.join(scratchDir, "step6_resultado.png") });
  const htmlResultado = await page.content();
  fs.writeFileSync(path.join(scratchDir, "step6_resultado.html"), htmlResultado);

  console.log("\n--- CONTEÚDO DO RESULTADO ---");
  const resultText = await page.evaluate(() => document.body.innerText);
  console.log(resultText);

  fs.writeFileSync(path.join(scratchDir, "requests_log.json"), JSON.stringify(requestsLog, null, 2));

  await browser.close();
}

mapProcesso().catch(err => {
  console.error("❌ Erro durante o mapeamento:", err);
});
