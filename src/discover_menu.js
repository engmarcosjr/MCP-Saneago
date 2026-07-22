const fs = require('fs');
const path = require('path');
const { getOrCreateSession, closeSession } = require('./session');

const MENU_COMPLETO_PATH = path.resolve(__dirname, '../config/menu_completo.json');

function loadMenuCompletoCheckpoint() {
  if (fs.existsSync(MENU_COMPLETO_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(MENU_COMPLETO_PATH, 'utf8'));
      if (Array.isArray(data)) return data;
    } catch (e) {
      console.error(`[DiscoverMenu] Erro ao ler checkpoint ${MENU_COMPLETO_PATH}:`, e.message);
    }
  }
  return [];
}

function saveMenuCompletoCheckpoint(items) {
  const dir = path.dirname(MENU_COMPLETO_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(MENU_COMPLETO_PATH, JSON.stringify(items, null, 2), 'utf8');
}

/**
 * Retorna os itens do popup mais recente/ativo no DOM ZK
 */
async function getActivePopupItems(page) {
  return await page.evaluate(() => {
    const popups = Array.from(document.querySelectorAll('.z-menupopup')).filter(p => {
      const style = getComputedStyle(p);
      return style.display !== 'none' && style.visibility !== 'hidden' && p.offsetWidth > 0;
    });

    if (popups.length === 0) return [];
    const targetPopup = popups[popups.length - 1];

    const nodes = Array.from(targetPopup.querySelectorAll(':scope > ul > li, .z-menu, .z-menuitem'));
    const itemsMap = new Map();
    nodes.forEach(n => {
      const text = n.innerText ? n.innerText.trim() : '';
      if (!text) return;
      const isSubmenu = n.classList.contains('z-menu') || n.querySelector('.z-menu-icon') !== null;
      if (!itemsMap.has(text)) {
        itemsMap.set(text, { id: n.id, text, isSubmenu });
      }
    });

    return Array.from(itemsMap.values());
  });
}

/**
 * Função recursiva para percorrer niveis de menu direcionadamente
 */
async function meanderMenu(page, caminhoAtual, folhasAcumuladas) {
  const items = await getActivePopupItems(page);
  
  for (const item of items) {
    const novoCaminho = [...caminhoAtual, item.text];
    if (!item.isSubmenu) {
      folhasAcumuladas.push({
        rotulo: item.text,
        caminho_menu: novoCaminho,
        id_element: item.id
      });
    } else {
      const clicked = await page.evaluate((elemId) => {
        const node = document.getElementById(elemId);
        if (node) {
          const anchor = node.querySelector('a') || node;
          anchor.click();
          return true;
        }
        return false;
      }, item.id);

      if (clicked) {
        await page.waitForTimeout(200);
        await meanderMenu(page, novoCaminho, folhasAcumuladas);
      }
    }
  }
}

/**
 * Clica no menu Sistemas via JS DOM puro
 */
async function clickSistemas(page) {
  await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('.z-menubar a.z-menu-content')).find(a => (a.innerText || '').includes('Sistemas'));
    if (el) el.click();
  });
  await page.waitForTimeout(300);
}

/**
 * Clica no modulo especifico em Sistemas via JS DOM puro
 */
async function clickModulo(page, moduloText) {
  await clickSistemas(page);
  await page.evaluate((mod) => {
    const items = Array.from(document.querySelectorAll('.z-menupopup-open .z-menuitem-text, .z-menupopup-open .z-menu-text'));
    const target = items.find(it => (it.innerText || '').trim() === mod);
    if (target) {
      const anchor = target.closest('a') || target;
      anchor.click();
    }
  }, moduloText);
  await page.waitForTimeout(600);
}

/**
 * Executa a descoberta completa do menu recursivo (T1)
 */
