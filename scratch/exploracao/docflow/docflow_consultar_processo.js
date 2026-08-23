"use strict";

/**
 * Consulta Direta de Processo/Protocolo no DocFlow Saneago via HTTP Direto (Node.js nativo)
 *
 * Processo alvo: 14652/2026
 * Extração de dados:
 * - Número do Processo
 * - Interessado
 * - Assunto
 * - Localização Atual
 * - Observações
 * - Histórico Completo de Trâmites
 */

const https = require("https");
const dns = require("dns");
const fs = require("fs");
const path = require("path");
const { URLSearchParams } = require("url");

const BASE_URL = "https://www.saneago.com.br";
const PROCESSO_TARGET = process.argv[2] || "14652/2026";

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

const resolvedIps = new Map();

async function resolveDoH(hostname) {
  if (resolvedIps.has(hostname)) return resolvedIps.get(hostname);

  const dohEndpoints = [
    `https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=A`,
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=A`
  ];

  for (const endpoint of dohEndpoints) {
    try {
      const data = await new Promise((resolve, reject) => {
        const req = https.get(endpoint, { headers: { "Accept": "application/dns-json" }, timeout: 5000 }, (res) => {
          let chunks = "";
          res.on("data", c => chunks += c);
          res.on("end", () => {
            try { resolve(JSON.parse(chunks)); } catch (e) { reject(e); }
          });
        });
        req.on("error", reject);
        req.on("timeout", () => { req.destroy(); reject(new Error("Timeout DoH")); });
      });

      if (data && Array.isArray(data.Answer)) {
        const ipRecord = data.Answer.find(a => a.type === 1);
        if (ipRecord && ipRecord.data) {
          console.log(`[DoH] Resolvido ${hostname} -> ${ipRecord.data}`);
          resolvedIps.set(hostname, ipRecord.data);
          return ipRecord.data;
        }
      }
    } catch (err) {
      // tenta próximo endpoint
    }
  }
  return null;
}

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
    return new Promise(async (resolve, reject) => {
      const parsedUrl = new URL(urlStr, BASE_URL);
      let targetHostname = parsedUrl.hostname;

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

      // Tentar DoH se DNS falhar
      const reqOptions = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.pathname + parsedUrl.search,
        method: options.method || "GET",
        headers,
        lookup: (hostname, opts, cb) => {
          const callback = typeof opts === "function" ? opts : cb;
          const optionsObj = typeof opts === "object" ? opts : {};
          dns.lookup(hostname, opts, async (err, address, family) => {
            if (!err) {
              return callback(null, address, family);
            }
            console.log(`[DNS] lookup falhou (${err.code}). Tentando DoH...`);
            const dohIp = await resolveDoH(hostname);
            if (dohIp) {
              if (optionsObj.all) {
                return callback(null, [{ address: dohIp, family: 4 }]);
              }
              return callback(null, dohIp, 4);
            }
            return callback(err);
          });
        },
        rejectUnauthorized: false
      };

      if (options.ipAddress) {
        reqOptions.hostname = options.ipAddress;
        headers["Host"] = parsedUrl.hostname;
      }

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

function cleanText(str) {
  if (!str) return "";
  return str.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function parseProcessoData(html) {
  const data = {
    numero: null,
    protocolo: null,
    naturezaConteudo: null,
    interessado: null,
    localizacaoAtual: null,
    detentor: null,
    autor: null,
    dataCriacao: null,
    dataProcesso: null,
    tipo: null,
    assunto: null,
    observacoes: null,
    restrito: false,
    dadosConteudo: {},
    tramites: [],
    documentos: []
  };

  if (!html) return data;

  // 1. Extração dinâmica de todos os pares de "Rótulo: Valor" no painel Dados do Conteúdo
  const kvMatches = [
    ...html.matchAll(/([A-ZÁÉÍÓÚÂÊÔÃÕÇa-záéíóúâêôãõç\s\(\)]+):[\s]*<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/gi),
    ...html.matchAll(/([A-ZÁÉÍÓÚÂÊÔÃÕÇa-záéíóúâêôãõç\s\(\)]+):[\s]*<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>/gi),
    ...html.matchAll(/<label[^>]*>([\s\S]*?):?<\/label>\s*<span[^>]*>([\s\S]*?)<\/span>/gi)
  ];

  for (const match of kvMatches) {
    const key = cleanText(match[1]).replace(/:$/, "").trim();
    const val = cleanText(match[2]).trim();
    if (key && val && key.length < 50 && !data.dadosConteudo[key]) {
      data.dadosConteudo[key] = val;
    }
  }

  // Auxiliar para pegar campo nos dadosConteudo ou via Regex no HTML
  const getField = (pattern) => {
    for (const [k, v] of Object.entries(data.dadosConteudo)) {
      if (pattern.test(k)) return v;
    }
    return null;
  };

  data.numero = getField(/^Número/i) || cleanText(extractRegex(html, /Número[\s:]*<\/td>\s*<td[^>]*>([^<]+)/i));
  data.protocolo = getField(/^Protocolo/i) || cleanText(extractRegex(html, /Protocolo[\s:]*<\/td>\s*<td[^>]*>([^<]+)/i));
  data.naturezaConteudo = getField(/^Natureza/i) || cleanText(extractRegex(html, /Natureza do Conteúdo[\s:]*<\/td>\s*<td[^>]*>([^<]+)/i));
  data.interessado = getField(/^Interessado/i) || cleanText(extractRegex(html, /Interessado\(s\)[\s:]*<\/td>\s*<td[^>]*>([^<]+)/i));
  data.localizacaoAtual = getField(/^Localização/i) || cleanText(extractRegex(html, /Localização Atual[\s:]*<\/td>\s*<td[^>]*>([^<]+)/i));
  data.detentor = getField(/^Detentor/i) || cleanText(extractRegex(html, /Detentor[\s:]*<\/td>\s*<td[^>]*>([^<]+)/i));
  data.autor = getField(/^Autor/i) || cleanText(extractRegex(html, /Autor[\s:]*<\/td>\s*<td[^>]*>([^<]+)/i));
  data.dataCriacao = getField(/^Data de Criação/i) || cleanText(extractRegex(html, /Data de Criação[\s:]*<\/td>\s*<td[^>]*>([^<]+)/i));
  data.dataProcesso = getField(/^Data do Processo/i) || cleanText(extractRegex(html, /Data do Processo[\s:]*<\/td>\s*<td[^>]*>([^<]+)/i));
  data.tipo = getField(/^Tipo$/i) || cleanText(extractRegex(html, /Tipo[\s:]*<\/td>\s*<td[^>]*>([^<]+)/i));
  data.assunto = getField(/^Assunto/i) || cleanText(extractRegex(html, /Assunto[\s:]*<\/td>\s*<td[^>]*>([^<]+)/i));
  data.observacoes = getField(/^Observaç/i) || cleanText(extractRegex(html, /Observaç[õo]es?[\s:]*<\/td>\s*<td[^>]*>([^<]+)/i));

  // 2. Extração de Trâmites
  const trMatches = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  for (const trMatch of trMatches) {
    const rowHtml = trMatch[1];
    const tdMatches = [...rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m => cleanText(m[1]));
    if (tdMatches.length >= 3 && (tdMatches[0].match(/\d{2}\/\d{2}\/\d{4}/) || tdMatches[1].match(/\d{2}\/\d{2}\/\d{4}/))) {
      data.tramites.push({
        dataHora: tdMatches[0] || "",
        unidadeOrigem: tdMatches[1] || "",
        unidadeDestino: tdMatches[2] || "",
        situacao: tdMatches[3] || "",
        despacho: tdMatches[4] || ""
      });
    }
  }

  // Flag de processo restrito
  data.restrito = data.tramites.length === 0 || /restrito/i.test(html);

  return data;
}

async function consultarProcesso(processoNum = PROCESSO_TARGET) {
  console.log("==================================================================");
  console.log(`CONSULTA DE PROCESSO DOCFLOW: ${processoNum} (HTTP DIRETO)`);
  console.log("==================================================================\n");

  const http = new SaneagoDirectHttpClient();

  // Etapa 1: Login Portal ZK
  console.log("1. GET /prt/mpt/principal.zul...");
  const portalGet = await http.request("/prt/mpt/principal.zul");
  const portalText = portalGet.text();
  console.log(`   Status Portal: ${portalGet.statusCode}`);

  const dtid = extractRegex(portalText, /dtid="([^"]+)"/) || extractRegex(portalText, /dt:'([^']+)'/);
  const userId = extractRegex(portalText, /id:'([^']+)'.*?numeroMatricula/) || extractRegex(portalText, /id:'([^']+)'.*?value:'/);
  const passId = extractRegex(portalText, /id:'([^']+)'.*?codigoSenha/);
  const buttonId = extractRegex(portalText, /id:'([^']+)'.*?btnEntrar/);

  if (dtid && userId && passId && buttonId) {
    console.log("2. POST /prt/zkau (Login SSO)...");
    await http.zkau(dtid, [
      { cmd: "onChange", uuid: userId, data: { value: CREDENTIALS.user, start: CREDENTIALS.user.length } },
      { cmd: "onChange", uuid: passId, data: { value: CREDENTIALS.pass, start: CREDENTIALS.pass.length } },
      { cmd: "onClick", uuid: buttonId, data: { pageX: 0, pageY: 0, which: 1, x: 0, y: 0 } },
    ], `${BASE_URL}/prt/mpt/principal.zul`);
  }

  // Etapa 2: Validar sessão SSO no GerenciadorDocumento
  console.log("3. GET /prt/GerenciadorDocumento.jsp...");
  await http.request("/prt/GerenciadorDocumento.jsp");

  // Etapa 3: Autenticação JSF no DocFlow
  console.log("4. GET /docflow/xhtml/docflow/geral/login.jsf...");
  const docflowLoginGet = await http.request("/docflow/xhtml/docflow/geral/login.jsf");
  const viewState = extractRegex(docflowLoginGet.text(), /name="javax\.faces\.ViewState"\s+value="([^"]+)"/);

  console.log("5. POST /docflow/xhtml/docflow/geral/login.jsf...");
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

  const scratchDir = path.join(__dirname, "scratch");
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });

  // Etapa 4: Testar endpoints de consulta por processo/protocolo
  const endpoints = [
    `/docflow/xhtml/consultarProtocolo.jsf?numeroProtocolo=${encodeURIComponent(processoNum)}`,
    `/docflow/xhtml/docflow/protocolo/consultarProtocolo.jsf?numeroProtocolo=${encodeURIComponent(processoNum)}`,
    `/docflow/xhtml/docflow/protocolo/consultarProtocolo.jsf?numeroProcesso=${encodeURIComponent(processoNum)}`,
    `/docflow/xhtml/docflow/processo/consultarProcesso.jsf?numeroProcesso=${encodeURIComponent(processoNum)}`,
    `/docflow/xhtml/consultarProtocolo.jsf?numeroProcesso=${encodeURIComponent(processoNum)}`,
    `/docflow/xhtml/consultarProtocolo.jsf`,
    `/docflow/xhtml/docflow/protocolo/consultarProtocolo.jsf`
  ];

  console.log("\n6. Efetuando consultas HTTP diretas para o processo...");
  let matchedHtml = "";

  for (const ep of endpoints) {
    const res = await http.request(ep, {
      headers: { "Referer": `${BASE_URL}/docflow/xhtml/docflow/geral/principal.jsf` }
    });

    console.log(`   [HTTP ${res.statusCode}] ${ep} (Tamanho: ${res.text().length} bytes)`);

    const fn = ep.replace(/[^a-zA-Z0-9]/g, "_") + ".html";
    fs.writeFileSync(path.join(scratchDir, fn), res.text());

    if (res.statusCode === 200 && (res.text().includes(processoNum) || res.text().includes("Interessado"))) {
      console.log(`   🎯 Dados do processo encontrados em: ${ep}`);
      matchedHtml = res.text();
      break;
    }
  }

  // Se a consulta for via formulário POST RichFaces/JSF em consultarProtocolo.jsf
  if (!matchedHtml) {
    console.log("\n7. Testando submissão de formulário JSF em /docflow/xhtml/docflow/protocolo/consultarProtocolo.jsf...");
    const pageGet = await http.request("/docflow/xhtml/docflow/protocolo/consultarProtocolo.jsf");
    const vs = extractRegex(pageGet.text(), /name="javax\.faces\.ViewState"\s+value="([^"]+)"/);

    if (vs) {
      const searchForm = new URLSearchParams();
      searchForm.append("formBody", "formBody");
      searchForm.append("tipoPesquisa", "NUMERO_PROCESSO");
      searchForm.append("numeroProcesso", processoNum);
      searchForm.append("btnPesquisar", "Pesquisar");
      searchForm.append("javax.faces.ViewState", vs);

      const postSearchRes = await http.request("/docflow/xhtml/docflow/protocolo/consultarProtocolo.jsf", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Referer": `${BASE_URL}/docflow/xhtml/docflow/protocolo/consultarProtocolo.jsf`
        },
        body: searchForm.toString()
      });

      fs.writeFileSync(path.join(scratchDir, "post_search_result.html"), postSearchRes.text());
      matchedHtml = postSearchRes.text();
    }
  }

  // Extrair e estruturar dados
  const parsedResult = parseProcessoData(matchedHtml);
  parsedResult.processoConsultado = processoNum;

  const resultJsonPath = path.join(scratchDir, `processo_${processoNum.replace('/', '_')}.json`);
  fs.writeFileSync(resultJsonPath, JSON.stringify(parsedResult, null, 2));

  console.log("\n==================================================================");
  console.log("RESULTADO DA EXTRAÇÃO:");
  console.log("==================================================================");
  console.log(JSON.stringify(parsedResult, null, 2));
  console.log(`\n💾 Dados salvos em: ${resultJsonPath}`);

  return parsedResult;
}

if (require.main === module) {
  consultarProcesso(PROCESSO_TARGET).catch(console.error);
}

module.exports = { consultarProcesso, parseProcessoData };
