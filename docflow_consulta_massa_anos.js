"use strict";

/**
 * Consulta em Massa de Processos do DocFlow Parametrizável por Ano (Saneago)
 *
 * Uso:
 *   node docflow_consulta_massa_anos.js [ano] [inicio_id] [fim_id] [concorrencia]
 * Exemplos:
 *   node docflow_consulta_massa_anos.js 2025 1 15000 20
 *   node docflow_consulta_massa_anos.js 2024 1 15000 20
 */

const https = require("https");
const dns = require("dns");
const fs = require("fs");
const path = require("path");
const { URLSearchParams } = require("url");
const { parseProcessoData } = require("./docflow_consultar_processo");

const BASE_URL = "https://www.saneago.com.br";

const ANO_TARGET = process.argv[2] || "2025";
const START_ID = parseInt(process.argv[3] || "1", 10);
const END_ID = parseInt(process.argv[4] || "50", 10);
const CONCURRENCY = parseInt(process.argv[5] || "20", 10);

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

async function autenticarSessao(http, anoTarget = ANO_TARGET) {
  console.log(`🔐 Autenticando no Portal Saneago para o ano ${anoTarget}...`);

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

  console.log("✅ Autenticação concluída!");
  return { viewStateConsulta };
}

async function consultarProcessoIndividual(http, processoNum) {
  // Obter ViewState novo para evitar colisões no estado da árvore JSF em chamadas simultâneas
  const pageGet = await http.request("/docflow/xhtml/docflow/protocolo/consultarProtocolo.jsf");
  const viewState = extractRegex(pageGet.text(), /name="javax\.faces\.ViewState"\s+value="([^"]+)"/);

  const postSearchData = new URLSearchParams();
  postSearchData.append("j_idt58", "j_idt58");
  postSearchData.append("tipoConsulta", "PROCESSO");
  postSearchData.append("numeroProtocolo", processoNum);
  postSearchData.append("btnPesquisar", "Pesquisar");
  postSearchData.append("javax.faces.ViewState", viewState || "");

  const res = await http.request("/docflow/xhtml/docflow/protocolo/consultarProtocolo.jsf", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Referer": `${BASE_URL}/docflow/xhtml/docflow/protocolo/consultarProtocolo.jsf`
    },
    body: postSearchData.toString()
  });

  const parsed = parseProcessoData(res.text());
  parsed.processoConsultado = processoNum;
  return parsed;
}

async function runAnoBatch(ano = ANO_TARGET, startId = START_ID, endId = END_ID, concurrency = CONCURRENCY, autoStopLimit = 100) {
  console.log("==================================================================");
  console.log(`EXTRAÇÃO EM MASSA - ANO ${ano}`);
  console.log(`Faixa Inicial: ${startId}/${ano} até ${endId}/${ano}`);
  console.log(`Concorrência: ${concurrency} requisições simultâneas`);
  console.log("==================================================================\n");

  const http = new SaneagoDirectHttpClient();
  await autenticarSessao(http, ano);

  const outDir = path.join(__dirname, `data_processos_${ano}`);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  let concluidos = 0;
  let comErro = 0;
  let restritosCount = 0;
  let publicosCount = 0;
  let primeiroEncontrado = false;

  const resultadosMap = new Map();
  let maxIdVerificado = startId - 1;
  let nulosConsecutivos = 0;
  let parouPorLimite = false;

  let currentId = startId;
  const startTime = Date.now();

  async function worker(workerId) {
    while (!parouPorLimite && currentId <= endId) {
      const id = currentId++;
      const processoNum = `${id}/${ano}`;

      try {
        const dados = await consultarProcessoIndividual(http, processoNum);
        if (parouPorLimite) break;

        const existe = !!(dados.numero || (dados.dadosConteudo && Object.keys(dados.dadosConteudo).length > 0));
        resultadosMap.set(id, { existe, dados, processoNum });

        while (resultadosMap.has(maxIdVerificado + 1)) {
          maxIdVerificado++;
          const resItem = resultadosMap.get(maxIdVerificado);
          resultadosMap.delete(maxIdVerificado);

          if (!resItem.existe) {
            // Só conta para parada automática após ter encontrado ao menos 1 processo válido ou se passou do ID 200
            if (primeiroEncontrado || maxIdVerificado > 200) {
              nulosConsecutivos++;
              if (nulosConsecutivos >= autoStopLimit) {
                console.log(`\n🛑 [Ano ${ano}] Detectados ${autoStopLimit} processos nulos consecutivos. Fim do ano ${ano} atingido no ID ${maxIdVerificado - autoStopLimit}!`);
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

            const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
            const reqPerSec = (concluidos / Math.max(0.1, elapsedSec)).toFixed(1);

            if (concluidos % 50 === 0 || concluidos === 1) {
              console.log(`[Ano ${ano}] [Worker ${workerId}] [${concluidos} extraídos] ${resItem.processoNum} -> ${resItem.dados.restrito ? "🔒 Restrito" : "🔓 Público"} (${reqPerSec} req/s)`);
            }
          }
        }
      } catch (err) {
        comErro++;
        console.error(`[Ano ${ano}] [Worker ${workerId}] ❌ Erro ao consultar ${processoNum}:`, err.message);
      }
    }
  }

  const workers = [];
  for (let i = 1; i <= Math.min(concurrency, 50); i++) {
    workers.push(worker(i));
  }

  await Promise.all(workers);

  const totalTimeSec = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✅ FINALIZADO ANO ${ano}: ${concluidos} processos salvos em ${outDir} (${totalTimeSec}s, ${(concluidos / Math.max(0.1, totalTimeSec)).toFixed(2)} req/s)\n`);
}

if (require.main === module) {
  runAnoBatch(ANO_TARGET, START_ID, END_ID, CONCURRENCY).catch(console.error);
}

module.exports = { runAnoBatch };
