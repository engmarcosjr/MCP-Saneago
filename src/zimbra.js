"use strict";

const https = require("https");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

/**
 * Cliente HTTP direto para integração com o Webmail Zimbra da Saneago.
 * Exclusivamente para leitura, respeitando as regras arquiteturais.
 *
 * T1 — Timeout: 30 000 ms por padrão. Evita que uma resposta travada bloqueie o processo MCP.
 * T2 — TLS: validação ligada por padrão. Use SANEAGO_INSECURE_TLS=1 como escape hatch explícito
 *      quando o servidor usar certificado interno da Saneago.
 */
class ZimbraClient {
  constructor(options = {}) {
    this.hostname = options.hostname || "mail.saneago.com.br";
    this.cookies = {};
    this.offline = process.env.ZIMBRA_OFFLINE === "1";
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
        "Host": this.hostname
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
        reject(new Error(`Timeout de ${this.timeoutMs / 1000}s atingido ao conectar em ${endpoint} (Zimbra). Verifique a conectividade com a rede Saneago.`));
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

  async login(usuario, senha) {
    if (this.offline) return true;

    let u = usuario;
    let s = senha;

    if (!u || !s) {
      if (process.env.SANEAGO_USER && process.env.SANEAGO_PASS) {
        u = process.env.SANEAGO_USER;
        s = process.env.SANEAGO_PASS;
      } else {
        const credentialsPath = path.resolve(__dirname, "..", "config", "credentials.json");
        if (fs.existsSync(credentialsPath)) {
          const creds = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));
          u = creds.usuario?.trim();
          s = creds.senha;
        }
      }
    }

    if (!u || !s) {
      throw new Error("Credenciais não encontradas. Configure as variáveis de ambiente ou config/credentials.json");
    }

    const payload = new URLSearchParams({
      loginOp: "login",
      username: u,
      password: s,
      client: "preferred"
    }).toString();

    const res = await this.request(
      {
        method: "POST",
        path: "/",
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      },
      payload
    );

    if (res.status === 302 || this.cookies["ZM_AUTH_TOKEN"]) {
      return true;
    }
    throw new Error(`Falha no login Zimbra: HTTP ${res.status}`);
  }

  async buscar(query = "", limit = 50, offset = 0) {
    if (this.offline) {
      const fixturePath = path.resolve(__dirname, "..", "test", "fixtures", "zimbra_buscar.json");
      if (fs.existsSync(fixturePath)) {
        return JSON.parse(fs.readFileSync(fixturePath, "utf8"));
      }
      return { m: [] };
    }

    const qs = new URLSearchParams({ limit, offset });
    if (query) qs.set("query", query);
    
    const res = await this.request({
      method: "GET",
      path: `/home/~/inbox.json?${qs.toString()}`
    });

    if (res.status !== 200) {
      throw new Error(`Erro ao buscar e-mails: HTTP ${res.status}`);
    }
    return res.json;
  }

  async lerThread(id) {
    if (this.offline) {
      const fixturePath = path.resolve(__dirname, "..", "test", "fixtures", "zimbra_thread.json");
      if (fs.existsSync(fixturePath)) {
        return JSON.parse(fs.readFileSync(fixturePath, "utf8"));
      }
      return {};
    }

    const res = await this.request({
      method: "GET",
      path: `/home/~/?id=${encodeURIComponent(id)}&fmt=json`
    });

    if (res.status !== 200) {
      throw new Error(`Erro ao ler thread ${id}: HTTP ${res.status}`);
    }
    return res.json;
  }

  async listarPastas() {
    if (this.offline) {
      const fixturePath = path.resolve(__dirname, "..", "test", "fixtures", "zimbra_pastas.json");
      if (fs.existsSync(fixturePath)) {
        return JSON.parse(fs.readFileSync(fixturePath, "utf8"));
      }
      return {};
    }

    const res = await this.request({
      method: "GET",
      path: "/home/~/?fmt=json"
    });

    if (res.status !== 200) {
      throw new Error(`Erro ao listar pastas: HTTP ${res.status}`);
    }
    return res.json;
  }
}

module.exports = { ZimbraClient };
