"use strict";

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const creds = JSON.parse(fs.readFileSync("config/credentials.json", "utf8"));
const BASE_URL = "https://www.saneago.com.br";
const PROCESSO_EXEMPLO = "14652/2026";

async function mapScreen() {
  const scratchDir = path.join(__dirname, "scratch");
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });

  const httpLog = [];

  console.log("Iniciando navegador Playwright para mapeamento da tela...");
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"]
  });

  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  page.on("request", req => {
    if (req.url().includes("docflow") || req.url().includes("prt")) {
      const logItem = {
        step: currentStep,
        method: req.method(),
        url: req.url(),
        postData: req.postData(),
        headers: req.headers()
      };
      httpLog.push(logItem);
      console.log(`[REQ ${currentStep}] ${req.method()} ${req.url()}`);
      if (req.postData()) {
        console.log(`   POST Body: ${req.postData().substring(0, 400)}`);
      }
    }
  });

  page.on("response", async res => {
    if (res.url().includes("docflow") || res.url().includes("prt")) {
      console.log(`[RES ${currentStep}] ${res.status()} ${res.url()}`);
    }
  });

  let currentStep = "1_login_portal";
  console.log("\n1. Login Portal...");
  await page.goto(`${BASE_URL}/prt/`, { waitUntil: "networkidle" });
  await page.locator("input[type='text']").first().fill(creds.usuario);
  await page.locator("input[type='password']").first().fill(creds.senha);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle" }),
    page.locator("input[type='password']").first().press("Enter")
  ]);

  currentStep = "2_gerenciador_docflow";
  console.log("\n2. Entrando no DocFlow via GerenciadorDocumento.jsp...");
  await page.goto(`${BASE_URL}/prt/GerenciadorDocumento.jsp`, { waitUntil: "networkidle" });

  currentStep = "3_navegar_consulta_protocolo";
  console.log("\n3. Navegando no menu Protocolo -> Consulta por Protocolo...");

  // Tentar passar o mouse sobre o menu Protocolo
  const menuProtocolo = page.locator("text=Protocolo").first();
  await menuProtocolo.hover().catch(() => {});
  await page.waitForTimeout(500);

  const subMenu = page.locator("text=Consulta por Protocolo").first();
  if (await subMenu.isVisible()) {
    console.log("Submenu 'Consulta por Protocolo' visível. Clicando...");
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle" }).catch(() => {}),
      subMenu.click()
    ]);
  } else {
    console.log("Submenu não visível diretamente. Procurando links com JSF / Protocolo...");
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("a, tr, td, div")).map(el => ({
        text: el.innerText ? el.innerText.trim() : "",
        onclick: el.getAttribute("onclick"),
        href: el.getAttribute("href"),
        id: el.id
      })).filter(x => x.text.includes("Consulta por Protocolo") || x.text.includes("Protocolo"));
    });
    console.log("Links encontrados:", JSON.stringify(links, null, 2));
    await menuProtocolo.click().catch(() => {});
  }

  console.log(`URL Atual: ${page.url()}`);
  await page.screenshot({ path: path.join(scratchDir, "tela_consulta_protocolo.png") });
  const htmlConsultaForm = await page.content();
  fs.writeFileSync(path.join(scratchDir, "tela_consulta_protocolo.html"), htmlConsultaForm);

  // Mapear todos os elementos de formulário nesta tela
  const formStructure = await page.evaluate(() => {
    const forms = Array.from(document.forms).map(f => ({
      id: f.id,
      name: f.name,
      action: f.action,
      method: f.method,
      inputs: Array.from(f.querySelectorAll("input, select, textarea, button, a")).map(i => ({
        tagName: i.tagName,
        id: i.id,
        name: i.name,
        type: i.type,
        value: i.value,
        checked: i.checked,
        text: i.innerText ? i.innerText.trim() : "",
        onclick: i.getAttribute("onclick"),
        outerHTML: i.outerHTML
      }))
    }));
    return {
      forms,
      viewState: document.querySelector("input[name='javax.faces.ViewState']")?.value,
      title: document.title,
      heading: document.querySelector("h1, h2, h3, div.titulo, .rf-p-hdr")?.innerText
    };
  });

  console.log("\nEstrutura do Formulário de Consulta:");
  console.log(JSON.stringify(formStructure, null, 2));
  fs.writeFileSync(path.join(scratchDir, "form_structure.json"), JSON.stringify(formStructure, null, 2));

  currentStep = "4_pesquisar_numero_processo";
  console.log(`\n4. Selecionando opção 'Número Processo' e digitando '${PROCESSO_EXEMPLO}'...`);

  // Achar o radio button do Número Processo
  const radioProcesso = page.locator("input[type='radio'][value*='Processo'], input[type='radio'][value*='PROCESSO'], input[type='radio']").nth(1);
  const labelProcesso = page.locator("text=Número Processo").first();

  if (await labelProcesso.isVisible()) {
    console.log("Clicando na label/radio 'Número Processo'...");
    await labelProcesso.click();
  } else if (await radioProcesso.count() > 0) {
    await radioProcesso.check();
  }

  await page.waitForTimeout(500);

  // Achar caixa de entrada de texto
  const textInput = page.locator("input[type='text']").first();
  await textInput.fill(PROCESSO_EXEMPLO);

  await page.screenshot({ path: path.join(scratchDir, "tela_preenchida.png") });

  // Clicar em Pesquisar
  console.log("\n5. Clicando no botão 'Pesquisar'...");
  const btnPesquisar = page.locator("input[type='submit'][value*='Pesquisar'], button:has-text('Pesquisar'), input[value='Pesquisar']").first();

  await Promise.all([
    page.waitForResponse(res => res.url().includes("docflow") || res.url().includes("prt")).catch(() => {}),
    btnPesquisar.click()
  ]);

  await page.waitForTimeout(2000);
  console.log(`URL após Pesquisar: ${page.url()}`);
  await page.screenshot({ path: path.join(scratchDir, "tela_resultado.png") });

  const htmlResultado = await page.content();
  fs.writeFileSync(path.join(scratchDir, "tela_resultado.html"), htmlResultado);

  fs.writeFileSync(path.join(scratchDir, "http_traffic_log.json"), JSON.stringify(httpLog, null, 2));

  await browser.close();
  console.log("Mapeamento concluído com sucesso!");
}

mapScreen().catch(console.error);
