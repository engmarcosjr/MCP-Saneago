"use strict";

const https = require("https");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

/**
 * Cliente HTTP direto para integração com o Supervisório Web (Automação Saneago).
 * Permite autenticação instantânea e consultas de telemetria, histórico de níveis/bombas,
 * DMCs e indicadores operacionais sem necessidade de navegadores (Playwright).
 *
 * T1 — Timeout: `options.timeoutMs` (padrão 30 000 ms). Uma promise que nunca fecha trava
 *      o processo MCP inteiro; req.setTimeout + req.destroy evita isso.
 * T2 — TLS: validação ligada por padrão. Defina SANEAGO_INSECURE_TLS=1 para desabilitar
 *      (opt-in explícito; necessário quando o servidor usa certificado interno da Saneago).
 */
class SupervisorioHttpClient {
  constructor(options = {}) {
    this.hostname = options.hostname || "198.17.232.242"; // IP direto com fallback de Host
    this.hostHeader = options.hostHeader || "www.saneago.com.br";
    this.cookies = {};
    // T1: timeout configurável, default 30 s
    this.timeoutMs = options.timeoutMs !== undefined ? options.timeoutMs : 30000;
  }

  saveCookies(headers) {
    const raw = headers["set-cookie"];
    if (!raw) return;
    const cookieArray = Array.isArray(raw) ? raw : [raw];
    cookieArray.forEach(c => {
      const parts = c.split(";")[0].split("=");
      const name = parts[0].trim();
      const val = parts.slice(1).join("=").trim();
      this.cookies[name] = val;
    });
  }

  getCookieHeader() {
    return Object.entries(this.cookies).map(([k, v]) => `${k}=${v}`).join("; ");
  }

  request(options, postData = null) {
    return new Promise((resolve, reject) => {
      const defaultHeaders = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Host": this.hostHeader,
        "Origin": `https://${this.hostHeader}`,
        "Referer": `https://${this.hostHeader}/automacao`
      };

      const cookieHeader = this.getCookieHeader();
      if (cookieHeader) {
        defaultHeaders["Cookie"] = cookieHeader;
      }

      // T2: TLS validation — ligada por padrão; SANEAGO_INSECURE_TLS=1 desabilita (escape hatch explícito)
      const insecureTls = process.env.SANEAGO_INSECURE_TLS === "1" || process.env.SANEAGO_INSECURE_TLS === "true";

      const reqOptions = {
        hostname: this.hostname,
        port: options.port || 443,
        method: options.method || "GET",
        path: options.path,
        headers: { ...defaultHeaders, ...(options.headers || {}) },
        rejectUnauthorized: !insecureTls
      };

      if (postData) {
        reqOptions.headers["Content-Length"] = Buffer.byteLength(postData);
      }

      const req = https.request(reqOptions, res => {
        this.saveCookies(res.headers);
        let body = "";
        res.on("data", chunk => (body += chunk));
        res.on("end", () => {
          let json = null;
          try {
            json = JSON.parse(body);
          } catch (e) {}
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body,
            json
          });
        });
      });

      // T1: timeout de ciclo COMPLETO (connect + resposta).
      // req.setTimeout sozinho nao cobre a fase de conexao TCP: se o host estiver
      // inalcancavel, o connect pende no default do SO e a promise nunca fecha.
      let timerGlobal = null;
      let jaFinalizou = false;
      const falharPorTimeout = () => {
        if (jaFinalizou) return;
        jaFinalizou = true;
        if (timerGlobal) clearTimeout(timerGlobal);
        req.destroy();
        const endpoint = `${this.hostname}${options.path || ""}`;
        reject(new Error(`Timeout de ${this.timeoutMs / 1000}s atingido ao conectar em ${endpoint} (Supervisório Web). Verifique a conectividade com a rede Saneago.`));
      };
      if (this.timeoutMs > 0) {
        timerGlobal = setTimeout(falharPorTimeout, this.timeoutMs);
        if (typeof timerGlobal.unref === "function") timerGlobal.unref();
        req.setTimeout(this.timeoutMs, falharPorTimeout);
        req.on("close", () => { if (timerGlobal) clearTimeout(timerGlobal); });
      }

      req.on("error", (err) => {
        // T2: mensagem orientativa em falha de TLS — o usuário não pode ficar no escuro
        if (!insecureTls && (
          err.code === "DEPTH_ZERO_SELF_SIGNED_CERT" ||
          err.code === "SELF_SIGNED_CERT_IN_CHAIN" ||
          err.code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE" ||
          err.code === "ERR_TLS_CERT_ALTNAME_INVALID" ||
          (err.message && err.message.includes("certificate"))
        )) {
          reject(new Error(
            `Falha de validação TLS ao conectar em ${this.hostname}: ${err.message}. ` +
            `O host provavelmente usa certificado interno da Saneago. ` +
            `Para desabilitar a validação TLS (apenas em rede interna), defina SANEAGO_INSECURE_TLS=1.`
          ));
          return;
        }
        reject(err);
      });

