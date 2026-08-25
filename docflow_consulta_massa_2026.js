"use strict";

/**
 * Consulta em Massa de Processos do DocFlow (Saneago) via HTTP Direto em Paralelo
 *
 * Suporta concorrência configurável (padrão: 20 simultâneos).
 * Uso:
 *   node docflow_consulta_massa_2026.js [inicio] [fim] [concorrencia]
 * Exemplo:
 *   node docflow_consulta_massa_2026.js 1 100 20
 */

const https = require("https");
const dns = require("dns");
const fs = require("fs");
const path = require("path");
const { URLSearchParams } = require("url");
const { parseProcessoData } = require("./docflow_consultar_processo");

const BASE_URL = "https://www.saneago.com.br";

let ANO_TARGET = "2026";
let START_ID = 1;
let END_ID = 50;
let CONCURRENCY = 20;

const arg1 = process.argv[2];
const arg2 = process.argv[3];
const arg3 = process.argv[4];
const arg4 = process.argv[5];

if (arg1 && /^\d{4}$/.test(arg1)) {
  ANO_TARGET = arg1;
  START_ID = parseInt(arg2 || "1", 10);
  END_ID = parseInt(arg3 || "50", 10);
  CONCURRENCY = parseInt(arg4 || "20", 10);
} else {
  START_ID = parseInt(arg1 || "1", 10);
  END_ID = parseInt(arg2 || "50", 10);
  CONCURRENCY = parseInt(arg3 || "20", 10);
}

let credsFromFile = {};
try {
  const credPath = path.join(__dirname, "config", "credentials.json");
  if (fs.existsSync(credPath)) {
    credsFromFile = JSON.parse(fs.readFileSync(credPath, "utf-8"));
  }
} catch (e) {}

const CREDENTIALS = {
  user: process.env.SANEAGO_USER || credsFromFile.usuario || "",
  pass: process.env.SANEAGO_PASS || credsFromFile.senha || ""
};

class SaneagoDirectHttpClient {
  constructor() {
    this.cookies = new Map();
    this.zkSid = 1;
  }

  getCookieHeader() {
    return Array.from(this.cookies.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
  }

  updateCookies(setCookieHeader) {
    if (!setCookieHeader) return;
    const cookiesList = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    for (const header of cookiesList) {
      const parts = header.split(";")[0].split("=");
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join("=").trim();
        if (value && value !== '""') {
          this.cookies.set(key, value);
        }
      }
    }
  }

  request(urlStr, options = {}) {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(urlStr, BASE_URL);

      const headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        ...options.headers
      };

      const cookieStr = this.getCookieHeader();
      if (cookieStr) {
        headers["Cookie"] = cookieStr;
      }

      const reqOptions = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.pathname + parsedUrl.search,
        method: options.method || "GET",
        headers,
        lookup: (hostname, opts, cb) => {
          const callback = typeof opts === "function" ? opts : cb;
          const optionsObj = typeof opts === "object" ? opts : {};
          if (hostname === "www.saneago.com.br") {
            if (optionsObj.all) {
              return callback(null, [{ address: "198.17.232.242", family: 4 }]);
            }
            return callback(null, "198.17.232.242", 4);
          }
          dns.lookup(hostname, opts, callback);
        },
        rejectUnauthorized: false
      };

      const req = https.request(reqOptions, (res) => {
        this.updateCookies(res.headers["set-cookie"]);

        const chunks = [];
        res.on("data", chunk => chunks.push(chunk));
        res.on("end", () => {
          const buffer = Buffer.concat(chunks);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: buffer,
            text: () => buffer.toString("utf-8"),
            url: parsedUrl.toString()
          });
        });
      });

      req.on("error", reject);

      if (options.body) {
        req.write(options.body);
      }
      req.end();
    });
  }

  zkau(dtid, events, refererUrl) {
    const body = new URLSearchParams();
    body.set("dtid", dtid);
    events.forEach((event, index) => {
      body.set(`cmd_${index}`, event.cmd);
      body.set(`uuid_${index}`, event.uuid);
      if (event.data !== undefined) body.set(`data_${index}`, JSON.stringify(event.data));
      if (event.opt !== undefined) body.set(`opt_${index}`, event.opt);
    });

    const bodyStr = body.toString();
    return this.request("/prt/zkau", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        "Referer": refererUrl,
        "zk-sid": String(this.zkSid++)
      },
      body: bodyStr
    });
  }
}

function extractRegex(str, regex, groupIndex = 1) {
  if (typeof str !== "string") return null;
  const match = str.match(regex);
  return match ? match[groupIndex] : null;
}