async function runMenuDiscovery() {
  console.log("=== INICIANDO DESCOBERTA RECURSIVA DE MENU (T1) ===");

  const checkpointItems = loadMenuCompletoCheckpoint();
  console.log(`[DiscoverMenu] Carregados ${checkpointItems.length} itens do checkpoint existente.`);

  const menuMap = new Map();
  checkpointItems.forEach(item => {
    const key = Array.isArray(item.caminho_menu) ? item.caminho_menu.join(' > ') : item.rotulo;
    menuMap.set(key, item);
  });

  const session = await getOrCreateSession();
  const page = session.page;

  console.log("[DiscoverMenu] Navegando para montarMenu.zul...");
  await page.goto("https://www.saneago.com.br/prt/mpt/montarMenu.zul", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1500);

  // Obter módulos de Sistemas
  await clickSistemas(page);

  const modulos = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.z-menupopup-open .z-menuitem-text'));
    return items.map(it => it.innerText.trim()).filter(Boolean);
  });

  console.log(`[DiscoverMenu] ${modulos.length} módulos identificados.`);

  const folhasDescobertas = [];

  for (let mIdx = 0; mIdx < modulos.length; mIdx++) {
    const modulo = modulos[mIdx];
    console.log(`[DiscoverMenu] [${mIdx + 1}/${modulos.length}] Módulo: "${modulo}"`);

    await clickModulo(page, modulo);

    const topMenus = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.z-menubar .z-menu-content, .z-menubar .z-menuitem-content'));
      return items.map(m => m.innerText ? m.innerText.trim() : '').filter(t => t && t !== 'Sistemas');
    });

    for (const topMenu of topMenus) {
      await page.evaluate((menuTxt) => {
        const items = Array.from(document.querySelectorAll('.z-menubar .z-menu-content, .z-menubar .z-menuitem-content'));
        const target = items.find(m => (m.innerText || '').trim() === menuTxt);
        if (target) target.click();
      }, topMenu);

      await page.waitForTimeout(250);
      await meanderMenu(page, [modulo, topMenu], folhasDescobertas);
    }
  }

  console.log(`\n[DiscoverMenu] Mapeamento concluído: ${folhasDescobertas.length} itens folha encontrados.`);

  // 2. Resolver código e URL ZUL para cada folha com otimização de estado
  console.log("[DiscoverMenu] Resolvendo rótulo -> código para cada folha...");
  let novosResolvidos = 0;

  for (let i = 0; i < folhasDescobertas.length; i++) {
    const folha = folhasDescobertas[i];
    const key = folha.caminho_menu.join(' > ');

    if (menuMap.has(key) && menuMap.get(key).codigo) {
      continue;
    }

    console.log(`[DiscoverMenu] [${i + 1}/${folhasDescobertas.length}] Resolvendo: "${key}"...`);

    try {
      const resolvido = await resolverFolhaMenuDirect(page, folha);
      menuMap.set(key, resolvido);
      if (resolvido.codigo) {
        console.log(`  -> SUCESSO: [${resolvido.codigo}] ${resolvido.url_zul}`);
      } else {
        console.log(`  -> Sem código zul (link externo ou popup)`);
      }
      novosResolvidos++;
      saveMenuCompletoCheckpoint(Array.from(menuMap.values()));
    } catch (err) {
      console.error(`  - Erro ao resolver "${key}": ${err.message}`);
      menuMap.set(key, {
        rotulo: folha.rotulo,
        caminho_menu: folha.caminho_menu,
        url_zul: "",
        codigo: null,
        erro: err.message
      });
      saveMenuCompletoCheckpoint(Array.from(menuMap.values()));
    }
  }

  const finalArray = Array.from(menuMap.values());
  saveMenuCompletoCheckpoint(finalArray);

  console.log(`\n=== DESCOBERTA RECURSIVA CONCLUÍDA ===`);
  console.log(`Total final no config/menu_completo.json: ${finalArray.length} (novos resolvidos nesta rodada: ${novosResolvidos})`);
  return finalArray;
}

/**
 * Resolve a folha navegando diretamente com seletores DOM puros
 */
