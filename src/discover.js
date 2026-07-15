const fs = require("fs");
const path = require("path");
const { getOrCreateSession, closeSession } = require("./session");

const catalogoPath = path.join(__dirname, "..", "config", "catalogo_aplicacoes.json");

async function runDiscovery() {
  console.log("Iniciando descoberta de aplicacoes...");
  let apps = [];
  let sourceUsed = "";

  try {
    const session = await getOrCreateSession();
    const page = session.page;

    console.log("Navegando para principal.zul...");
    await page.goto("https://www.saneago.com.br/prt/mpt/principal.zul", { waitUntil: "networkidle", timeout: 60000 });
    
    await page.waitForTimeout(3000);

    console.log("Tentando Fallback: Busca por prefixos...");
    const appInput = page.getByPlaceholder(/Buscar/i).first();
    // Varrer prefixos solicitados: ECO, SAN, MTG, PSS, A-Z
    const prefixes = ['ECO', 'SAN', 'MTG', 'PSS', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];
    const foundApps = new Map();

    if (await appInput.isVisible()) {
      for (const prefix of prefixes) {
        console.log(`Buscando por prefixo: ${prefix}`);
        await appInput.click();
        await appInput.fill("");
        await appInput.pressSequentially(prefix, { delay: 50 });
        
        await page.waitForResponse(response => response.url().includes('/zkau') && response.status() === 200, { timeout: 10000 }).catch(() => {});
        await page.waitForTimeout(1000);

        // O resultado vem em z-listitem
        const listItems = await page.locator('.z-listitem').all();
        for (const item of listItems) {
          // Extrai cada celula (z-listcell)
          const cells = await item.locator('.z-listcell').allInnerTexts();
          if (cells && cells.length >= 2) {
            const codigo = cells[0].trim();
            const nome = cells[1].trim();
            
            // Ignorar matriculas de pessoas que comecam com M seguido de numeros
            if (/^M\d+$/.test(codigo)) continue;
            // Ignorar diretorias que sao so uma letra ou comecam com D/S e numeros curtos, a menos que seja app de fato
            // Apps de fato tem formato tipo ECO701, MTG001, BAP002
            // Vamos aceitar todos que tiverem codigo e nome bem definidos
            if (codigo.length > 2 && nome.length > 2) {
              // Limpa url_zul se tiver
              let url_zul = cells.length > 3 ? cells[3].trim() : "";
              foundApps.set(codigo, { codigo, nome, url_zul, origem: 'busca_listcell' });
            }
          }
        }
      }
      
      apps = Array.from(foundApps.values());
      sourceUsed = "fallback_busca";
    }

    if (apps.length > 0) {
      console.log(`Foram encontradas ${apps.length} aplicacoes usando ${sourceUsed}`);
      apps.sort((a, b) => a.codigo.localeCompare(b.codigo));
      fs.writeFileSync(catalogoPath, JSON.stringify(apps, null, 2));
      console.log("Catalogo atualizado.");
    } else {
      console.log("Nenhuma aplicacao encontrada.");
    }

  } catch (error) {
    console.error("Erro durante descoberta:", error);
  } finally {
    await closeSession();
  }
}

runDiscovery();