async function autenticarSessao(http) {
  console.log("🔐 Autenticando no Portal Saneago e obtendo sessão DocFlow...");

  const portalGet = await http.request("/prt/mpt/principal.zul");
  const portalText = portalGet.text();

  const dtid = extractRegex(portalText, /dtid="([^"]+)"/) || extractRegex(portalText, /dt:'([^']+)'/);
  const userId = extractRegex(portalText, /id:'([^']+)'.*?numeroMatricula/) || extractRegex(portalText, /id:'([^']+)'.*?value:'/);
  const passId = extractRegex(portalText, /id:'([^']+)'.*?codigoSenha/);
  const buttonId = extractRegex(portalText, /id:'([^']+)'.*?btnEntrar/);

  if (dtid && userId && passId && buttonId) {
    await http.zkau(dtid, [
      { cmd: "onChange", uuid: userId, data: { value: CREDENTIALS.user, start: CREDENTIALS.user.length } },
      { cmd: "onChange", uuid: passId, data: { value: CREDENTIALS.pass, start: CREDENTIALS.pass.length } },
      { cmd: "onClick", uuid: buttonId, data: { pageX: 0, pageY: 0, which: 1, x: 0, y: 0 } },
    ], `${BASE_URL}/prt/mpt/principal.zul`);
  }

  await http.request("/prt/GerenciadorDocumento.jsp");

  const docflowLoginGet = await http.request("/docflow/xhtml/docflow/geral/login.jsf");
  const viewState = extractRegex(docflowLoginGet.text(), /name="javax\.faces\.ViewState"\s+value="([^"]+)"/);

  const postData = new URLSearchParams();
  postData.append("j_idt58", "j_idt58");
  postData.append("userName", CREDENTIALS.user);
  postData.append("password", CREDENTIALS.pass);
  postData.append("j_idt71", "Entrar");
  postData.append("javax.faces.ViewState", viewState || "");

  await http.request("/docflow/xhtml/docflow/geral/login.jsf", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Referer": `${BASE_URL}/docflow/xhtml/docflow/geral/login.jsf`
    },
    body: postData.toString()
  });

  const telaConsulta = await http.request("/docflow/xhtml/docflow/protocolo/consultarProtocolo.jsf");
  const viewStateConsulta = extractRegex(telaConsulta.text(), /name="javax\.faces\.ViewState"\s+value="([^"]+)"/);

  console.log("✅ Autenticação concluída com sucesso!");
  return { viewStateConsulta };
}

async function consultarProcessoIndividual(http, processoNum) {
  // 1. Tentar consulta direta GET via URL
  let res = await http.request(`/docflow/xhtml/docflow/protocolo/consultarProtocolo.jsf?numeroProtocolo=${encodeURIComponent(processoNum)}`);
  let parsed = parseProcessoData(res.text());

  // 2. Se GET não preencher os dados, submeter formulário JSF POST
  if (!parsed.numero && !parsed.interessado) {
    const pageGet = await http.request("/docflow/xhtml/docflow/protocolo/consultarProtocolo.jsf");
    const viewState = extractRegex(pageGet.text(), /name="javax\.faces\.ViewState"\s+value="([^"]+)"/);

    if (viewState) {
      const postSearchData = new URLSearchParams();
      postSearchData.append("formBody", "formBody");
      postSearchData.append("tipoPesquisa", "NUMERO_PROCESSO");
      postSearchData.append("numeroProcesso", processoNum);
      postSearchData.append("tipoConsulta", "PROCESSO");
      postSearchData.append("numeroProtocolo", processoNum);
      postSearchData.append("panelFiltronumeroProcFiltro", processoNum);
      postSearchData.append("btnPesquisar", "Pesquisar");
      postSearchData.append("javax.faces.ViewState", viewState);

      res = await http.request("/docflow/xhtml/docflow/protocolo/consultarProtocolo.jsf", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Referer": `${BASE_URL}/docflow/xhtml/docflow/protocolo/consultarProtocolo.jsf`
        },
        body: postSearchData.toString()
      });

      parsed = parseProcessoData(res.text());
    }
  }

  parsed.processoConsultado = processoNum;

  const existe = !!(parsed.numero || parsed.interessado || parsed.assunto || (parsed.dadosConteudo && Object.keys(parsed.dadosConteudo).length > 0));
  if (!existe) {
    parsed.restrito = false;
  }

  return parsed;
}

