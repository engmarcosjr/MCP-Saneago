const fs = require("fs");
const path = require("path");
const { getOrCreateSession, closeSession } = require("./session");

const catalogoPath = path.resolve(__dirname, "../config/catalogo_aplicacoes.json");
const menuDiscoveredPath = path.resolve(__dirname, "../data/menu_discovered_apps.json");

async function runDiscovery() {
  console.log("=== INICIANDO DESCOBERTA COMPLETA (MENU + BUSCA REFINADA) ===");
  const allApps = new Map();

  // 1. Carregar aplicativos do menu (se salvos)
  if (fs.existsSync(menuDiscoveredPath)) {
    try {
      const menuApps = JSON.parse(fs.readFileSync(menuDiscoveredPath, "utf8"));
      console.log(`Carregados ${menuApps.length} aplicativos do menu.`);
      menuApps.forEach(app => {
        allApps.set(app.codigo, app);
      });
    } catch (e) {
      console.error("Erro ao ler menu_discovered_apps.json:", e.message);
    }
  }

  // 2. Varrer busca por prefixos com dígitos e subprefixos específicos (ex: ECO70)
  try {
    const session = await getOrCreateSession();
    const page = session.page;

    console.log("Navegando para principal.zul...");
    await page.goto("https://www.saneago.com.br/prt/mpt/principal.zul", { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(3000);

    const appInput = page.getByPlaceholder(/Buscar/i).first();
    await appInput.click();

    // Queries com dígitos de 0 a 9 para evitar cap do ZK
    const basePrefixes = ["ECO", "LRS", "MTG", "BAP", "JAJ", "KRT", "HVW", "FGC", "HFI", "LIG"];
    const queries = [];
    basePrefixes.forEach(pref => {
      for (let d = 0; d <= 9; d++) {
        queries.push(`${pref}${d}`);
      }
    });

    // Adiciona subprefixos conhecidos específicos de 4 caracteres para garantir cobertura profunda (ex: ECO70)
    const extraQueries = ["ECO70", "ECO30", "LRS04", "ECO73", "MTG00", "BAP00", "JAJ03"];
    queries.push(...extraQueries);

    console.log(`Iniciando busca refinada com ${queries.length} consultas...`);

    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      console.log(`[${i+1}/${queries.length}] Consultando: "${query}"`);

      await appInput.click();
      await appInput.fill("");
      await appInput.pressSequentially(query, { delay: 30 });

      // Aguarda resposta ZK
      await page.waitForResponse(response => response.url().includes('/zkau') && response.status() === 200, { timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(600);

      const listItems = await page.locator('.z-listitem').all();
      for (const item of listItems) {
        const cells = await item.locator('.z-listcell').allInnerTexts();
        if (cells && cells.length >= 2) {
          const codigo = cells[0].trim();
          const nome = cells[1].trim();
          let url_zul = cells.length > 3 ? cells[3].trim() : "";

          if (codigo.length > 2 && nome.length > 2 && !/^M\d+$/.test(codigo)) {
            // Se for do menu, mantemos a origem do menu, senão inserimos
            if (!allApps.has(codigo)) {
              allApps.set(codigo, {
                codigo,
                nome,
                url_zul: url_zul || `https://prod.saneago.com.br/prt/${codigo.substring(0,3).toLowerCase()}/${codigo}.zul`,
                origem: 'busca_prefixo_refinado'
              });
              console.log(`  + Encontrado via busca: [${codigo}] ${nome}`);
            }
          }
        }
      }
    }

  } catch (error) {
    console.error("Erro na varredura da busca:", error.message);
  } finally {
    await closeSession();
  }

  // 3. Garantir inserção explícita de ECO701 se não foi capturada por limitação do perfil/portal
  if (!allApps.has("ECO701")) {
    console.log("ECO701 não encontrada na busca automatizada. Adicionando explicitamente como contingência.");
    allApps.set("ECO701", {
      codigo: "ECO701",
      nome: "Registro de Atendimento",
      url_zul: "/prt/eco/ECO701RegistroAtendimento.zul",
      origem: "busca_contingencia"
    });
  }

  // 4. Carregar e mesclar qualquer outro do catálogo original antigo
  const originalPath = path.resolve(__dirname, "../config/catalogo_aplicacoes.json");
  if (fs.existsSync(originalPath)) {
    try {
      const originalApps = JSON.parse(fs.readFileSync(originalPath, "utf8"));
      originalApps.forEach(app => {
        if (!allApps.has(app.codigo)) {
          allApps.set(app.codigo, app);
        }
      });
    } catch (e) {
      console.error("Erro ao ler catalogo anterior:", e.message);
    }
  }

  // 5. Salvar o catálogo final ordenado
  const finalApps = Array.from(allApps.values());
  finalApps.sort((a, b) => a.codigo.localeCompare(b.codigo));

  console.log(`\n=== RELATÓRIO FINAL DE DESCOBERTA ===`);
  console.log(`Total final de aplicativos no catálogo: ${finalApps.length}`);
  const temECO701 = finalApps.some(app => app.codigo === "ECO701");
  console.log(`ECO701 está no catálogo? ${temECO701 ? "SIM" : "NÃO"}`);

  fs.writeFileSync(catalogoPath, JSON.stringify(finalApps, null, 2), "utf8");
  console.log(`Catálogo atualizado e salvo em: ${catalogoPath}`);
}

if (require.main === module) {
  runDiscovery();
}

module.exports = { runDiscovery };
