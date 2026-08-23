"use strict";

const https = require("https");
const dns = require("dns");
const fs = require("fs");
const path = require("path");
const { URLSearchParams } = require("url");

const BASE_URL = "https://www.saneago.com.br";
const PROCESSO_TARGET = process.argv[2] || "14652/2026";

const creds = JSON.parse(fs.readFileSync("config/credentials.json", "utf8"));
const CREDENTIALS = {
  user: creds.usuario,
  pass: creds.senha
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
          resolvedIps.set(hostname, ipRecord.data);
          return ipRecord.data;
        }
      }
    } catch (err) {}
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
    const startTime = Date.now();
    return new Promise(async (resolve, reject) => {
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
          dns.lookup(hostname, opts, async (err, address, family) => {
            if (!err) return callback(null, address, family);
            const dohIp = await resolveDoH(hostname);
            if (dohIp) {
              if (optionsObj.all) return callback(null, [{ address: dohIp, family: 4 }]);
              return callback(null, dohIp, 4);
            }
            return callback(err);
          });
        },
        rejectUnauthorized: false
      };

      const req = https.request(reqOptions, (res) => {
        this.updateCookies(res.headers["set-cookie"]);

        const chunks = [];
        res.on("data", chunk => chunks.push(chunk));
        res.on("end", () => {
          const duration = Date.now() - startTime;
          const buffer = Buffer.concat(chunks);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: buffer,
            text: () => buffer.toString("utf-8"),
            url: parsedUrl.toString(),
            duration
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

async function runBenchmark() {
  console.log("==================================================================");
  console.log(`BENCHMARK DE CONSULTA DE PROCESSO VIA HTTP DIRETO`);
  console.log(`Alvo: Processo nº ${PROCESSO_TARGET}`);
  console.log("==================================================================\n");

  const http = new SaneagoDirectHttpClient();
  const timings = {};

  // Step 1: Login Portal ZK
  console.log("1. Autenticação no Portal ZK (/prt/mpt/principal.zul)...");
  const t0 = Date.now();
  const portalGet = await http.request("/prt/mpt/principal.zul");
  const portalText = portalGet.text();

  const dtid = extractRegex(portalText, /dtid="([^"]+)"/) || extractRegex(portalText, /dt:'([^']+)'/);
  const userId = extractRegex(portalText, /id:'([^']+)'.*?numeroMatricula/) || extractRegex(portalText, /id:'([^']+)'.*?value:'/);
  const passId = extractRegex(portalText, /id:'([^']+)'.*?codigoSenha/);
  const buttonId = extractRegex(portalText, /id:'([^']+)'.*?btnEntrar/);

  let zkauRes = null;
  if (dtid && userId && passId && buttonId) {
    zkauRes = await http.zkau(dtid, [
      { cmd: "onChange", uuid: userId, data: { value: CREDENTIALS.user, start: CREDENTIALS.user.length } },
      { cmd: "onChange", uuid: passId, data: { value: CREDENTIALS.pass, start: CREDENTIALS.pass.length } },
      { cmd: "onClick", uuid: buttonId, data: { pageX: 0, pageY: 0, which: 1, x: 0, y: 0 } },
    ], `${BASE_URL}/prt/mpt/principal.zul`);
  }
  timings.portalLogin = Date.now() - t0;
  console.log(`   ⏱️ Login Portal ZK concluído em: ${timings.portalLogin}ms`);

  // Step 2: Bridge SSO GerenciadorDocumento
  console.log("\n2. Ponte de Sessão SSO (/prt/GerenciadorDocumento.jsp)...");
  const t1 = Date.now();
  const gerenciadorRes = await http.request("/prt/GerenciadorDocumento.jsp");
  timings.ssoBridge = Date.now() - t1;
  console.log(`   ⏱️ Ponte SSO concluída em: ${timings.ssoBridge}ms (HTTP ${gerenciadorRes.statusCode})`);

  // Step 3: Login JSF DocFlow
  console.log("\n3. Autenticação JSF no DocFlow (/docflow/xhtml/docflow/geral/login.jsf)...");
  const t2 = Date.now();
  const docflowLoginGet = await http.request("/docflow/xhtml/docflow/geral/login.jsf");
  const viewStateLogin = extractRegex(docflowLoginGet.text(), /name="javax\.faces\.ViewState"\s+value="([^"]+)"/);

  const postDataLogin = new URLSearchParams();
  postDataLogin.append("j_idt58", "j_idt58");
  postDataLogin.append("userName", CREDENTIALS.user);
  postDataLogin.append("password", CREDENTIALS.pass);
  postDataLogin.append("j_idt71", "Entrar");
  postDataLogin.append("javax.faces.ViewState", viewStateLogin || "");

  const jsfLoginPost = await http.request("/docflow/xhtml/docflow/geral/login.jsf", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Referer": `${BASE_URL}/docflow/xhtml/docflow/geral/login.jsf`
    },
    body: postDataLogin.toString()
  });
  timings.docflowLogin = Date.now() - t2;
  console.log(`   ⏱️ Login DocFlow JSF concluído em: ${timings.docflowLogin}ms (HTTP ${jsfLoginPost.statusCode})`);

  // Step 4: Testar e Carregar Tela de Consulta por Protocolo
  console.log("\n4. Carregando tela 'Consulta Pública de Processos e Documentos por Número'...");

  const possibleUrls = [
    "/docflow/xhtml/docflow/protocolo/consultarProtocolo.jsf",
    "/docflow/xhtml/consultarProtocolo.jsf",
    "/docflow/xhtml/docflow/protocolo/pesquisarProtocolo.jsf",
    "/docflow/xhtml/docflow/processo/consultarProcesso.jsf"
  ];

  let targetUrl = "";
  let pageContent = "";
  let viewStateConsulta = "";
  let durationCarregarTela = 0;

  for (const urlCandidata of possibleUrls) {
    const tStart = Date.now();
    const res = await http.request(urlCandidata, {
      headers: { "Referer": `${BASE_URL}/docflow/xhtml/docflow/geral/principal.jsf` }
    });
    const dur = Date.now() - tStart;

    console.log(`   Probando ${urlCandidata}: HTTP ${res.statusCode}, tamanho: ${res.text().length} bytes, tempo: ${dur}ms`);
    const txt = res.text();
    if (res.statusCode === 200 && (txt.includes("Consulta") || txt.includes("Protocolo") || txt.includes("Processo") || txt.includes("Painel de Consulta"))) {
      targetUrl = urlCandidata;
      pageContent = txt;
      durationCarregarTela = dur;
      viewStateConsulta = extractRegex(txt, /name="javax\.faces\.ViewState"\s+value="([^"]+)"/);
      console.log(`   🎯 Tela identificada: ${urlCandidata} (ViewState: ${viewStateConsulta})`);
      break;
    }
  }

  timings.carregarTelaConsulta = durationCarregarTela;

  // Analisar HTML da tela para encontrar nomes dos campos
  console.log("\n5. Inspecionando formulário da tela de consulta...");
  const scratchDir = path.join(__dirname, "scratch");
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });
  fs.writeFileSync(path.join(scratchDir, "tela_consulta_obtida.html"), pageContent);

  // Procurar inputs na tela
  const formMatches = [...pageContent.matchAll(/<form[\s\S]*?<\/form>/gi)];
  console.log(`   Encontrados ${formMatches.length} formulários no HTML.`);

  const inputs = [...pageContent.matchAll(/<input[^>]*>/gi)].map(m => m[0]);
  console.log("   Campos <input> encontrados:");
  inputs.forEach(i => console.log("   -", i));

  // Step 5: Disparar Pesquisa HTTP por Número do Processo
  console.log("\n6. Executando PESQUISA POR NÚMERO DE PROCESSO...");

  // Montar requisição de busca
  // Mapear campos baseados no RichFaces/JSF padrão do DocFlow
  // Vamos extrair o ID do formulário
  const formId = extractRegex(pageContent, /<form[^>]*id="([^"]+)"/i) || "j_idt58";
  console.log(`   Form ID: ${formId}`);

  // Descobrir nomes de inputs de rádio, número do processo e botão de pesquisar
  let radioName = extractRegex(pageContent, /<input[^>]*type="radio"[^>]*name="([^"]+)"/i) || "tipoConsulta";
  let inputNumName = extractRegex(pageContent, /<input[^>]*type="text"[^>]*name="([^"]+)"/i) || "numeroProtocolo";
  let btnName = extractRegex(pageContent, /<input[^>]*type="submit"[^>]*name="([^"]+)"/i) || extractRegex(pageContent, /<button[^>]*name="([^"]+)"/i) || "btnPesquisar";

  console.log(`   Valores identificados: radio=${radioName}, input=${inputNumName}, btn=${btnName}`);

  // Testar variadas estruturas de POST se necessário
  const postSearchData = new URLSearchParams();
  postSearchData.append(formId, formId);
  postSearchData.append(radioName, "PROCESSO"); // ou "NUMERO_PROCESSO" ou "2"
  postSearchData.append(inputNumName, PROCESSO_TARGET);
  postSearchData.append(btnName, "Pesquisar");
  postSearchData.append("javax.faces.ViewState", viewStateConsulta || "");

  const tSearch = Date.now();
  const searchResultRes = await http.request(targetUrl || "/docflow/xhtml/docflow/protocolo/consultarProtocolo.jsf", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Referer": `${BASE_URL}${targetUrl}`
    },
    body: postSearchData.toString()
  });
  timings.pesquisaProcesso = Date.now() - tSearch;

  console.log(`   ⏱️ Resposta da Pesquisa obtida em: ${timings.pesquisaProcesso}ms (HTTP ${searchResultRes.statusCode}, ${searchResultRes.text().length} bytes)`);

  fs.writeFileSync(path.join(scratchDir, "resultado_pesquisa_processo.html"), searchResultRes.text());

  // Verificar se encontramos dados do processo na resposta
  const searchHtml = searchResultRes.text();
  const encontrouDados = searchHtml.includes(PROCESSO_TARGET) || searchHtml.includes("Interessado") || searchHtml.includes("Trâmites") || searchHtml.includes("Assunto");

  console.log("\n==================================================================");
  console.log("RESUMO DE TEMPOS E PERFORMANCE (HTTP DIRETO):");
  console.log("==================================================================");
  console.log(`1. Login Portal (ZK):                                ${timings.portalLogin} ms`);
  console.log(`2. Ponte SSO (GerenciadorDocumento):                  ${timings.ssoBridge} ms`);
  console.log(`3. Login DocFlow (JSF):                              ${timings.docflowLogin} ms`);
  console.log(`4. Carregar Tela Consulta:                           ${timings.carregarTelaConsulta} ms`);
  console.log(`5. Pesquisar UM Processo (${PROCESSO_TARGET}):       ${timings.pesquisaProcesso} ms`);
  console.log("------------------------------------------------------------------");
  const tempoTotalComLogin = timings.portalLogin + timings.ssoBridge + timings.docflowLogin + timings.carregarTelaConsulta + timings.pesquisaProcesso;
  console.log(`⚡ TEMPO TOTAL (Com Login Completo):                 ${tempoTotalComLogin} ms (${(tempoTotalComLogin / 1000).toFixed(2)} s)`);
  console.log(`⚡ TEMPO DA CONSULTA ISOLADA (Sessão Ativa):        ${timings.pesquisaProcesso} ms (${(timings.pesquisaProcesso / 1000).toFixed(2)} s)`);
  console.log(`Status do Resultado: ${encontrouDados ? "✅ DADOS EXTRAÍDOS COM SUCESSO" : "⚠️ NECESSITA AJUSTE NOS PARAMETROS DO POST"}`);
  console.log("==================================================================");

  return {
    timings,
    tempoTotalComLogin,
    tempoConsultaIsolada: timings.pesquisaProcesso,
    encontrouDados
  };
}

runBenchmark().catch(console.error);