async function runParallelBatch(anoTarget = ANO_TARGET, startId = START_ID, endId = END_ID, concurrency = CONCURRENCY, autoStopLimit = 50) {
  const targetYear = String(anoTarget);
  const targetStart = parseInt(startId, 10);
  const targetEnd = parseInt(endId, 10);
  const targetConcurrency = parseInt(concurrency, 10);

  console.log("==================================================================");
  console.log(`CONSULTA EM MASSA DE PROCESSOS ${targetYear} (SESSÕES ISOLADAS POR WORKER)`);
  console.log(`Faixa de Processos: ${targetStart}/${targetYear} até ${targetEnd}/${targetYear}`);
  console.log(`Concorrência Máxima: ${targetConcurrency} workers simultâneos`);
  console.log("==================================================================\n");

  const outDir = path.join(__dirname, `data_processos_${targetYear}`);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const total = targetEnd - targetStart + 1;
  let concluidos = 0;
  let comErro = 0;
  let restritosCount = 0;
  let publicosCount = 0;
  let primeiroEncontrado = false;
  let parouPorLimite = false;

  const resultadosMap = new Map();
  let maxIdVerificado = targetStart - 1;
  let nulosConsecutivos = 0;

  const queue = [];
  for (let id = targetStart; id <= targetEnd; id++) {
    queue.push(id);
  }

  const startTime = Date.now();

  async function worker(workerId) {
    const httpWorker = new SaneagoDirectHttpClient();
    let authOK = false;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await autenticarSessao(httpWorker);
        authOK = true;
        break;
      } catch (err) {
        console.error(`[Worker ${workerId}] Falha na autenticação (tentativa ${attempt}):`, err.message);
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    if (!authOK) {
      console.error(`[Worker ${workerId}] Não foi possível autenticar a sessão do worker.`);
      return;
    }

    while (queue.length > 0 && !parouPorLimite) {
      const id = queue.shift();
      if (!id) break;
      const processoNum = `${id}/${targetYear}`;

      try {
        const dados = await consultarProcessoIndividual(httpWorker, processoNum);
        if (parouPorLimite) break;

        const existe = !!(dados.numero || dados.interessado || dados.assunto || (dados.dadosConteudo && Object.keys(dados.dadosConteudo).length > 0));
        resultadosMap.set(id, { existe, dados, processoNum });

        while (resultadosMap.has(maxIdVerificado + 1)) {
          maxIdVerificado++;
          const resItem = resultadosMap.get(maxIdVerificado);
          resultadosMap.delete(maxIdVerificado);

          if (!resItem.existe) {
            if (primeiroEncontrado || maxIdVerificado > 200) {
              nulosConsecutivos++;
              if (nulosConsecutivos >= autoStopLimit) {
                console.log(`\n🛑 [Ano ${targetYear}] Detectados ${autoStopLimit} processos nulos consecutivos. Fim do ano ${targetYear} atingido no ID ${maxIdVerificado - autoStopLimit}!`);
                parouPorLimite = true;
                break;
              }
            }
          } else {
            primeiroEncontrado = true;
            nulosConsecutivos = 0;
            concluidos++;

            if (resItem.dados.restrito) {
              restritosCount++;
            } else {
              publicosCount++;
            }

            const fileName = `processo_${resItem.processoNum.replace("/", "_")}.json`;
            fs.writeFileSync(path.join(outDir, fileName), JSON.stringify(resItem.dados, null, 2));

            const pct = ((concluidos / total) * 100).toFixed(1);
            const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
            const reqPerSec = (concluidos / Math.max(0.1, elapsedSec)).toFixed(1);

            if (concluidos % 50 === 0 || concluidos === 1) {
              console.log(`[Ano ${targetYear}] [Worker ${workerId}] [${concluidos} extraídos] ${resItem.processoNum} -> ${resItem.dados.restrito ? "🔒 Restrito" : "🔓 Público"} (${reqPerSec} req/s)`);
            }
          }
        }
      } catch (err) {
        comErro++;
        console.error(`[Worker ${workerId}] ❌ Erro ao consultar ${processoNum}:`, err.message);
      }
    }
  }

  const workers = [];
  const activeWorkers = Math.min(targetConcurrency, total);
  for (let i = 1; i <= activeWorkers; i++) {
    workers.push(worker(i));
  }

  await Promise.all(workers);

  const totalTimeSec = ((Date.now() - startTime) / 1000).toFixed(2);
  const avgTimePerProcess = (totalTimeSec / Math.max(1, concluidos)).toFixed(3);

  console.log("\n==================================================================");
  console.log(`RESUMO DO PROCESSAMENTO DO ANO ${targetYear}:`);
  console.log("==================================================================");
  console.log(`Total de Processos Válidos Extraídos: ${concluidos}`);
  console.log(`Processos Restritos:                   ${restritosCount}`);
  console.log(`Processos Públicos (com Trâmites):     ${publicosCount}`);
  console.log(`Erros de Requisição:                  ${comErro}`);
  console.log(`Tempo Total decorrido:                ${totalTimeSec} segundos (${(totalTimeSec / 60).toFixed(2)} minutos)`);
  console.log(`Média por Processo Válido:            ${avgTimePerProcess} segundos`);
  console.log(`Vazão Média:                          ${(concluidos / Math.max(0.1, totalTimeSec)).toFixed(2)} processos/segundo`);
  console.log(`💾 Resultados salvos no diretório:    ${outDir}`);
  console.log("==================================================================");
}

if (require.main === module) {
  runParallelBatch().catch(console.error);
}

module.exports = { runParallelBatch };
