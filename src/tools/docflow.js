"use strict";

const fs = require("fs");
const path = require("path");
const { parseProcessoData, consultarProcesso } = require("../../scratch/exploracao/docflow/docflow_consultar_processo");

const ROOT_DIR = process.env.DOCFLOW_DATA_DIR || path.join(__dirname, "..", "..");

/**
 * Consulta um processo individual no DocFlow por número (ex: "14652/2026" ou id: 14652, ano: 2026).
 * Verifica primeiro o repositório local de dados (data_processos_YYYY/); se não encontrar, tenta buscar online.
 */
async function consultarProcessoDocflow({ processo, ano }) {
  let processoNum = String(processo || "").trim();
  let anoTarget = ano ? String(ano).trim() : "";

  if (processoNum.includes("/")) {
    const parts = processoNum.split("/");
    processoNum = parts[0].trim();
    anoTarget = parts[1].trim();
  }

  if (!processoNum || !anoTarget) {
    throw new Error("Informe o número do processo e o ano (ex: '14652/2026' ou processo: '14652', ano: '2026').");
  }

  const idLimpo = processoNum.replace(/[^0-9]/g, "");
  const anoLimpo = anoTarget.replace(/[^0-9]/g, "");
  const numFormatado = `${idLimpo}/${anoLimpo}`;

  const localFile = path.join(ROOT_DIR, `data_processos_${anoLimpo}`, `processo_${idLimpo}_${anoLimpo}.json`);

  if (fs.existsSync(localFile)) {
    try {
      const content = JSON.parse(fs.readFileSync(localFile, "utf-8"));
      return {
        sucesso: true,
        origem: "cache_local",
        arquivo: localFile,
        dados: content
      };
    } catch (e) {
      // Falha ao ler cache, tenta via rede
    }
  }

  if (process.env.DOCFLOW_OFFLINE === "1") {
    return {
      sucesso: false,
      origem: "falha_online",
      mensagem: `Processo ${numFormatado} não encontrado no cache local e a consulta online foi bloqueada por DOCFLOW_OFFLINE=1.`,
      cacheLocalVerificado: localFile
    };
  }

  try {
    const resultadoRede = await consultarProcesso(numFormatado);
    return {
      sucesso: true,
      origem: "requisicao_http",
      dados: resultadoRede
    };
  } catch (err) {
    return {
      sucesso: false,
      origem: "falha_online",
      mensagem: `Processo ${numFormatado} não encontrado no cache local e a consulta online retornou erro: ${err.message}`,
      cacheLocalVerificado: localFile
    };
  }
}

/**
 * Pesquisa processos no repositório local (data_processos_YYYY) por termo, interessado ou assunto.
 */
async function pesquisarProcessosDocflowLocal({ termo, interessado, assunto, ano, limite = 15 }) {
  const termoNorm = (termo || "").toLowerCase().trim();
  const interessadoNorm = (interessado || "").toLowerCase().trim();
  const assuntoNorm = (assunto || "").toLowerCase().trim();
  const anoNorm = ano ? String(ano).trim() : null;

  if (!termoNorm && !interessadoNorm && !assuntoNorm && !anoNorm) {
    throw new Error("Informe ao menos um critério de pesquisa: termo, interessado, assunto ou ano.");
  }

  const resultados = [];

  let pastasAnos = [];
  if (anoNorm) {
    pastasAnos = [`data_processos_${anoNorm}`];
  } else {
    pastasAnos = fs.readdirSync(ROOT_DIR).filter(f => f.startsWith("data_processos_"));
  }

  for (const pasta of pastasAnos) {
    const pastaPath = path.join(ROOT_DIR, pasta);
    if (!fs.existsSync(pastaPath) || !fs.statSync(pastaPath).isDirectory()) continue;

    const arquivos = fs.readdirSync(pastaPath).filter(f => f.endsWith(".json"));

    for (const arq of arquivos) {
      const filePath = path.join(pastaPath, arq);
      try {
        const item = JSON.parse(fs.readFileSync(filePath, "utf-8"));

        const inter = str(item.interessado);
        const assun = str(item.assunto);
        const obs = str(item.observacoes);
        const num = str(item.processoConsultado || item.numero);

        let match = true;

        if (interessadoNorm && !inter.includes(interessadoNorm)) match = false;
        if (assuntoNorm && !assun.includes(assuntoNorm)) match = false;
        if (termoNorm) {
          const matchTermo = inter.includes(termoNorm) || assun.includes(termoNorm) || obs.includes(termoNorm) || num.includes(termoNorm);
          if (!matchTermo) match = false;
        }

        if (match && (item.numero || item.interessado || item.assunto || (item.dadosConteudo && Object.keys(item.dadosConteudo).length > 0))) {
          resultados.push({
            processo: item.processoConsultado || num,
            interessado: item.interessado,
            assunto: item.assunto,
            tipo: item.tipo,
            dataProcesso: item.dataProcesso || item.dataCriacao,
            localizacaoAtual: item.localizacaoAtual,
            restrito: item.restrito,
            arquivo: filePath
          });

          if (resultados.length >= limite * 3) break;
        }
      } catch (e) {
        // ignora erro de parse individual
      }
    }
  }

  const totalEncontrado = resultados.length;
  const exibidos = resultados.slice(0, limite);

  return {
    sucesso: true,
    parametros: { termo, interessado, assunto, ano, limite },
    totalEncontrado,
    registros: exibidos
  };
}

