"use strict";
/**
 * Captura os POSTs reais em /prt/zkau e serializa os campos/ids estáveis de uma tela.
 *
 * USO:
 *   node scripts/capturar_zkau.js ECO707 --intbxConta=2238097
 *   node scripts/capturar_zkau.js LRS010 --somente-abrir
 *   node scripts/capturar_zkau.js ECO709 --pesquisaCidade=2 --pesquisaBairro=81 --pesquisaLogradouro=1945
 */
const fs = require("fs");
const path = require("path");
const { abrirApp } = require("../src/portal");
const { preencherCampo } = require("../src/executor");
const { closeSession } = require("../src/session");

function parseArgs() {
  const args = process.argv.slice(2);
  const app = args[0] || "ECO707";
  let somenteAbrir = false;
  const params = {};

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--somente-abrir") {
      somenteAbrir = true;
    } else if (arg.startsWith("--")) {
      const parts = arg.slice(2).split("=");
      const key = parts[0];
      const val = parts.slice(1).join("=") || "true";
      params[key] = val;
    }
  }

  // Tenta carregar JSON de configuracao especifica se existir
  const jsonPath = path.join(__dirname, "captura", `${app}.json`);
  if (fs.existsSync(jsonPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
      if (cfg.somenteAbrir !== undefined) somenteAbrir = cfg.somenteAbrir;
      if (cfg.params) Object.assign(params, cfg.params);
    } catch (e) {
      console.error(`Erro lendo ${jsonPath}:`, e.message);
    }
  }

  return { app, somenteAbrir, params };
}

async function main() {
  const { app, somenteAbrir, params } = parseArgs();
  console.error(`[Captura] Iniciando app ${app} (somenteAbrir=${somenteAbrir})...`);

  const frame = await abrirApp(app);
  const page = frame.page();
  const capturas = [];

  page.on("request", (req) => {
    if (!req.url().includes("/zkau")) return;
    if (req.method() !== "POST") return;
    capturas.push({ url: req.url(), body: req.postData() || "" });
  });

  await page.waitForTimeout(2000);

  // Mapeia todos os elementos interativos e seus IDs
  const arvoreWidgets = await frame.locator("body").evaluate(() => {
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };
    const rotuloDe = (el) => {
      const tr = el.closest("tr, .z-row, .z-hbox, .z-vbox, .z-auxhead");
      if (!tr) return "";
      return (tr.innerText || "").replace(/\s+/g, " ").trim().slice(0, 100);
    };

    const inputs = Array.from(document.querySelectorAll("input, select, textarea"))
      .filter(visible)
      .map((e) => ({
        id: e.id,
        name: e.name || "",
        type: e.type || "",
        value: e.value || "",
        placeholder: e.placeholder || "",
        rotulo: rotuloDe(e),
      }));

    const botoes = Array.from(document.querySelectorAll("button, .z-button, .z-toolbarbutton"))
      .filter(visible)
      .map((b) => ({
        id: b.id,
        label: (b.innerText || b.title || "").trim(),
      }));

    const colunasGrade = Array.from(document.querySelectorAll(".z-listheader, .z-column, .z-auxheader"))
      .filter(visible)
      .map((c) => (c.innerText || "").trim())
      .filter(Boolean);

    return { inputs, botoes, colunasGrade, htmlCurto: document.body.innerHTML.slice(0, 5000) };
  });

  if (!somenteAbrir) {
    // Preenche campos baseados em IDs estaveis ou parametros passados
    for (const [key, val] of Object.entries(params)) {
      const matchingInput = arvoreWidgets.inputs.find(
        (inp) => inp.id === key || inp.id.includes(key) || inp.rotulo.toLowerCase().includes(key.toLowerCase())
      );
      if (matchingInput && matchingInput.id) {
        console.error(`[Captura] Preenchendo campo ${matchingInput.id} com "${val}"`);
        await preencherCampo(frame, matchingInput.id, val);
        await page.waitForTimeout(800);
      } else {
        // Fallback: tentar direto pelo ID no locator
        try {
          console.error(`[Captura] Tentando preencher ID direto "${key}" com "${val}"`);
          await preencherCampo(frame, key, val);
          await page.waitForTimeout(800);
        } catch (e) {
          console.error(`[Captura] Nao foi possivel localizar campo para ${key}: ${e.message}`);
        }
      }
    }

    // Clica no botao de consulta/pesquisa de forma segura (NUNCA de escrita!)
    const botaoConsulta = arvoreWidgets.botoes.find((b) =>
      /consultar|pesquisar|buscar|filtrar/i.test(b.label)
    );

    if (botaoConsulta) {
      console.error(`[Captura] Clicando no botao de consulta: ${botaoConsulta.label} (${botaoConsulta.id})`);
      const btnLoc = frame.locator(`#${botaoConsulta.id}`).first();
      await btnLoc.click();
      await page.waitForTimeout(5000);
    } else {
      // Tentar por role
      const btnRole = frame.getByRole("button", { name: /consultar|pesquisar|buscar|filtrar/i }).first();
      if (await btnRole.isVisible().catch(() => false)) {
        console.error(`[Captura] Clicando no botao de consulta por role`);
        await btnRole.click();
        await page.waitForTimeout(5000);
      } else {
        console.error(`[Captura] NENHUM botao de consulta encontrado. Nao executando clique.`);
      }
    }
  } else {
    console.error(`[Captura] --somente-abrir ativo. Nenhuma acao de preenchimento/clique executada.`);
  }

  // Prepara diretorio scratch
  const scratchDir = path.join(__dirname, "..", "scratch");
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }

  const arquivo = path.join(scratchDir, `zkau_${app}.txt`);
  const conteudo = [
    `=== ESTRUTURA DE WIDGETS (${app}) ===`,
    JSON.stringify(arvoreWidgets, null, 2),
    `\n=== POSTS CAPTURADOS (${capturas.length}) ===`,
    capturas
      .map(
        (c, i) =>
          `--- POST ${i + 1} (${c.url}) ---\n` +
          decodeURIComponent(c.body).replace(/&/g, "\n&")
      )
      .join("\n\n"),
  ].join("\n\n");

  fs.writeFileSync(arquivo, conteudo, "utf8");
  console.error(`[Captura] Gravado com sucesso em: ${arquivo}`);
}

main()
  .catch((e) => {
    console.error("ERRO na captura:", e.message);
    process.exitCode = 1;
  })
  .finally(() => closeSession());
