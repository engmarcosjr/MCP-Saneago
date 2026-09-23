"use strict";

const fs = require("fs");
const path = require("path");
const { SaneagoHttpClient } = require("./saneago-http");
const { extractDtid, uuidByComponentId, initialEchoes } = require("./zk-tree");
const { readCredentials, getOrCreateSession, storageStatePath } = require("../session");

class PortalHttp {
  constructor(options = {}) {
    this.baseUrl = String(options.baseUrl || process.env.SANEAGO_BASE_URL || "https://prod.saneago.com.br").replace(/\/+$/, "");
    this.portalPath = "/prt/mpt/principal.zul";
    this.http = new SaneagoHttpClient({ baseUrl: this.baseUrl });
    this.isLoggedIn = false;
  }

  get portalUrl() {
    return `${this.baseUrl}${this.portalPath}`;
  }

  async login() {
    // 1. Tentar carregar cookies do storage-state.json do Playwright
    if (fs.existsSync(storageStatePath)) {
      try {
        const state = JSON.parse(fs.readFileSync(storageStatePath, "utf8"));
        for (const cookie of state.cookies) {
          this.http.jar.cookies.set(cookie.name, cookie.value);
        }
        this.isLoggedIn = true;
        console.error("[PortalHttp] Cookies de sessão carregados com sucesso do Playwright.");
        return true;
      } catch (e) {
        console.error("[PortalHttp] Falha ao carregar cookies do storage-state.json:", e.message);
      }
    }

    // 2. Se não houver cookies válidos, rodar o login via Playwright em headless para gerá-los
    console.error("[PortalHttp] Iniciando login automático via Playwright...");
    const { closeSession } = require("../session");
    await getOrCreateSession();
    await closeSession();

    if (fs.existsSync(storageStatePath)) {
      const state = JSON.parse(fs.readFileSync(storageStatePath, "utf8"));
      for (const cookie of state.cookies) {
        this.http.jar.cookies.set(cookie.name, cookie.value);
      }
      this.isLoggedIn = true;
      console.error("[PortalHttp] Cookies de sessão renovados via Playwright.");
      return true;
    }

    throw new Error("Não foi possível autenticar o cliente HTTP usando Playwright");
  }

  /** Garantir login ativo antes de chamadas */
  async ensureLogin() {
    if (!this.isLoggedIn) {
      await this.login();
    }
  }

  /** Abre uma tela (.zul) e devolve { dtid, texto, url, uuid(id) } */
  async abrir(caminho) {
    await this.ensureLogin();
    const page = await this.http.request(caminho, { headers: { referer: this.portalUrl } });
    
    // Se a sessao tiver sido derrubada no GET
    if (/redirect.*principal\.zul/.test(page.text) || !extractDtid(page.text)) {
      console.error("[PortalHttp] Sessão expirou no GET. Forçando renovação de cookies...");
      this.isLoggedIn = false;
      this.http.jar.cookies.clear();
      if (fs.existsSync(storageStatePath)) {
        try { fs.unlinkSync(storageStatePath); } catch (e) {}
      }
      await this.login();
      const pageRetry = await this.http.request(caminho, { headers: { referer: this.portalUrl } });
      const dtid = extractDtid(pageRetry.text);
      if (!dtid) throw new Error(`Tela ${caminho} não autenticada (sem dtid) mesmo após relogin`);
      const url = `${this.baseUrl}${caminho}`;
      for (const echo of initialEchoes(pageRetry.text) || []) {
        await this.http.zkau(dtid, [{ cmd: "echo", uuid: echo.uuid, data: { "": [echo.name] } }], url);
      }
      return {
        dtid,
        url,
        caminho,
        texto: pageRetry.text,
        uuid: (id) => uuidByComponentId(pageRetry.text, id),
      };
    }

    const dtid = extractDtid(page.text);
    const url = `${this.baseUrl}${caminho}`;

    for (const echo of initialEchoes(page.text) || []) {
      await this.http.zkau(dtid, [{ cmd: "echo", uuid: echo.uuid, data: { "": [echo.name] } }], url);
    }

    return {
      dtid,
      url,
      caminho,
      texto: page.text,
      uuid: (id) => uuidByComponentId(page.text, id),
    };
  }

  /** onChange em um campo de texto/número */
  preencher(tela, uuid, valor) {
    const v = String(valor);
    return this.http.zkau(tela.dtid, [
      { cmd: "onChange", uuid, data: { value: v, start: v.length } },
    ], tela.url);
  }

  /** onClick, seguindo o echo quando a resposta pedir */
  async clicar(tela, uuid) {
    return this.enviar(tela, [
      { cmd: "onClick", uuid, data: { pageX: 0, pageY: 0, which: 1, x: 0, y: 0 } },
    ]);
  }

  /** Preenche os campos e clica no botão numa única requisição */
  preencherEConsultar(tela, campos, botaoUuid) {
    const eventos = campos
      .filter((c) => c.uuid && c.valor !== undefined && c.valor !== "")
      .map((c) => {
        const bruto = String(c.valor);
        const valor = c.numerico ? Number(bruto.replace(/\D/g, "")) : bruto;
        return { cmd: "onChange", uuid: c.uuid, data: { value: valor, start: bruto.length } };
      });
    eventos.push({ cmd: "onClick", uuid: botaoUuid, data: { pageX: 0, pageY: 0, which: 1, x: 0, y: 0 } });
    return this.enviar(tela, eventos);
  }

  /** Envia eventos e resolve o echo (a tela ZK renderiza o resultado nele) com auto-relogin se a sessão cair */
  async enviar(tela, eventos) {
    let r = await this.http.zkau(tela.dtid, eventos, tela.url);
    if (/redirect",\["principal\.zul"/.test(r.text)) {
      // Sessao expirada: refazer login e reabrir a tela
      this.isLoggedIn = false;
      this.http.jar.cookies.clear();
      if (fs.existsSync(storageStatePath)) {
        try { fs.unlinkSync(storageStatePath); } catch (e) {}
      }
      await this.login();
      const novatela = await this.abrir(tela.caminho);
      // Atualiza dtid e url na referencia da tela chamadora
      tela.dtid = novatela.dtid;
      tela.texto = novatela.texto;
      tela.url = novatela.url;
      // Tenta enviar os eventos novamente na nova tela
      r = await this.http.zkau(tela.dtid, eventos, tela.url);
    }
    const echo = String(r.text || "").match(/echo2",\[\{\$u:'([^']+)'\},"([^"]+)"\]/);
    if (!echo) return r;
    return this.http.zkau(tela.dtid, [
      { cmd: "echo", opt: "i", uuid: echo[1], data: { "": [echo[2]] } },
    ], tela.url);
  }
}

module.exports = { PortalHttp };
