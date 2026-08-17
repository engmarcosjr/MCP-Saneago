"use strict";

const https = require("https");
const dns = require("dns");
const fs = require("fs");
const path = require("path");
const { URLSearchParams } = require("url");

const BASE_URL = "https://www.saneago.com.br";
const PROCESSO_TARGET = "3764/2023";

let credsFromFile = {};
try {
  const credPath = path.join(__dirname, "config", "credentials.json");
  if (fs.existsSync(credPath)) {
    credsFromFile = JSON.parse(fs.readFileSync(credPath, "utf-8"));
  }
} catch (e) {}

const CREDENTIALS = {
  user: process.env.SANEAGO_USER || credsFromFile.usuario || "m175374",
  pass: process.env.SANEAGO_PASS || credsFromFile.senha || "MJr@@7527"
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
            if (optionsObj.all) return callback(null, [{ address: "198.17.232.242", family: 4 }]);
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

async function testarDownloadHttp() {
  const http = new SaneagoDirectHttpClient();

  console.log("1. Login Portal ZK...");
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

  console.log("2. SSO GerenciadorDocumento...");
  await http.request("/prt/GerenciadorDocumento.jsp");

  console.log("3. Login DocFlow JSF...");
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
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: postData.toString()
  });

  console.log("4. Acessar tela de Pesquisa de Processos (processoListar.jsf)...");
  const listarGet = await http.request("/docflow/xhtml/docflow/processo/processoListar.jsf");
  let vsListar = extractRegex(listarGet.text(), /name="javax\.faces\.ViewState"\s+value="([^"]+)"/);
  console.log("   ViewState processoListar:", vsListar ? "OK" : "Não encontrado");

  console.log(`5. Filtrar processo ${PROCESSO_TARGET} via AJAX/POST...`);
  const formPesquisa = new URLSearchParams();
  formPesquisa.append("formBody", "formBody");
  formPesquisa.append("numeroProcFiltroProcesso", PROCESSO_TARGET);
  formPesquisa.append("javax.faces.ViewState", vsListar);
  formPesquisa.append("javax.faces.source", "btnListar");
  formPesquisa.append("javax.faces.partial.event", "click");
  formPesquisa.append("javax.faces.partial.execute", "btnListar panelFiltro");
  formPesquisa.append("javax.faces.partial.render", "formBody:panelLista");
  formPesquisa.append("javax.faces.behavior.event", "action");
  formPesquisa.append("javax.faces.partial.ajax", "true");

  const ajaxRes = await http.request("/docflow/xhtml/docflow/processo/processoListar.jsf", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      "Faces-Request": "partial/ajax",
      "Referer": `${BASE_URL}/docflow/xhtml/docflow/processo/processoListar.jsf`
    },
    body: formPesquisa.toString()
  });

  const ajaxText = ajaxRes.text();
  console.log("   Tamanho resposta Ajax filtro:", ajaxText.length, "bytes");

  // Encontrar o link do processo na tabela lista
  const matchLinkProc = ajaxText.match(/id="(lista:\d+:lnkNumProcesso)"/);
  console.log("   Link do processo encontrado:", matchLinkProc ? matchLinkProc[1] : "NÃO");

  const vsAtualizado = extractRegex(ajaxText, /<update id="javax\.faces\.ViewState"><!\[CDATA\[([^\]]+)\]\]><\/update>/) || vsListar;

  if (matchLinkProc) {
    const lnkId = matchLinkProc[1];
    console.log(`6. Clicando no link do processo ${lnkId} via POST mojarra...`);
    const postOpen = new URLSearchParams();
    postOpen.append("formBody", "formBody");
    postOpen.append(lnkId, lnkId);
    postOpen.append("javax.faces.ViewState", vsAtualizado);

    const openRes = await http.request("/docflow/xhtml/docflow/processo/processoListar.jsf", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Referer": `${BASE_URL}/docflow/xhtml/docflow/processo/processoListar.jsf`
      },
      body: postOpen.toString()
    });

    console.log("   Tela de detalhes aberta! Status:", openRes.statusCode, "URL:", openRes.url);
    const htmlDetalhes = openRes.text();
    fs.writeFileSync("scratch/http_detalhes_processo.html", htmlDetalhes);

    const vsDetalhes = extractRegex(htmlDetalhes, /name="javax\.faces\.ViewState"\s+value="([^"]+)"/);

    // Verificar se a tabela de anexos já tem os links ou se precisa mudar de pasta
    const matchAnexoLink = htmlDetalhes.match(/name="(anexos:\d+:j_idt\d+)"/);
    console.log("   Link de anexo na tela:", matchAnexoLink ? matchAnexoLink[1] : "NÃO");

    // Verificar botão de pasta
    const matchPastaLink = htmlDetalhes.match(/id="(gridPastas:\d+:j_idt\d+|gridPastas:\d+:verAnexos)"/);
    console.log("   Link de pasta na tela:", matchPastaLink ? matchPastaLink[1] : "NÃO");

    if (matchPastaLink && !matchAnexoLink) {
      console.log("7. Clicando na pasta de anexos via RichFaces.ajax...");
      const pastaId = matchPastaLink[1];
      const formPasta = new URLSearchParams();
      formPasta.append("formBody", "formBody");
      formPasta.append(pastaId, pastaId);
      formPasta.append("javax.faces.ViewState", vsDetalhes);
      formPasta.append("javax.faces.source", pastaId);
      formPasta.append("javax.faces.partial.event", "click");
      formPasta.append("javax.faces.partial.execute", `${pastaId} @component`);
      formPasta.append("javax.faces.partial.render", "richPanelAnexos formBody:panelListAnexos formBody:anexos");
      formPasta.append("javax.faces.behavior.event", "action");
      formPasta.append("javax.faces.partial.ajax", "true");

      const pastaAjax = await http.request("/docflow/xhtml/docflow/processo/processoConsultarTabPanel.jsf", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          "Faces-Request": "partial/ajax",
          "Referer": `${BASE_URL}/docflow/xhtml/docflow/processo/processoConsultarTabPanel.jsf`
        },
        body: formPasta.toString()
      });

      console.log("   Pasta aberta Ajax! Tamanho:", pastaAjax.text().length);
      fs.writeFileSync("scratch/http_pasta_ajax.html", pastaAjax.text());
      const vsPasta = extractRegex(pastaAjax.text(), /<update id="javax\.faces\.ViewState"><!\[CDATA\[([^\]]+)\]\]><\/update>/) || vsDetalhes;
      const matchAnexoNaPasta = pastaAjax.text().match(/onclick="mojarra\.jsfcljs\(document\.getElementById\('formBody'\),\{'([^']+)':'[^']+'\},/);
      console.log("   Link de anexo retornado no Ajax da pasta:", matchAnexoNaPasta ? matchAnexoNaPasta[1] : "NÃO");

      if (matchAnexoNaPasta) {
        console.log(`8. Disparando POST de download HTTP para o anexo ${matchAnexoNaPasta[1]}...`);
        const downloadParam = matchAnexoNaPasta[1];
        const postDl = new URLSearchParams();
        postDl.append("formBody", "formBody");
        postDl.append(downloadParam, downloadParam);
        postDl.append("javax.faces.ViewState", vsPasta);

        const dlRes = await http.request("/docflow/xhtml/docflow/processo/processoConsultarTabPanel.jsf", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Referer": `${BASE_URL}/docflow/xhtml/docflow/processo/processoConsultarTabPanel.jsf`
          },
          body: postDl.toString()
        });

        console.log("   🎯 RESPOSTA DO DOWNLOAD HTTP:");
        console.log("   Status:", dlRes.statusCode);
        console.log("   Content-Type:", dlRes.headers["content-type"]);
        console.log("   Content-Disposition:", dlRes.headers["content-disposition"]);
        console.log("   Content-Length:", dlRes.headers["content-length"]);
        console.log("   Tamanho do buffer baixado:", (dlRes.body.length / (1024 * 1024)).toFixed(2), "MB");

        if (dlRes.body.length > 1000) {
          fs.writeFileSync("scratch/teste_download_http.zip", dlRes.body);
          console.log("   ✅ SUCESSO ABSOLUTO! Arquivo salvo em scratch/teste_download_http.zip");
        }
      }
    }
  }
}

testarDownloadHttp().catch(console.error);
