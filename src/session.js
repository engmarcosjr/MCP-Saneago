const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const rootDir = path.resolve(__dirname, "..");
const authDir = path.join(rootDir, ".auth");
const storageStatePath = path.join(authDir, "storage-state.json");
const credentialsPath = path.join(rootDir, "config", "credentials.json");

const PRINCIPAL_URL = "https://www.saneago.com.br/prt/mpt/principal.zul";

function ensureAuthDir() {
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }
}

function readCredentials() {
  if (process.env.SANEAGO_USER && process.env.SANEAGO_PASS) {
    return {
      usuario: process.env.SANEAGO_USER.trim(),
      senha: process.env.SANEAGO_PASS,
      source: "environment variables",
    };
  }

  const candidates = [
    credentialsPath,
    "C:\\repos\\PORTAL_LEGADO\\config\\credentials.json",
  ];

  const found = candidates.find((c) => fs.existsSync(c));
  if (!found) {
    throw new Error(
      "Credenciais nao encontradas. Use as variaveis SANEAGO_USER e SANEAGO_PASS ou crie o arquivo config/credentials.json"
    );
  }

  const data = JSON.parse(fs.readFileSync(found, "utf8"));
  if (!data.usuario || !data.senha) {
    throw new Error(`Credenciais invalidas no arquivo: ${found}`);
  }

  return {
    usuario: data.usuario.trim(),
    senha: data.senha,
    source: found,
  };
}

let activeBrowser = null;
let activeContext = null;
let activePage = null;

async function doLoginIfNeeded(page, credentials) {
  // Se houver campo de senha visivel, precisamos fazer login
  const passInput = page.locator('input[type="password"]').first();
  const needLogin = await passInput.isVisible({ timeout: 6000 }).catch(() => false);
  
  if (!needLogin) {
    return false;
  }

  console.log(`[Session] Realizando login na Intranet Saneago usando credenciais de: ${credentials.source}...`);
  const userInput = page.locator('input[type="text"], input[name*="user" i], input[id*="user" i], input[name*="login" i]').first();
  await userInput.fill(credentials.usuario);
  await passInput.fill(credentials.senha);

  const entrarBtn = page.getByRole("button", { name: /entrar|acessar|login/i }).first();
  if (await entrarBtn.isVisible().catch(() => false)) {
    await entrarBtn.click();
  } else {
    await passInput.press("Enter");
  }

  // Espera ate sair da tela de login
  await page.waitForLoadState("networkidle", { timeout: 45000 }).catch(() => {});
  
  // Aguarda ate o campo de login desaparecer, indicando login realizado
  console.log("[Session] Aguardando a tela de login sumir...");
  await passInput.waitFor({ state: "hidden", timeout: 30000 }).catch((e) => {
    console.log("[Session] Aviso: campo de senha nao sumiu no tempo limite.", e.message);
  });
  
  // Tratamento para aviso de senha expirando/expirada
  try {
    const pageText = await page.evaluate(() => document.body?.innerText || "");
    if (/expira/i.test(pageText) && /senha/i.test(pageText)) {
      const btnNao = page.getByRole("button", { name: /Não|Ignorar|Lembrar|Continuar/i }).first();
      if (await btnNao.count()) {
        await btnNao.click();
        await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
      }
    }
  } catch (e) {
    console.log("[Session] Erro ao tratar expiracao de senha (ignorado):", e.message);
  }

  console.log("[Session] Login concluido com sucesso.");
  return true;
}

async function getOrCreateSession() {
  ensureAuthDir();
  const credentials = readCredentials();

  // Se ja temos uma pagina ativa e o browser esta rodando
  if (activePage && activeBrowser) {
    try {
      const isClosed = activePage.isClosed();
      if (!isClosed) {
        const currentUrl = activePage.url();
        if (currentUrl.includes("principal.zul")) {
          const passInput = activePage.locator('input[type="password"]').first();
          const loginVisible = await passInput.isVisible({ timeout: 1000 }).catch(() => false);
          if (!loginVisible) {
            return { browser: activeBrowser, context: activeContext, page: activePage };
          }
        }
      }
    } catch (e) {
      console.log("[Session] Erro ao validar sessao ativa, reiniciando...", e.message);
      await closeSession().catch(() => {});
    }
  }

  console.log("[Session] Iniciando novo navegador...");
  activeBrowser = await chromium.launch({ headless: true });
  
  // Tenta carregar storageState existente
  const contextOptions = {
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    ignoreHTTPSErrors: true,
  };

  if (fs.existsSync(storageStatePath)) {
    contextOptions.storageState = storageStatePath;
    console.log("[Session] Carregando cookies de sessao anteriores...");
  }

  activeContext = await activeBrowser.newContext(contextOptions);
  activePage = await activeContext.newPage();

  try {
    await activePage.goto(PRINCIPAL_URL, { waitUntil: "networkidle", timeout: 90000 });
    const loggedIn = await doLoginIfNeeded(activePage, credentials);
    
    if (loggedIn) {
      // Salva novos cookies
      await activeContext.storageState({ path: storageStatePath });
      console.log("[Session] Novos cookies salvos em storage-state.json");
    }
  } catch (e) {
    console.error("[Session] Falha ao inicializar a pagina:", e);
    await closeSession().catch(() => {});
    throw e;
  }

  return { browser: activeBrowser, context: activeContext, page: activePage };
}

async function closeSession() {
  if (activeBrowser) {
    await activeBrowser.close().catch(() => {});
  }
  activeBrowser = null;
  activeContext = null;
  activePage = null;
}

module.exports = {
  getOrCreateSession,
  closeSession,
  readCredentials,
  storageStatePath,
};
