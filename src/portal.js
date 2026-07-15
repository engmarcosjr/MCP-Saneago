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

  console.log(`[Portal] Navegando para a home para limpar abas abertas...`);
  await page.goto(PRINCIPAL_URL, { waitUntil: "networkidle", timeout: 60000 });

  // Na interface nova (Rede Social Corporativa), o campo de busca tem placeholder Buscar...
  const appInput = page.getByPlaceholder(/Buscar/i).first();
  await appInput.waitFor({ state: "visible", timeout: 30000 });

  console.log(`[Portal] Buscando aplicativo: "${nomeExibicao}"...`);
  await appInput.click();
  await appInput.fill(""); 
  
  // Extrai apenas o codigo (ex: ECO701) para a busca ser mais eficiente
  const codigoApp = nomeExibicao.split("-")[0].trim();
  
  // Digita sequencialmente para acionar o filtro dinamico do ZK
  await appInput.pressSequentially(codigoApp, { delay: 100 });
  
  console.log(`[Portal] Aguardando resposta do ZK apos digitar...`);
  await page.waitForResponse(response => response.url().includes('/zkau') && response.status() === 200, { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2000); // Aguarda renderizacao

  // Tira um screenshot do estado atual para debug
  const fs = require('fs');
  if (!fs.existsSync('data')) fs.mkdirSync('data');
  await page.screenshot({ path: 'data/debug_search.png', fullPage: true }).catch(() => {});
  const html = await page.content().catch(() => '');
  fs.writeFileSync('data/debug_search.html', html);

  console.log(`[Portal] Aguardando resultado na lista de Aplicações...`);
  
  // Aguarda aparecer a linha com o nome do aplicativo
  const safeRegex = nomeExibicao.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&').replace(/\s+/g, '\\s*');
  const regex = new RegExp(safeRegex, "i");
  const opcao = page.getByRole("row", { name: regex }).first();
  
  try {
    await opcao.waitFor({ state: "visible", timeout: 5000 });
    console.log(`[Portal] Opcao encontrada na lista, clicando no botao...`);
    await opcao.locator('button').first().click();
  } catch (e) {
    console.log(`[Portal] Opcao nao encontrada na lista pelo nome completo. Tentando apenas pelo codigo...`);
    const opcaoCodigo = page.getByRole("row", { name: new RegExp(codigoApp, "i") }).first();
    if (await opcaoCodigo.isVisible().catch(() => false)) {
      console.log(`[Portal] OpcaoCodigo encontrada, clicando no botao...`);
      await opcaoCodigo.locator('button').first().click();
    } else {
      console.log(`[Portal] Nenhuma opcao visivel, pressionando Enter na busca...`);
      await appInput.press("Enter");
      await page.waitForResponse(response => response.url().includes('/zkau') && response.status() === 200, { timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(2000);
      
      const opcaoPosEnter = page.getByRole("row", { name: new RegExp(codigoApp, "i") }).first();
      if (await opcaoPosEnter.isVisible().catch(() => false)) {
        console.log(`[Portal] Opcao encontrada pos-enter, clicando no botao...`);
        await opcaoPosEnter.locator('button').first().click();
      } else {
        throw new Error(`Aplicacao ${codigoApp} nao encontrada na busca.`);
      }
    }
  }

  console.log(`[Portal] Aguardando carregamento do iframe da aplicacao...`);
  
  try {
    await page.locator('iframe[src*=".zul"]').first().waitFor({ state: "visible", timeout: 30000 });
  } catch (e) {
    console.error(`[Portal] Erro: iframe nao apareceu. Salvando screenshot e HTML para debug...`);
    const fs = require('fs');
    if (!fs.existsSync('data')) fs.mkdirSync('data');
    await page.screenshot({ path: 'data/debug_portal2.png', fullPage: true }).catch(() => {});
    const html = await page.content().catch(() => '');
    fs.writeFileSync('data/debug_portal2.html', html);
    throw e;
  }

  // Procura o objeto Frame correspondente no Playwright
  for (let i = 0; i < 30; i++) {
    const frames = page.frames();
    const appFrame = frames.find((f) => {
      const url = f.url();
      return url.includes(".zul") && !url.includes("principal.zul") && !url.includes("montarMenu.zul");
    });
    
    if (appFrame) {
      console.log(`[Portal] Frame encontrado! URL: ${appFrame.url()}`);
      
      // Aguarda a pagina do frame terminar de carregar
      await appFrame.waitForLoadState("domcontentloaded").catch(() => {});
      return appFrame;
    }
    await page.waitForTimeout(500);
  }

  throw new Error(`Nao foi possivel encontrar o frame da aplicacao apos buscar por "${nomeExibicao}".`);
}

module.exports = { abrirApp };
