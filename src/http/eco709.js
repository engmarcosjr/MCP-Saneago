"use strict";

const { PortalHttp } = require("./portal-http");
const { resolverFilho } = require("./zk-tree");

const CAMINHO = "/prt/eco/ECO709ConsultaRALogradouro.zul";

function extrairLinhasECO709(bruto) {
  const texto = String(bruto || "");
  const celulas = [...texto.matchAll(/'zul\.sel\.Listcell','[^']+',\{([^}]*)\}/g)]
    .map((m) => {
      const rot = m[1].match(/label:'((?:[^'\\]|\\.)*)'/);
      return rot ? desescapar(rot[1]) : "";
    });

  const linhas = [];
  // 10 celulas por item na lista do ECO709
  for (let i = 0; i + 9 < celulas.length; i += 1) {
    const ra = (celulas[i] || "").trim();
    if (!/^\d{9,11}$/.test(ra)) continue;
    const [, inicio, execucao, situacao, conta, nome, quadra, lote, numero, servico] = celulas.slice(i, i + 10);
    linhas.push({
      ra,
      inicio: (inicio || "").trim(),
      execucao: (execucao || "").trim(),
      situacao: (situacao || "").trim(),
      conta: (conta || "").trim(),
      nome: (nome || "").trim(),
      quadra: (quadra || "").trim(),
      lote: (lote || "").trim(),
      numero: (numero || "").trim(),
      servico: (servico || "").trim(),
      codigoServico: ((servico || "").match(/^(\d{3,4})/) || [])[1] || "",
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

class Eco709 {
  constructor(options = {}) {
    this.portal = new PortalHttp(options);
  }

  login() {
    return this.portal.login();
  }

  async abrir() {
    this.tela = await this.portal.abrir(CAMINHO);
    this.uuidCidade = resolverFilho(this.tela.texto, "pesquisaCidade", "txtCodigo");
    this.uuidBairro = resolverFilho(this.tela.texto, "pesquisaBairro", "txtCodigo");
    this.uuidLogradouro = resolverFilho(this.tela.texto, "pesquisaLogradouro", "txtCodigo");
    this.uuidServico = resolverFilho(this.tela.texto, "pesquisaServico", "txtCodigo");
    this.uuidDtbxInicial = this.tela.uuid("dtbxInicial");
    this.uuidDtbxFinal = this.tela.uuid("dtbxFinal");
    this.uuidBtnConsultar = this.tela.uuid("btnConsultar");

    if (!this.uuidCidade || !this.uuidBairro || !this.uuidLogradouro || !this.uuidBtnConsultar) {
      throw new Error("Tela ECO709: componentes de filtro essenciais não localizados");
    }
    return this.tela;
  }

  async consultar({ cidade = 2, bairro, logradouro, dataInicial = "01/01/2024", dataFinal = "31/12/2024" } = {}) {
    if (!this.tela) {
      await this.abrir();
    }
    const tela = this.tela;

    // POST 1: Cidade
    await this.portal.http.zkau(tela.dtid, [
      { cmd: "onChange", uuid: this.uuidCidade, data: { value: Number(cidade), start: String(cidade).length } },
      { cmd: "onBlur", uuid: this.uuidCidade },
    ], tela.url);

    // POST 2: Bairro
    await this.portal.http.zkau(tela.dtid, [
      { cmd: "onChange", uuid: this.uuidBairro, data: { value: Number(bairro), start: String(bairro).length } },
      { cmd: "onBlur", uuid: this.uuidBairro },
    ], tela.url);

    // POST 3: Logradouro
    await this.portal.http.zkau(tela.dtid, [
      { cmd: "onChange", uuid: this.uuidLogradouro, data: { value: String(logradouro), start: String(logradouro).length } },
      { cmd: "onBlur", uuid: this.uuidLogradouro },
    ], tela.url);

    // Formata datas ZK (ano.mes.dia...) 1-based
    const parseData = (dStr) => {
      const [d, m, y] = String(dStr).split("/");
      return `${y}.${parseInt(m, 10)}.${parseInt(d, 10)}.12.0.0.0`;
    };

    const dtIni = parseData(dataInicial);
    const dtFin = parseData(dataFinal);

    // POST 4 & 5: Datas + Consultar + Echo
    const eventos = [
      { cmd: "onChange", uuid: this.uuidDtbxInicial, data: { value: dtIni, start: 10, "z$dateKeys": ["value"] } },
      { cmd: "onChange", uuid: this.uuidDtbxFinal, data: { value: dtFin, start: 10, "z$dateKeys": ["value"] } },
      { cmd: "onClick", uuid: this.uuidBtnConsultar, data: { pageX: 0, pageY: 0, which: 1, x: 0, y: 0 } },
    ];

    const r = await this.portal.enviar(tela, eventos);

    return {
      cidade,
      bairro,
      logradouro,
      ras: extrairLinhasECO709(r.text),
      bruto: r.text,
    };
  }
}

module.exports = { Eco709, extrairLinhasECO709, CAMINHO };