      if (postData) req.write(postData);
      req.end();
    });
  }

  /**
   * Autentica diretamente com email corporativo e hash da senha/token.
   */
  async loginComToken(email, tokenSenha) {
    const payload = new URLSearchParams({
      email: email,
      senha: tokenSenha
    }).toString();

    const res = await this.request(
      {
        method: "POST",
        path: "/automacao/login/autenticar",
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      },
      payload
    );

    if (res.status === 302 || this.cookies["PHPSESSID"]) {
      return true;
    }
    throw new Error(`Falha no login HTTP: status ${res.status}`);
  }

  /**
   * Autentica a partir das credenciais salvas em config/credentials.json ou parâmetros.
   */
  async login(usuario, senha) {
    let u = usuario;
    let s = senha;

    if (!u || !s) {
      const credentialsPath = path.resolve(__dirname, "..", "config", "credentials.json");
      if (fs.existsSync(credentialsPath)) {
        const creds = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));
        u = creds.usuario?.trim();
        s = creds.senha;
      }
    }

    const email = u.includes("@") ? u : `${u}@saneago.com.br`;
    const hashSenha = crypto.createHash("sha256").update(s).digest("hex");
    return this.loginComToken(email, hashSenha);
  }

  /**
   * Monitoramento de sensores em tempo real por unidade.
   * @param {number} unidade - ID da unidade (6 = Anápolis, 288 = ETA Compacta, 314 = Interlândia)
   * @param {number} tipoComponente - 1=Nível, 3=Bomba, 4=Vazão
   */
  async monitorarUnidade(unidade = 6, tipoComponente = 1) {
    const payload = new URLSearchParams({
      unidade: String(unidade),
      tipo_componente: String(tipoComponente)
    }).toString();

    const res = await this.request(
      {
        method: "POST",
        path: "/automacao/dashboard/monitorar-unidade",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Requested-With": "XMLHttpRequest"
        }
      },
      payload
    );
    return res.json;
  }

  /**
   * Lista todos os componentes e sensores cadastrados para uma unidade.
   */
  async listarComponentes(unidade = 6) {
    const payload = new URLSearchParams({ unidade: String(unidade) }).toString();
    const res = await this.request(
      {
        method: "POST",
        path: "/automacao/componente/listar-por-unidade",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Requested-With": "XMLHttpRequest"
        }
      },
      payload
    );
    return res.json;
  }

  /**
   * Consulta séries históricas de um ou múltiplos componentes.
   * @param {number|number[]} componentes - ID(s) do(s) componente(s)
   * @param {string} dInicial - Data inicial (YYYY-MM-DD)
   * @param {string} dFinal - Data final (YYYY-MM-DD)
   * @param {string} hInicial - Hora inicial (HH:MM:SS)
   * @param {string} hFinal - Hora final (HH:MM:SS)
   * @param {number} unidade - ID da unidade
   */
  async consultarHistorico(componentes, dInicial, dFinal, hInicial = "00:00:00", hFinal = "23:59:59", unidade = 6) {
    const params = new URLSearchParams({
      unidade: String(unidade),
      dInicial: dInicial,
      dFinal: dFinal,
      hInicial: hInicial,
      hFinal: hFinal,
      flag_historico_anterior: "nao"
    });

    const lista = Array.isArray(componentes) ? componentes : [componentes];
    lista.forEach(c => params.append("componente[]", String(c)));

    const res = await this.request(
      {
        method: "POST",
        path: "/automacao/historico/listar",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Requested-With": "XMLHttpRequest",
          "Accept": "application/json, text/javascript, */*; q=0.01"
        }
      },
      params.toString()
    );

    return res.json;
  }

  /**
   * Consulta os DMCs cadastrados para uma unidade.
   */
  async consultarDMCs(unidade = 6) {
    const payload = new URLSearchParams({ unidade: String(unidade) }).toString();
    const res = await this.request(
      {
        method: "POST",
        path: "/automacao/dmc/buscar",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Requested-With": "XMLHttpRequest"
        }
      },
      payload
    );
    return res.json;
  }

  /**
   * Consulta dados de mínima noturna de um DMC.
   */
  async consultarMinimaNoturna(unidade, dmcId, dtIni, dtFim) {
    const payload = new URLSearchParams({
      unidade: String(unidade),
      dmc: String(dmcId),
      dataInicial: dtIni,
      dataFinal: dtFim
    }).toString();

    const res = await this.request(
      {
        method: "POST",
        path: "/automacao/minima/buscar",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Requested-With": "XMLHttpRequest"
        }
      },
      payload
    );
    return res.json;
  }

  /**
   * Consulta o horímetro de uma bomba/componente.
   */
  async consultarHorimetro(unidade, componente, dtIni, dtFim, detalhado = false) {
    const payload = new URLSearchParams({
      unidade: String(unidade),
      componente: String(componente),
      dataInicial: dtIni,
      dataFinal: dtFim
    }).toString();

    const path = detalhado 
      ? "/automacao/horimetroevento/buscarevento" 
      : "/automacao/horimetro/buscarhistorico";

    const res = await this.request(
      {
        method: "POST",
        path: path,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Requested-With": "XMLHttpRequest"
        }
      },
      payload
    );
    return res.json;
  }
}

module.exports = { SupervisorioHttpClient };
