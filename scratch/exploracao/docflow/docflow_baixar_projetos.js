"use strict";

/**
 * Pipeline de Download de Anexos do GED e Geração de Relatórios Markdown (.md)
 * para Projetos Aprovados de Anápolis (Planilha AVTO E-SEP Finalizados)
 */

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://www.saneago.com.br";
const DEFAULT_MUNICIPIO = process.env.MUNICIPIO || "anapolis";
const DEFAULT_LIST_PATH = path.join(__dirname, "scratch", `projetos_${DEFAULT_MUNICIPIO}_filtrados.json`);
const DOWNLOADS_BASE_DIR = path.join(__dirname, "downloads_anexos");

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

function sanitizarNomePasta(str) {
  return (str || "").replace(/[/\\?%*:|"<>]/g, "_").trim();
}

function gerarRelatorioMarkdown(projetoExcel, dadosDocflow, anexosBaixados, errosProcessamento) {
  const processoNum = projetoExcel["Nº PROCESSO"] || dadosDocflow.numeroProcesso || "NÃO_INFORMADO";
  const empreendimento = projetoExcel["NOME DO EMPREENDIMENTO"] || "EMPREENDIMENTO";
  const sistema = projetoExcel["SISTEMA"] || "NÃO INFORMADO";
  const avto = projetoExcel["Nº AVTO"] || "-";
  const municipio = projetoExcel["MUNICÍPIO"] || "ANÁPOLIS";
  const dataLiberacao = projetoExcel["DATA DA LIBERAÇÃO"] || "-";
  const validade = projetoExcel["DATA DE VALIDADE"] || "-";
  const revalidado = projetoExcel["PROJETO FOI REVALIDADO?"] || "N";
  const projetoValido = projetoExcel["Projeto Válido?"] || "-";
  const arts = projetoExcel["Nº ART'S / RRT'S"] || "-";
  const comentarios = projetoExcel["Últimos Comentários"] || "-";

  let md = `# PROJETO APROVADO: ${empreendimento}\n\n`;

  md += `## 📌 1. Identificação Geral do Empreendimento\n\n`;
  md += `| Campo | Valor |\n`;
  md += `|---|---|\n`;
  md += `| **Município** | ${municipio} |\n`;
  md += `| **Empreendimento** | **${empreendimento}** |\n`;
  md += `| **Sistema** | **${sistema}** |\n`;
  md += `| **Nº AVTO** | ${avto} |\n`;
  md += `| **Nº Processo DocFlow** | \`${processoNum}\` |\n`;
  md += `| **Data de Liberação** | ${dataLiberacao} |\n`;
  md += `| **Data de Validade** | ${validade} |\n`;
  md += `| **Status de Validade** | **${projetoValido}** |\n`;
  md += `| **Projeto Revalidado?** | ${revalidado} |\n`;
  md += `| **Nº ART's / RRT's** | ${arts} |\n\n`;

  if (comentarios && comentarios !== "-") {
    md += `### 💬 Comentários / Ofício de Liberação\n`;
    md += `\`\`\`text\n${comentarios}\n\`\`\`\n\n`;
  }

  md += `## 🏛️ 2. Dados Oficiais no DocFlow (Saneago)\n\n`;
  if (Object.keys(dadosDocflow).length > 0) {
    md += `| Metadado do DocFlow | Detalhe |\n`;
    md += `|---|---|\n`;
    for (const [k, v] of Object.entries(dadosDocflow)) {
      md += `| **${k}** | ${v} |\n`;
    }
    md += `\n`;
  } else {
    md += `*Nenhum metadado adicional capturado diretamente na tela do DocFlow.*\n\n`;
  }

  md += `## 📦 3. Arquivos Anexos Baixados do GED\n\n`;
  if (anexosBaixados && anexosBaixados.length > 0) {
    md += `Total de arquivos baixados: **${anexosBaixados.length}**\n\n`;
    md += `| Seq | Arquivo | Tamanho | Data do Anexo | Descrição / Pasta |\n`;
    md += `|---|---|---|---|---|\n`;
    for (const anexo of anexosBaixados) {
      md += `| ${anexo.sequencial || "-"} | [${anexo.nomeArquivo}](./${encodeURIComponent(anexo.nomeArquivo)}) | ${anexo.tamanhoMB} MB | ${anexo.dataAnexo || "-"} | ${anexo.descricao || anexo.pasta || "-"} |\n`;
    }
    md += `\n`;
  } else {
    md += `⚠️ *Nenhum arquivo anexado encontrado na seção 'Anexo(s)' do GED deste processo.*\n\n`;
  }

  if (errosProcessamento && errosProcessamento.length > 0) {
    md += `## ⚠️ Ocorrências / Erros no Download\n\n`;
    for (const err of errosProcessamento) {
      md += `- ${JSON.stringify(err)}\n`;
    }
    md += `\n`;
  }

  md += `---\n`;
  md += `*Relatório gerado automaticamente em ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}.*\n`;

  return md;
}

async function processarLoteProjetos(listaProjetos, options = {}) {
  const startIndex = options.startIndex || 0;
  const maxProjetos = options.limit || listaProjetos.length;
  const lista = listaProjetos.slice(startIndex, startIndex + maxProjetos);

  console.log("==================================================================");
  console.log(`🚀 INICIANDO PROCESSAMENTO DE ${lista.length} PROJETOS (ANÁPOLIS)`);
  console.log(`Faixa: Índice ${startIndex + 1} até ${startIndex + lista.length} de ${listaProjetos.length}`);
  console.log("==================================================================");

  const browser = await chromium.launch({ headless: options.headless !== false });
  const context = await browser.newContext({
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    ignoreHTTPSErrors: true,
    acceptDownloads: true
  });
  const page = await context.newPage();

  // 1. Login no Portal Saneago
  console.log("\n1. Autenticando no Portal Saneago...");
  await page.goto(`${BASE_URL}/prt/`, { waitUntil: "networkidle" });
  await page.locator("input[type='text']").first().fill(CREDENTIALS.usuario);
  await page.locator("input[type='password']").first().fill(CREDENTIALS.senha);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle" }),
    page.locator("input[type='password']").first().press("Enter")
  ]);
  console.log("✅ Login no Portal realizado com sucesso!");

  // 2. SSO DocFlow
  console.log("2. Inicializando sessão SSO no DocFlow via /prt/GerenciadorDocumento.jsp...");
  await page.goto(`${BASE_URL}/prt/GerenciadorDocumento.jsp`, { waitUntil: "networkidle" });

  const resultadosGerais = [];

  for (let idx = 0; idx < lista.length; idx++) {
    const item = lista[idx];
    const processoNum = (item["Nº PROCESSO"] || "").trim();
    const empNome = item["NOME DO EMPREENDIMENTO"] || "PROJETO";
    const sistema = item["SISTEMA"] || "";
    const pastaNomeProjeto = sanitizarNomePasta(`PROJETO_${processoNum.replace(/[/]/g, "_")}_${sistema}_${empNome}`);
    const downloadDir = path.join(DOWNLOADS_BASE_DIR, pastaNomeProjeto);

    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }

    console.log(`\n==================================================================`);
    console.log(`[${idx + 1}/${lista.length}] PROCESSO: ${processoNum} | ${empNome} (${sistema})`);
    console.log(`📁 Destino: ${downloadDir}`);
    console.log(`==================================================================`);

    const baixados = [];
    const erros = [];
    const dadosDocflow = {};

    try {
      // Navegar para a tela de Pesquisar Processos
      console.log("   Navegando para o menu de Pesquisa de Processos...");
      const menuProcessos = page.locator(".rf-ddm-lbl:has-text('Processos')").first();
      await menuProcessos.waitFor({ state: "visible", timeout: 15000 });
      await menuProcessos.click();
      await page.waitForTimeout(400);

      const itemPesquisar = page.locator(".rf-ddm-itm:has-text('Pesquisar')").first();
      await itemPesquisar.waitFor({ state: "visible", timeout: 10000 });

      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle" }).catch(() => {}),
        itemPesquisar.click()
      ]);
      await page.waitForTimeout(1000);

      // Preencher formulário de filtro
      console.log(`   Pesquisando filtro: ${processoNum}...`);
      const inputProc = page.locator("#numeroProcFiltroProcesso").first();
      await inputProc.waitFor({ state: "visible", timeout: 15000 });
      await inputProc.click();
      await inputProc.fill(processoNum);
      await inputProc.dispatchEvent("change");
      await inputProc.dispatchEvent("blur");
      await page.waitForTimeout(400);

      // Clicar em Pesquisar (#btnListar)
      await page.evaluate(() => {
        const btn = document.getElementById("btnListar");
        if (btn) btn.click();
      });
      await page.waitForTimeout(3500);

      // Clicar no processo encontrado na tabela #lista
      const linkProc = page.locator(`table#lista a:has-text("${processoNum}")`).first();
      if (await linkProc.count() === 0) {
        console.warn(`   ⚠️ Processo ${processoNum} não encontrado na listagem de resultados.`);
        erros.push({ erro: `Processo ${processoNum} não encontrado no DocFlow.` });
      } else {
        console.log("   Abrindo detalhes do processo...");
        await Promise.all([
          page.waitForNavigation({ waitUntil: "networkidle" }),
          linkProc.click()
        ]);
        await page.waitForTimeout(2000);

        // Extrair metadados gerais do processo (limpando ruídos de inputs e scripts)
        const camposExtraidos = await page.evaluate(() => {
          const res = {};
          const rows = document.querySelectorAll("td.colunaum");
          const ignorarChaves = [
            "Observações", "Publicar Agora", "Tipo:* Campo Obrigatório",
            "Informe o assunto do Termo", "Informe o Tipo de Processo",
            "Mensagem", "limitTextArea"
          ];

          rows.forEach(td => {
            const valTd = td.nextElementSibling;
            if (valTd && valTd.classList.contains("colunadois")) {
              const k = td.textContent.replace(/:$/, "").trim();
              let v = valTd.textContent.trim();
              if (k && v && !v.includes("RichFaces") && !v.includes("function") && !v.includes("limitTextArea") && !res[k]) {
                const deveIgnorar = ignorarChaves.some(ign => k.toLowerCase().includes(ign.toLowerCase()));
                if (!deveIgnorar) {
                  res[k] = v.replace(/\s+/g, " ");
                }
              }
            }
          });
          return res;
        });
        Object.assign(dadosDocflow, camposExtraidos);

        // Verificar seção de Anexos
        const painelAnexos = page.locator("#richPanelAnexos_body, #gridPastas, #anexos");
        if (await painelAnexos.count() === 0) {
          console.log("   ℹ️ Seção Anexo(s) não encontrada neste processo.");
        } else {
          const pastasLocators = page.locator("#gridPastas td.pastaColuna");
          const countPastas = await pastasLocators.count();
          console.log(`   📂 Total de pastas de anexo encontradas: ${countPastas}`);

          const pastasProcessadas = new Set();

          for (let pIdx = 0; pIdx < Math.max(1, countPastas); pIdx++) {
            let pastaNome = "";
            if (countPastas > 0) {
              const pastaEl = pastasLocators.nth(pIdx);
              pastaNome = (await pastaEl.innerText()).trim().replace(/\n/g, " ");

              if (pastaNome && pastasProcessadas.has(pastaNome)) continue;
              if (pastaNome) pastasProcessadas.add(pastaNome);

              console.log(`\n   📁 [Pasta ${pIdx + 1}/${countPastas}]: "${pastaNome || 'Raiz'}"`);

              const linkPasta = pastaEl.locator("a").first();
              if (await linkPasta.count() > 0 && pIdx > 0) {
                await linkPasta.click();
                await page.waitForTimeout(2000);
              }
            }

            // Ler tabela #anexos
            const linhasArquivos = page.locator("#anexos tbody tr.rf-dt-r");
            const countArquivos = await linhasArquivos.count();
            console.log(`      📄 Arquivos listados na pasta: ${countArquivos}`);

            for (let fIdx = 0; fIdx < countArquivos; fIdx++) {
              const linha = linhasArquivos.nth(fIdx);
              const colunas = linha.locator("td");

              const seq = (await colunas.nth(1).innerText()).trim();
              const nomeArquivo = (await colunas.nth(2).innerText()).trim();
              const dataAnexo = (await colunas.nth(3).innerText()).trim();
              const descricao = (await colunas.nth(4).innerText()).trim();

              console.log(`      ⬇️ [${fIdx + 1}/${countArquivos}] Baixando: ${nomeArquivo} (Seq: ${seq}, Data: ${dataAnexo})...`);

              const downloadPromise = page.waitForEvent("download", { timeout: 60000 }).catch(() => null);
              const linkDownload = colunas.nth(2).locator("a").first();
              await linkDownload.click({ force: true });

              const download = await downloadPromise;

              if (download) {
                let suggestedName = download.suggestedFilename();
                if (!suggestedName || suggestedName === "AVENIDA_" || !suggestedName.includes(".")) {
                  if (nomeArquivo && nomeArquivo.includes(".")) {
                    suggestedName = nomeArquivo;
                  } else if (suggestedName && !suggestedName.includes(".")) {
                    suggestedName = `${suggestedName}.zip`;
                  }
                }
                const sanitizedFilename = sanitizarNomePasta(suggestedName);
                const filePath = path.join(downloadDir, sanitizedFilename);
                await download.saveAs(filePath);
                const stat = fs.statSync(filePath);
                const sizeMB = (stat.size / (1024 * 1024)).toFixed(2);
                console.log(`         ✅ Download concluído: ${sanitizedFilename} (${sizeMB} MB)`);

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
                console.error(`         ❌ Falha ao capturar download: ${nomeArquivo}`);
                erros.push({ pasta: pastaNome, nomeArquivo, erro: "Timeout no evento de download" });
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(`   ❌ Erro ao processar processo ${processoNum}:`, err.message);
      erros.push({ erroGeral: err.message });
    }

    // Gerar arquivo .md e JSON de manifesto para este projeto
    const mdContent = gerarRelatorioMarkdown(item, dadosDocflow, baixados, erros);
    const mdFileName = sanitizarNomePasta(`RELATORIO_${processoNum.replace(/[/]/g, "_")}_${sistema}_${empNome}.md`);
    const mdFilePath = path.join(downloadDir, mdFileName);
    fs.writeFileSync(mdFilePath, mdContent, "utf-8");

    const manifestPath = path.join(downloadDir, "manifesto_projeto.json");
    fs.writeFileSync(manifestPath, JSON.stringify({
      projetoExcel: item,
      dadosDocflow,
      dataProcessamento: new Date().toISOString(),
      totalAnexosBaixados: baixados.length,
      anexosBaixados: baixados,
      erros
    }, null, 2));

    console.log(`   📝 Relatório Markdown gerado: ${mdFilePath}`);
    console.log(`   📊 Resumo: ${baixados.length} anexo(s) baixado(s), ${erros.length} erro(s).`);

    resultadosGerais.push({
      processo: processoNum,
      empreendimento: empNome,
      sistema,
      downloadDir,
      relatorioMd: mdFilePath,
      totalBaixados: baixados.length,
      erros: erros.length
    });
  }

  await browser.close();

  console.log("\n==================================================================");
  console.log(`🏁 FINALIZADO PROCESSAMENTO DO LOTE DE PROJETOS!`);
  console.log(`Total de Projetos Processados: ${resultadosGerais.length}`);
  console.log("==================================================================");

  return resultadosGerais;
}

if (require.main === module) {
  const listFile = process.argv[2] || DEFAULT_LIST_PATH;
  const start = parseInt(process.argv[3] || "0", 10);
  const limit = parseInt(process.argv[4] || "95", 10);

  const lista = JSON.parse(fs.readFileSync(listFile, "utf-8"));
  processarLoteProjetos(lista, { startIndex: start, limit, headless: true }).catch(console.error);
}

module.exports = { processarLoteProjetos, gerarRelatorioMarkdown };
