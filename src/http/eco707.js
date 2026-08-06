"use strict";

const { PortalHttp } = require("./portal-http");

const CAMINHO = "/prt/eco/ECO707ConsultaRAConta.zul";

function extrairLinhas(bruto) {
  const texto = String(bruto || "");
  const celulas = [...texto.matchAll(/'zul\.sel\.Listcell','[^']+',\{([^}]*)\}/g)]
    .map((m) => {
      const rot = m[1].match(/label:'((?:[^'\\]|\\.)*)'/);
      return rot ? desescapar(rot[1]) : "";
    });

  const linhas = [];
  for (let i = 0; i + 4 < celulas.length; i += 1) {
    const ra = (celulas[i] || "").trim();
    if (!/^\d{9,11}$/.test(ra)) continue;
    const [, inicio, execucao, situacao, servico] = celulas.slice(i, i + 5);
    linhas.push({
      ra,
      inicio: (inicio || "").trim(),
      execucao: (execucao || "").trim(),
      situacao: (situacao || "").trim(),
      servico: (servico || "").trim(),
      codigo: ((servico || "").match(/^(\d{3,4})/) || [])[1] || "",
    });
  }
  return linhas;
}

function desescapar(s) {
  return String(s)
    .replace(/\\u([0-9A-Fa-f]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\x([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\'/g, "'");
}

class Eco707 {
  constructor(options = {}) {
    this.portal = new PortalHttp(options);
  }

  login() {
    return this.portal.login();
  }

  async abrir() {
    this.tela = await this.portal.abrir(CAMINHO);
    this.campo = this.tela.uuid("intbxConta");
    this.botao = this.tela.uuid("btnConsultar");
    if (!this.campo || !this.botao) {
      throw new Error("Tela ECO707 não autenticada ou componentes ausentes (intbxConta/btnConsultar)");
    }
    return this.tela;
  }

  async consultar(conta, { reusar = true } = {}) {
    if (!reusar || !this.tela) {
      await this.abrir();
    }
    const tela = this.tela;
    const r = await this.portal.preencherEConsultar(
      tela,
      [{ uuid: this.campo, valor: String(conta).replace(/\D/g, ""), numerico: true }],
      this.botao
    );

    const nomeMatch = r.text.match(/["']_value["']\s*,\s*["']([^"']+)["']/i) || r.text.match(/_value\s*:\s*['"]([^"']+)['"]/i);
    const nome = nomeMatch ? desescapar(nomeMatch[1]) : "";
    return {
      conta: String(conta),
      nome,
      ras: extrairLinhas(r.text),
      bruto: r.text,
    };
  }
}

module.exports = { Eco707, extrairLinhas, CAMINHO };
