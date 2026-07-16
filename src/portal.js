const fs = require('fs');
const path = require('path');
const { getOrCreateSession } = require("./session");

const PRINCIPAL_URL = "https://www.saneago.com.br/prt/mpt/principal.zul";

/**
 * Abre uma aplicacao na Intranet Saneago pelo nome de exibicao.
 * 
 * @param {string} nomeExibicao O nome exato ou aproximado para buscar (ex: 'ECO701 - REGISTRO DE ATENDIMENTO')
 * @returns {Promise<import('playwright').Frame>} O frame onde a aplicacao foi carregada
 */
async function abrirApp(nomeExibicao) {
  const session = await getOrCreateSession();
  const page = session.page;

  console.error(`[Portal] Navegando para a home para limpar abas abertas...`);
  await page.goto(PRINCIPAL_URL, { waitUntil: "networkidle", timeout: 60000 });

  // Na interface nova (Rede Social Corporativa), o campo de busca tem placeholder Buscar...
  const appInput = page.getByPlaceholder(/Buscar/i).first();
  await appInput.waitFor({ state: "visible", timeout: 30000 });

  console.error(`[Portal] Buscando aplicativo: "${nomeExibicao}"...`);
  await appInput.click();
  await appInput.fill(""); 
  
  // Extrai apenas o codigo (ex: ECO701) para a busca ser mais eficiente
  const codigoApp = nomeExibicao.split("-")[0].trim();
  
  // Digita sequencialmente para acionar o filtro dinamico do ZK
  await appInput.pressSequentially(codigoApp, { delay: 100 });
  
  console.error(`[Portal] Aguardando resposta do ZK apos digitar...`);
  await page.waitForResponse(response => response.url().includes('/zkau') && response.status() === 200, { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2000); // Aguarda renderizacao

  // Tira um screenshot do estado atual para debug se a variavel de ambiente permitir
  if (process.env.DEBUG === '1') {
    if (!fs.existsSync('data')) fs.mkdirSync('data');
    await page.screenshot({ path: 'data/debug_search.png', fullPage: true }).catch(() => {});
    const html = await page.content().catch(() => '');
    fs.writeFileSync('data/debug_search.html', html);
  }

  console.error(`[Portal] Aguardando resultado na lista de Aplicações...`);
  
  // Aguarda aparecer a linha com o nome do aplicativo
  const safeRegex = nomeExibicao.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&').replace(/\s+/g, '\\s*');
  const regex = new RegExp(safeRegex, "i");
  const opcao = page.getByRole("row", { name: regex }).first();
  
  try {
    await opcao.waitFor({ state: "visible", timeout: 5000 });
    console.error(`[Portal] Opcao encontrada na lista, clicando no botao...`);
    await opcao.locator('button').first().click();
  } catch (e) {
    console.error(`[Portal] Opcao nao encontrada na lista pelo nome completo. Tentando apenas pelo codigo...`);
    const opcaoCodigo = page.getByRole("row", { name: new RegExp(codigoApp, "i") }).first();
    if (await opcaoCodigo.isVisible().catch(() => false)) {
      console.error(`[Portal] OpcaoCodigo encontrada, clicando no botao...`);
      await opcaoCodigo.locator('button').first().click();
    } else {
      console.error(`[Portal] Nenhuma opcao visivel, pressionando Enter na busca...`);
      await appInput.press("Enter");
      await page.waitForResponse(response => response.url().includes('/zkau') && response.status() === 200, { timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(2000);
      
      const opcaoPosEnter = page.getByRole("row", { name: new RegExp(codigoApp, "i") }).first();
      if (await opcaoPosEnter.isVisible().catch(() => false)) {
        console.error(`[Portal] Opcao encontrada pos-enter, clicando no botao...`);
        await opcaoPosEnter.locator('button').first().click();
      } else {
        console.error(`[Portal] Aplicacao ${codigoApp} nao encontrada na busca principal. Tentando fallback via menu...`);
        const catPath = path.join(__dirname, '../config/catalogo_aplicacoes.json');
        const catalogo = JSON.parse(fs.readFileSync(catPath, 'utf8'));
        const appInfo = catalogo.find(a => a.codigo === codigoApp);
        
        if (!appInfo) {
            throw new Error(`Aplicacao ${codigoApp} nao encontrada na busca e nem no catalogo.`);
        }
        
        const menuNavPath = path.join(__dirname, '../config/menu_nav.json');
        if (!fs.existsSync(menuNavPath)) {
            throw new Error(`Aplicacao ${codigoApp} nao encontrada na busca. Fallback indisponivel (menu_nav.json ausente).`);
        }
        const menuNav = JSON.parse(fs.readFileSync(menuNavPath, 'utf8'));
        
        const nav = menuNav[codigoApp];
        if (!nav) {
            throw new Error(`Aplicacao ${codigoApp} nao encontrada no menu_nav.json. Execute o discovery.`);
        }
        
        console.error(`[Portal] Navegando via menu: ${nav.modulo} -> ${nav.menu} -> ${nav.nome}`);
        
        await page.goto("https://www.saneago.com.br/prt/mpt/montarMenu.zul", { waitUntil: "networkidle", timeout: 60000 });
        await page.waitForTimeout(2000);
        
        const sistemasLocator = page.locator('a.z-menu-content', { hasText: 'Sistemas' }).first();
        await sistemasLocator.evaluate(n=>n.click());
        await page.waitForTimeout(1500);
        
        const modItem = page.locator('.z-menupopup-open .z-menuitem-text', { hasText: nav.modulo }).first();
        await modItem.evaluate(node => {
            const anchor = node.closest('a');
            if (anchor) anchor.click();
            else node.click();
        });
        await page.waitForResponse(response => response.url().includes('/zkau') && response.status() === 200, { timeout: 10000 }).catch(() => {});
        await page.waitForTimeout(2000);
        
        const topMenu = page.locator('a.z-menu-content', { hasText: nav.menu }).first();
        await topMenu.evaluate(n=>n.click());
        await page.waitForTimeout(1500);
        
        const appItem = page.locator('.z-menupopup-open .z-menuitem-text', { hasText: nav.nome }).first();
        await appItem.evaluate(node => {
            const anchor = node.closest('a');
            if (anchor) anchor.click();
            else node.click();
        });
        console.error(`[Portal] Clique no menu realizado com sucesso! Aguardando iframe...`);
      }
    }
  }

  console.error(`[Portal] Aguardando carregamento do iframe da aplicacao...`);
  
  // Procura o objeto Frame correspondente no Playwright (incluindo frames aninhados).
  // Duas fases: prioriza frames .zul (apps ZK); só aceita outros tipos (.jsp/.php/.html)
  // como fallback tardio, porque a home do portal mantém um frame index.html sempre
  // presente que, aceito de imediato, é retornado no lugar do .zul ainda carregando.
  const naoEhFrameDeApp = (url) =>
    url.includes("principal.zul") ||
    url.includes("montarMenu.zul") ||
    url.includes("bemVindo.zul") ||
    url.includes("index_OLD.php") ||
    url.includes("/intranet/index.html");

  for (let i = 0; i < 60; i++) {
    const frames = page.frames();
    let appFrame = frames.find((f) => f.url().includes(".zul") && !naoEhFrameDeApp(f.url()));

    if (!appFrame && i >= 20) {
      appFrame = frames.find((f) => {
        const url = f.url();
        return (url.includes(".jsp") || url.includes(".php") || url.includes(".html") || url.includes(".htm")) &&
               !naoEhFrameDeApp(url);
      });
    }

    if (appFrame) {
      console.error(`[Portal] Frame encontrado! URL: ${appFrame.url()}`);
      
      // Aguarda a pagina do frame terminar de carregar
      await appFrame.waitForLoadState("domcontentloaded").catch(() => {});
      return appFrame;
    }
    await page.waitForTimeout(500);
  }

  throw new Error(`Nao foi possivel encontrar o frame da aplicacao apos buscar por "${nomeExibicao}".`);
}

module.exports = { abrirApp };