async function resolverFolhaMenuDirect(page, folha) {
  const [modulo, topMenu, ...restante] = folha.caminho_menu;

  if (!page.url().includes("montarMenu.zul")) {
    await page.goto("https://www.saneago.com.br/prt/mpt/montarMenu.zul", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);
  }

  await clickModulo(page, modulo);

  await page.evaluate((menuTxt) => {
    const items = Array.from(document.querySelectorAll('.z-menubar .z-menu-content, .z-menubar .z-menuitem-content'));
    const target = items.find(m => (m.innerText || '').trim() === menuTxt);
    if (target) target.click();
  }, topMenu);
  await page.waitForTimeout(250);

  for (let i = 0; i < restante.length - 1; i++) {
    const subText = restante[i];
    await page.evaluate((txt) => {
      const items = Array.from(document.querySelectorAll('.z-menupopup-open .z-menu-text, .z-menupopup-open .z-menuitem-text'));
      const target = items.find(m => (m.innerText || '').trim() === txt);
      if (target) {
        const anchor = target.closest('a') || target;
        anchor.click();
      }
    }, subText);
    await page.waitForTimeout(250);
  }

  let rawZulPath = "";

  const responseHandler = async res => {
    if (res.url().includes('/zkau') && res.status() === 200) {
      try {
        const text = await res.text();
        const match = text.match(/['"](src|href)['"]\s*:\s*['"]([^'"]+\.zul)['"]/i) ||
                      text.match(/['"]([^'"]*\/[A-Z]{2,4}\d{3,4}[^'"]*\.zul)['"]/i);
        if (match && match[2]) {
          rawZulPath = match[2];
        } else if (match && match[1] && match[1].includes('.zul')) {
          rawZulPath = match[1];
        }
      } catch (e) {}
    }
  };

  page.on('response', responseHandler);

  const leafText = folha.rotulo;
  await page.evaluate((txt) => {
    const items = Array.from(document.querySelectorAll('.z-menupopup-open .z-menuitem-text'));
    const target = items.find(m => (m.innerText || '').trim() === txt);
    if (target) {
      const anchor = target.closest('a') || target;
      anchor.click();
    }
  }, leafText);

  await page.waitForTimeout(1200);
  page.off('response', responseHandler);

  if (!rawZulPath) {
    const frames = page.frames();
    const appFrame = frames.find(f => f.url().includes('.zul') && !f.url().includes('montarMenu.zul') && !f.url().includes('principal.zul'));
    if (appFrame) {
      rawZulPath = appFrame.url();
    }
  }

  let url_zul = "";
  let codigo = null;

  if (rawZulPath) {
    if (rawZulPath.startsWith('http')) {
      url_zul = rawZulPath;
    } else if (rawZulPath.startsWith('/')) {
      url_zul = `https://www.saneago.com.br${rawZulPath}`;
    } else {
      url_zul = `https://www.saneago.com.br/prt/${rawZulPath}`;
    }

    const matchCod = url_zul.match(/\/([A-Z]{2,4}\d{3,4})[A-Za-z0-9_]*\.zul/i);
    if (matchCod && matchCod[1]) {
      codigo = matchCod[1].toUpperCase();
    }
  }

  if (!codigo) {
    const frames = page.frames();
    for (const f of frames) {
      try {
        const headerText = await f.evaluate(() => {
          const h = document.querySelector('.z-window-header, .z-caption, h1, h2, h3');
          return h ? h.innerText : '';
        });
        const matchH = headerText.match(/([A-Z]{2,4}\d{3,4})\s*[-–]/i);
        if (matchH && matchH[1]) {
          codigo = matchH[1].toUpperCase();
          break;
        }
      } catch (e) {}
    }
  }

  return {
    rotulo: folha.rotulo,
    caminho_menu: folha.caminho_menu,
    url_zul: url_zul || "",
    codigo: codigo || null
  };
}

if (require.main === module) {
  runMenuDiscovery()
    .then(() => closeSession())
    .catch(err => {
      console.error("[DiscoverMenu] Erro fatal:", err);
      closeSession();
      process.exit(1);
    });
}

module.exports = { runMenuDiscovery, loadMenuCompletoCheckpoint, saveMenuCompletoCheckpoint };
