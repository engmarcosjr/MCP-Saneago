"use strict";

/**
 * Script de Download Automatizado de Anexos do DocFlow (Saneago)
 *
 * Focado especificamente na seção "Anexo(s)" (GED) de processos.
 */

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://www.saneago.com.br";
const DEFAULT_PROCESSO = process.argv[2] || "3764/2023";

let credsFromFile = {};
try {
  const credPath = path.join(__dirname, "config", "credentials.json");
  if (fs.existsSync(credPath)) {
    credsFromFile = JSON.parse(fs.readFileSync(credPath, "utf-8"));
  }
} catch (e) {}

const CREDENTIALS = {
  usuario: process.env.SANEAGO_USER || credsFromFile.usuario || "m175374",
  senha: process.env.SANEAGO_PASS || credsFromFile.senha || "MJr@@7527"
};

async function baixarAnexosProcesso(processoNum, options = {}) {
  const downloadDir = options.downloadDir || path.join(__dirname, "downloads_anexos", processoNum.replace(/[^a-zA-Z0-9]/g, "_"));
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
  }

  console.log("==================================================================");
  console.log(`📥 INICIANDO DOWNLOAD DE ANEXO(S) DO PROCESSO: ${processoNum}`);
  console.log(`📁 Diretório de destino: ${downloadDir}`);
  console.log("==================================================================");

  const browser = await chromium.launch({ headless: options.headless !== false });
  const context = await browser.newContext({
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    ignoreHTTPSErrors: true,
    acceptDownloads: true
  });
  const page = await context.newPage();

  const baixados = [];
  const erros = [];

  try {
    // 1. Login no Portal
    console.log("\n1. Autenticando no Portal Saneago...");
    await page.goto(`${BASE_URL}/prt/`, { waitUntil: "networkidle" });
    await page.locator("input[type='text']").first().fill(CREDENTIALS.usuario);
    await page.locator("input[type='password']").first().fill(CREDENTIALS.senha);
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle" }),
      page.locator("input[type='password']").first().press("Enter")
    ]);
    console.log("✅ Login no Portal realizado!");

    // 2. SSO DocFlow
    console.log("2. Inicializando sessão SSO no DocFlow...");
    await page.goto(`${BASE_URL}/prt/GerenciadorDocumento.jsp`, { waitUntil: "networkidle" });

    // 3. Abrir menu de pesquisa de processos
    console.log("3. Abrindo menu de pesquisa de processos via DashBoard...");
    const menuProcessos = page.locator(".rf-ddm-lbl:has-text('Processos')").first();
    await menuProcessos.waitFor({ state: "visible", timeout: 15000 });
    await menuProcessos.click();
    await page.waitForTimeout(500);

    const itemPesquisar = page.locator(".rf-ddm-itm:has-text('Pesquisar')").first();
    await itemPesquisar.waitFor({ state: "visible", timeout: 10000 });

    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle" }).catch(() => {}),
      itemPesquisar.click()
    ]);
    await page.waitForTimeout(1500);
    console.log(`📍 Tela carregada: ${page.url()}`);

    // 4. Preencher formulário de filtro
    console.log(`4. Pesquisando processo: ${processoNum}...`);
    const inputProc = page.locator("#numeroProcFiltroProcesso").first();
    await inputProc.waitFor({ state: "visible", timeout: 15000 });
    await inputProc.click();
    await inputProc.fill(processoNum);
    await inputProc.dispatchEvent("change");
    await inputProc.dispatchEvent("blur");
    await page.waitForTimeout(500);

    // Clicar em Pesquisar (#btnListar) e aguardar Ajax
    await page.evaluate(() => {
      document.getElementById("btnListar").click();
    });
    await page.waitForTimeout(4000);

    // 5. Clicar no processo encontrado na tabela #lista
    console.log("5. Localizando processo na tabela de resultados...");
    const linkProc = page.locator(`table#lista a:has-text("${processoNum}")`).first();
    if (await linkProc.count() === 0) {
      throw new Error(`Processo ${processoNum} não encontrado na listagem de resultados.`);
    }

    console.log("   Abrindo detalhes do processo...");
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle" }),
      linkProc.click()
    ]);
    await page.waitForTimeout(2500);
    console.log(`📍 Detalhes do processo carregados: ${page.url()}`);

    // 6. Localizar a seção "Anexo(s)"
    console.log("6. Verificando seção 'Anexo(s)'...");
    const painelAnexos = page.locator("#richPanelAnexos_body, #gridPastas, #anexos");
    if (await painelAnexos.count() === 0) {
      console.log("⚠️ Seção Anexo(s) não encontrada ou processo sem anexos.");
      return { processo: processoNum, anexosBaixados: [], total: 0 };
    }

    // 7. Mapear todas as pastas de anexos
    const pastasLocators = page.locator("#gridPastas td.pastaColuna");
    const countPastas = await pastasLocators.count();
    console.log(`📂 Total de pasta(s) de anexo encontrada(s): ${countPastas}`);

    if (countPastas === 0) {
      console.log("ℹ️ Nenhuma pasta de anexo encontrada no processo.");
      return { processo: processoNum, anexosBaixados: [], total: 0 };
    }

    for (let pIdx = 0; pIdx < countPastas; pIdx++) {
      const pastaEl = pastasLocators.nth(pIdx);
      const pastaNome = (await pastaEl.innerText()).trim().replace(/\n/g, " ");
      console.log(`\n📁 [Pasta ${pIdx + 1}/${countPastas}]: "${pastaNome}"`);

      // Clicar na pasta para carregar os arquivos correspondentes (se for diferente da atual)
      const linkPasta = pastaEl.locator("a").first();
      if (await linkPasta.count() > 0 && pIdx > 0) {
        await linkPasta.click();
        await page.waitForTimeout(2500);
      }

      // 8. Ler a tabela de arquivos da pasta selecionada (#anexos)
      const linhasArquivos = page.locator("#anexos tbody tr.rf-dt-r");
      const countArquivos = await linhasArquivos.count();
      console.log(`   📄 Arquivo(s) listado(s) na pasta: ${countArquivos}`);

      for (let fIdx = 0; fIdx < countArquivos; fIdx++) {
        const linha = linhasArquivos.nth(fIdx);
        const colunas = linha.locator("td");

        const seq = (await colunas.nth(1).innerText()).trim();
        const nomeArquivo = (await colunas.nth(2).innerText()).trim();
        const dataAnexo = (await colunas.nth(3).innerText()).trim();
        const descricao = (await colunas.nth(4).innerText()).trim();

        console.log(`\n   ⬇️ [Arquivo ${fIdx + 1}/${countArquivos}] ${nomeArquivo} (Seq: ${seq}, Data: ${dataAnexo})...`);

        // Preparar captura do download (podendo vir via popup ou evento de download)
        const downloadPromise = page.waitForEvent("download", { timeout: 60000 }).catch(err => {
          return null;
        });

        // O link de download é o da coluna nome ou da linha
        const linkDownload = colunas.nth(2).locator("a").first();
        await linkDownload.click({ force: true });

        const download = await downloadPromise;

        if (download) {
          let suggestedName = download.suggestedFilename();
          if (!suggestedName || suggestedName === "AVENIDA_" || !suggestedName.includes(".")) {
            // Preservar o nome do arquivo da interface se o nome sugerido vier truncado pelo header Content-Disposition
            if (nomeArquivo && nomeArquivo.includes(".")) {
              suggestedName = nomeArquivo;
            } else if (suggestedName && !suggestedName.includes(".")) {
              suggestedName = `${suggestedName}.zip`;
            }
          }
          // Sanitizar nome do arquivo
          const sanitizedFilename = suggestedName.replace(/[/\\?%*:|"<>]/g, "_");
          const filePath = path.join(downloadDir, sanitizedFilename);
          await download.saveAs(filePath);
          const stat = fs.statSync(filePath);
          const sizeMB = (stat.size / (1024 * 1024)).toFixed(2);
          console.log(`      ✅ DOWNLOAD CONCLUÍDO COM SUCESSO!`);
          console.log(`      📁 Salvo em: ${filePath}`);
          console.log(`      📊 Tamanho: ${sizeMB} MB (${stat.size} bytes)`);

          baixados.push({
            pasta: pastaNome,
            sequencial: seq,
            nomeArquivo: sanitizedFilename,
            dataAnexo,
            descricao,
            caminhoLocal: filePath,
            tamanhoBytes: stat.size,
            tamanhoMB: sizeMB
          });
        } else {
          console.error(`      ❌ Falha ao capturar download do arquivo: ${nomeArquivo}`);
          erros.push({ pasta: pastaNome, nomeArquivo, erro: "Timeout no evento de download" });
        }
      }
    }

  } catch (err) {
    console.error(`❌ Erro no processamento do processo ${processoNum}:`, err.message);
    erros.push({ erroGeral: err.message });
  } finally {
    await browser.close();
  }

  const manifestPath = path.join(downloadDir, "anexos_manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify({
    processo: processoNum,
    dataExecucao: new Date().toISOString(),
    totalBaixados: baixados.length,
    baixados,
    erros
  }, null, 2));

  console.log("\n==================================================================");
  console.log(`🏁 FINALIZADO PROCESSO ${processoNum}`);
  console.log(`Total baixados: ${baixados.length} arquivo(s)`);
  console.log(`Total erros: ${erros.length}`);
  console.log(`Manifesto salvo em: ${manifestPath}`);
  console.log("==================================================================");

  return { processo: processoNum, downloadDir, baixados, erros };
}

async function baixarAnexosEmMassa(listaProcessos, options = {}) {
  console.log(`🚀 Iniciando download em lote para ${listaProcessos.length} processos...`);
  const resultados = [];
  for (let i = 0; i < listaProcessos.length; i++) {
    const proc = listaProcessos[i];
    console.log(`\n[${i + 1}/${listaProcessos.length}] Processando ${proc}...`);
    const res = await baixarAnexosProcesso(proc, options);
    resultados.push(res);
  }
  return resultados;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    baixarAnexosProcesso(DEFAULT_PROCESSO).catch(console.error);
  } else if (args[0].includes(".txt") || args[0].includes(".json")) {
    const content = fs.readFileSync(args[0], "utf-8");
    let lista = [];
    if (args[0].endsWith(".json")) {
      lista = JSON.parse(content);
    } else {
      lista = content.split("\n").map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith("#"));
    }
    baixarAnexosEmMassa(lista).catch(console.error);
  } else {
    if (args.length === 1) {
      baixarAnexosProcesso(args[0]).catch(console.error);
    } else {
      baixarAnexosEmMassa(args).catch(console.error);
    }
  }
}

module.exports = { baixarAnexosProcesso, baixarAnexosEmMassa };
