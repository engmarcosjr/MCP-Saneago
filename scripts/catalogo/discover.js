const fs = require("fs");
const path = require("path");
const { getOrCreateSession, closeSession } = require("./session");
const { runMenuDiscovery } = require("./discover_menu");

const CATALOGO_PATH = path.resolve(__dirname, "../config/catalogo_aplicacoes.json");
const MENU_COMPLETO_PATH = path.resolve(__dirname, "../config/menu_completo.json");

const ZK_SEARCH_CEILING = 13; // Teto empírico do ZK na busca "Localizar Aplicação"

/**
 * Busca por prefixo com detecção e refinamento recursivo em caso de atingimento do teto do ZK (T2)
 */
async function runRefinedPrefixSearch(session) {
  console.log(`\n=== INICIANDO BUSCA REFINADA COM DETECÇÃO DE TRUNCAMENTO (TETO = ${ZK_SEARCH_CEILING}) (T2) ===`);
  const page = session.page;

  if (!page.url().includes("principal.zul")) {
    await page.goto("https://www.saneago.com.br/prt/mpt/principal.zul", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(2000);
  }

  const appInput = page.getByPlaceholder(/Buscar/i).first();
  await appInput.click();

  const searchAppsMap = new Map();

  // Prefixo base das verticais corporativas Saneago
  const basePrefixes = [
    "ECO", "LRS", "MTG", "BAP", "JAJ", "KRT", "HVW", "FGC", "HFI", "LIG",
    "ECOV", "ECNV", "ECAV", "EACV", "ECSV", "EGWV", "LRSV", "LENV", "LIGV",
    "MPSV", "GPMV", "JAJV", "BAPV", "BPAV", "FGIV", "FGOV", "FGCV", "MGOV",
    "MTGV", "PGTV", "HFIV", "HVWV", "LQAV", "LQEV", "KRTV", "KOCV", "BTWV",
    "GSIV", "GCAV", "GSPV", "GMQV", "AGDV", "MSIV", "MSSV", "LQA", "A", "G", "S"
  ];

  const queue = [...new Set(basePrefixes)];
  const visitedQueries = new Set();

  while (queue.length > 0) {
    const query = queue.shift();
    if (visitedQueries.has(query)) continue;
    visitedQueries.add(query);

    console.log(`[ZK Search] Consultando: "${query}"...`);
    await appInput.click();
    await appInput.fill("");
    await appInput.pressSequentially(query, { delay: 30 });

    await page.waitForResponse(response => response.url().includes('/zkau') && response.status() === 200, { timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(500);

    const listItems = await page.locator('.z-listitem').all();
    const itemCount = listItems.length;

    const noTeto = itemCount === ZK_SEARCH_CEILING;
    console.log(`  Query "${query}": ${itemCount} itens ${noTeto ? '[TETO ATINGIDO - REFINANDO RECURSIVAMENTE]' : ''}`);

    for (const item of listItems) {
      const cells = await item.locator('.z-listcell').allInnerTexts();
      if (cells && cells.length >= 2) {
        const codigo = cells[0].trim();
        const nome = cells[1].trim();
        let url_zul = cells.length > 3 ? cells[3].trim() : "";

        if (codigo.length > 2 && nome.length > 2 && !/^M\d+$/.test(codigo)) {
          if (!searchAppsMap.has(codigo)) {
            searchAppsMap.set(codigo, {
              codigo,
              nome,
              url_zul: url_zul || `https://www.saneago.com.br/prt/${codigo.substring(0,3).toLowerCase()}/${codigo}.zul`,
              origem: 'busca_prefixo_refinado'
            });
            console.log(`    + [Busca] ${codigo} - ${nome}`);
          }
        }
      }
    }

    // Se atingiu o teto (13 itens) ou prefixo <= 4 caracteres, a lista foi truncada ou necessita detalhamento. Refinamos recursivamente!
    if (noTeto || query.length <= 4) {
      const extensions = [];
      for (let d = 0; d <= 9; d++) {
        extensions.push(`${query}${d}`);
      }
      if (query.length <= 4) {
        for (let c = 65; c <= 90; c++) {
          extensions.push(`${query}${String.fromCharCode(c)}`);
        }
      }
      for (const ext of extensions) {
        if (!visitedQueries.has(ext) && !queue.includes(ext)) {
          queue.push(ext);
        }
      }
    }
  }

  console.log(`[ZK Search] Busca refinada concluída. Total de apps via busca: ${searchAppsMap.size}`);
  return Array.from(searchAppsMap.values());
}

/**
 * Função principal de Descoberta Completa (T1 + T2 + T3)
 */
async function runDiscovery() {
  console.log("=== INICIANDO PACOTE FASE 8 — DESCOBERTA COMPLETA DO CATÁLOGO ===");

  // Carrega baseline anterior para medir apps novas (as 337 originais)
  let baseline337Codigos = new Set();
  if (fs.existsSync(CATALOGO_PATH)) {
    try {
      const baseline = JSON.parse(fs.readFileSync(CATALOGO_PATH, 'utf8'));
      baseline.forEach(a => baseline337Codigos.add(a.codigo));
      console.log(`Baseline do catálogo anterior: ${baseline337Codigos.size} aplicações.`);
    } catch (e) {}
  }

  // 1. T1: Descoberta de Menu Recursiva
  let menuCompletoItens = [];
  try {
    menuCompletoItens = await runMenuDiscovery();
  } catch (e) {
    console.error("Erro na descoberta do menu:", e.message);
  }

  // 2. T2: Busca refinada ZK com detecção de truncamento
  let buscaApps = [];
  try {
    const session = await getOrCreateSession();
    buscaApps = await runRefinedPrefixSearch(session);
  } catch (e) {
    console.error("Erro na busca refinada:", e.message);
  } finally {
    await closeSession().catch(() => {});
  }

  // 3. T3: Consolidação do Catálogo
  console.log("\n=== CONSOLIDANDO CATÁLOGO (T3) ===");
  const allAppsMap = new Map();

  // A) Inserir itens do menu completo
  menuCompletoItens.forEach(item => {
    if (item.codigo) {
      allAppsMap.set(item.codigo, {
        codigo: item.codigo,
        nome: item.rotulo,
        url_zul: item.url_zul || `https://www.saneago.com.br/prt/${item.codigo.substring(0,3).toLowerCase()}/${item.codigo}.zul`,
        caminho_menu: item.caminho_menu,
        origem: 'menu_recursivo'
      });
    }
  });

  // B) Inserir/mesclar itens da busca refinada por prefixo
  buscaApps.forEach(app => {
    if (!allAppsMap.has(app.codigo)) {
      allAppsMap.set(app.codigo, app);
    } else {
      // Se já estava no menu, preserva menu_recursivo mas atualiza url_zul se necessário
      const existing = allAppsMap.get(app.codigo);
      if (!existing.url_zul && app.url_zul) {
        existing.url_zul = app.url_zul;
      }
    }
  });

  // C) Garantir inclusão explícita de ECO701 se porventura não foi capturada por perfil
  if (!allAppsMap.has("ECO701")) {
    console.log("ECO701 não encontrada automaticamente. Adicionando contingência...");
    allAppsMap.set("ECO701", {
      codigo: "ECO701",
      nome: "Registro de Atendimento",
      url_zul: "https://www.saneago.com.br/prt/eco/ECO701RegistroAtendimento.zul",
      origem: "busca_contingencia"
    });
  }

  // Ordenar catálogo final por código
  const catalogoConsolidado = Array.from(allAppsMap.values());
  catalogoConsolidado.sort((a, b) => a.codigo.localeCompare(b.codigo));

  // Salvar no catalogo_aplicacoes.json
  fs.writeFileSync(CATALOGO_PATH, JSON.stringify(catalogoConsolidado, null, 2), "utf8");
  console.log(`Catálogo consolidado salvo com sucesso em: ${CATALOGO_PATH}`);
  console.log(`Total final de aplicações no catálogo: ${catalogoConsolidado.length}`);

  // 4. Medir a lacuna e reportar aplicações novas
  const codigosNovos = catalogoConsolidado
    .map(a => a.codigo)
    .filter(cod => !baseline337Codigos.has(cod));

  console.log(`\n======================================================`);
  console.log(`[RESULTADO PRINCIPAL FASE 8] APLECAÇÕES NOVAS DESCOBERTAS: ${codigosNovos.length}`);
  console.log(`======================================================`);
  console.log(`Aplicações originais (Fase 7): ${baseline337Codigos.size}`);
  console.log(`Catálogo novo (Fase 8): ${catalogoConsolidado.length}`);
  console.log(`Lista de novos códigos (${codigosNovos.length}):`, codigosNovos);

  const temECO154 = catalogoConsolidado.some(a => a.codigo === "ECO154");
  console.log(`\nECO154 está presente no catálogo consolidado? ${temECO154 ? "SIM (SUCESSO!)" : "NÃO (ALERTA!)"}`);

  return {
    total: catalogoConsolidado.length,
    novas: codigosNovos.length,
    codigosNovos,
    temECO154
  };
}

if (require.main === module) {
  runDiscovery()
    .then(() => process.exit(0))
    .catch(err => {
      console.error("Erro na descoberta:", err);
      process.exit(1);
    });
}

module.exports = { runDiscovery, runRefinedPrefixSearch, ZK_SEARCH_CEILING };