function str(v) {
  return String(v || "").toLowerCase().trim();
}



/**
 * Lista as pastas e arquivos (metadados) da aba de anexos do GED de um processo.
 * ATENÇÃO: Acessa a rede para consultar o portal DocFlow Saneago.
 * É uma operação "read-only", não salva arquivos em disco durante a operação normal.
 */
async function listarAnexosDocflow({ processo, ano, htmlMock = null }) {
  let processoNum = String(processo || "").trim();
  let anoTarget = ano ? String(ano).trim() : "";
  if (processoNum.includes("/")) {
    const parts = processoNum.split("/");
    processoNum = parts[0].trim();
    anoTarget = parts[1].trim();
  }
  if (!processoNum || !anoTarget) {
    throw new Error("Informe o número do processo e o ano.");
  }
  const idLimpo = processoNum.replace(/[^0-9]/g, "");
  const anoLimpo = anoTarget.replace(/[^0-9]/g, "");
  const numFormatado = `${idLimpo}/${anoLimpo}`;

  if (process.env.DOCFLOW_OFFLINE === "1" && !htmlMock) {
    return {
      sucesso: false,
      mensagem: `A listagem de anexos requer rede e foi bloqueada por DOCFLOW_OFFLINE=1 (Processo ${numFormatado}).`
    };
  }

  // Obter credenciais (Variável de ambiente -> config/credentials.json -> Erro)
  let user = process.env.SANEAGO_USER;
  let pass = process.env.SANEAGO_PASS;
  
  if (!user || !pass) {
    const credPath = path.join(ROOT_DIR, "config", "credentials.json");
    if (fs.existsSync(credPath)) {
      const creds = JSON.parse(fs.readFileSync(credPath, "utf-8"));
      if (creds.usuario) user = creds.usuario;
      if (creds.senha) pass = creds.senha;
    }
  }

  if ((!user || !pass) && !htmlMock) {
    throw new Error("Credenciais Saneago não encontradas. Configure as variáveis de ambiente SANEAGO_USER e SANEAGO_PASS ou crie o arquivo config/credentials.json no padrão: { \"usuario\": \"SuaMatricula\", \"senha\": \"SuaSenha\" }");
  }

  const { chromium } = require("playwright");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    if (htmlMock) {
      await page.setContent(htmlMock);
    } else {
      await page.goto("https://www.saneago.com.br/docflow/xhtml/docflow/protocolo/consultarProtocolo.jsf", { waitUntil: "networkidle" });
      
      if (await page.locator("input[name='formLogin:login']").count() > 0) {
        await page.fill("input[name='formLogin:login']", user);
        await page.fill("input[name='formLogin:senha']", pass);
        await Promise.all([
          page.waitForNavigation({ waitUntil: "networkidle" }),
          page.click("input[name='formLogin:btnEntrar']")
        ]);
      }
      
      // Pesquisar
      await page.goto("https://www.saneago.com.br/docflow/xhtml/docflow/protocolo/consultarProtocolo.jsf", { waitUntil: "networkidle" });
      await page.fill("input[name='formFiltro:j_idt91']", idLimpo);
      await page.evaluate((num) => {
        const inputs = Array.from(document.querySelectorAll("input[type='text']"));
        if (inputs.length > 0) {
           inputs[0].value = num.split("/")[0];
           if (inputs[1]) inputs[1].value = num.split("/")[1];
        }
      }, numFormatado);
      
      await page.evaluate(() => {
        const btn = document.getElementById("btnListar") || document.querySelector("input[value='Pesquisar']") || document.querySelector("input[value='Consultar']");
        if (btn) btn.click();
      });
      
      await page.waitForTimeout(3000);

      const linkProc = page.locator(`table#lista a:has-text("${numFormatado}")`).first();
      if (await linkProc.count() === 0) {
        await browser.close();
        return { sucesso: false, mensagem: `Processo ${numFormatado} não encontrado.` };
      }

      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle" }),
        linkProc.click()
      ]);
      await page.waitForTimeout(2000);
    }

    const pastas = [];
    const painelAnexos = page.locator("#richPanelAnexos_body, #gridPastas, #anexos");
    if (await painelAnexos.count() === 0) {
      await browser.close();
      return { sucesso: true, processo: numFormatado, pastas: [], mensagem: "Seção Anexo(s) não encontrada ou processo sem anexos GED." };
    }

    const pastasLocators = page.locator("#gridPastas td.pastaColuna");
    const countPastas = await pastasLocators.count();
    const pastasProcessadas = new Set();

    for (let pIdx = 0; pIdx < Math.max(1, countPastas); pIdx++) {
      let pastaNome = "Raiz";
      if (countPastas > 0) {
        const pastaEl = pastasLocators.nth(pIdx);
        pastaNome = (await pastaEl.innerText()).trim().replace(/\n/g, " ");
        if (pastaNome && pastasProcessadas.has(pastaNome)) continue;
        if (pastaNome) pastasProcessadas.add(pastaNome);

        const linkPasta = pastaEl.locator("a").first();
        if (await linkPasta.count() > 0 && pIdx > 0) {
          await linkPasta.click();
          await page.waitForTimeout(2000);
        }
      }

      const arquivos = [];
      const linhasArquivos = page.locator("#anexos tbody tr.rf-dt-r");
      const countArquivos = await linhasArquivos.count();

      for (let fIdx = 0; fIdx < countArquivos; fIdx++) {
        const linha = linhasArquivos.nth(fIdx);
        const colunas = linha.locator("td");
        if (await colunas.count() < 6) continue;

        const sequencial = (await colunas.nth(1).innerText()).trim();
        const nome = (await colunas.nth(2).innerText()).trim();
        const data = (await colunas.nth(3).innerText()).trim();
        const descricao = (await colunas.nth(4).innerText()).trim();

        // Extrair tamanho do tooltip em 'Detalhes' (coluna 5, 0-indexed)
        const tamanho = await linha.evaluate((tr) => {
          const tdDetalhes = tr.querySelector("td:nth-child(6)");
          if (!tdDetalhes) return "Desconhecido";
          const spans = Array.from(tdDetalhes.querySelectorAll("span"));
          const tamanhoSpan = spans.find(s => s.textContent.trim() === "Tamanho:");
          if (tamanhoSpan) {
             const row = tamanhoSpan.closest("tr");
             if (row) {
                const valTd = row.querySelector("td:nth-child(2)");
                if (valTd) return valTd.textContent.trim();
             }
          }
          return "Desconhecido";
        });

        arquivos.push({
          sequencial,
          nome,
          data,
          descricao,
          tamanho
        });
      }

      pastas.push({
        nome: pastaNome,
        totalArquivos: arquivos.length,
        arquivos
      });
    }

    await browser.close();
    return {
      sucesso: true,
      processo: numFormatado,
      totalPastas: pastas.length,
      pastas
    };

  } catch (err) {
    await browser.close().catch(() => {});
    return { sucesso: false, mensagem: `Erro ao listar anexos do processo ${numFormatado}: ${err.message}` };
  }
}

module.exports = {
  listarAnexosDocflow,
  consultarProcessoDocflow,
  pesquisarProcessosDocflowLocal
};
