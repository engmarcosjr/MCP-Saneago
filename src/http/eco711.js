"use strict";

const { PortalHttp } = require("./portal-http");
const { uuidByComponentId, resolverFilho } = require("./zk-tree");

const CAMINHO = "/prt/eco/ECO711ConsultaRaExecucao.zul";

function extrairLinhasECO711(bruto) {
  const texto = String(bruto || "");
  const celulas = [...texto.matchAll(/'zul\.sel\.Listcell','[^']+',\{([^}]*)\}/g)]
    .map((m) => {
      const rot = m[1].match(/label:'((?:[^'\\]|\\.)*)'/);
      return rot ? desescapar(rot[1]) : "";
    });

  const linhas = [];
  // Procura por padrões de RA (números de 9 a 11 dígitos)
  for (let i = 0; i < celulas.length; i++) {
    const ra = (celulas[i] || "").trim();
    if (!/^\d{9,11}$/.test(ra)) continue;
    
    const fatia = celulas.slice(i, i + 14);
    linhas.push({
      ra: fatia[0] || "",
      situacao: fatia[1] || "",
      dataExecucao: fatia[2] || "",
      telefone: fatia[3] || "",
      endereco: fatia[4] || "",
      numeroImovel: fatia[5] || "",
      quadra: fatia[6] || "",
      lote: fatia[7] || "",
      dataSolicitacao: fatia[8] || "",
      nome: fatia[9] || "",
      conta: fatia[10] || "",
      idLigacao: fatia[11] || "",
      servico: fatia[12] || "",
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

class Eco711 {
  constructor(options = {}) {
    this.portal = options.portal || new PortalHttp(options);
  }

  async login() {
    return this.portal.login();
  }

  async abrir() {
    this.tela = await this.portal.abrir(CAMINHO);
    this.atualizarUuids();
    return this.tela;
  }

  atualizarUuids() {
    if (!this.tela || !this.tela.texto) return;
    const t = this.tela.texto;
    this.uuidCidade = resolverFilho(t, "pesquisaCidade");
    this.uuidUnidadeExecutora = resolverFilho(t, "pesquisaUnidadeExecutora", "txtCodigo");
    this.uuidServico = resolverFilho(t, "pesquisaServicoPrestado", "txtCodigo");
    this.uuidSituacao = uuidByComponentId(t, "cmbdmnSituacaoRA");
    this.uuidDataInicial = uuidByComponentId(t, "dtbxDataInicial");
    this.uuidDataFinal = uuidByComponentId(t, "dtbxDataFinal");
    this.uuidBtnConsultar = uuidByComponentId(t, "btnConsultar");
    this.uuidListboxExecutados = uuidByComponentId(t, "lstbxRAsExecutados");
    this.uuidListboxExecucao = uuidByComponentId(t, "lstbxListaRaExecucao");
  }

  async consultar({ cidade = 2, unidadeExecutora = "A0082", servico, situacao, dataInicial = "01/07/2026", dataFinal = "07/08/2026" } = {}) {
    await this.abrir();
    const tela = this.tela;

    // POST 1: Seleciona Cidade
    if (cidade && this.uuidCidade) {
      await this.portal.http.zkau(tela.dtid, [
        { cmd: "onChange", uuid: this.uuidCidade, data: { value: Number(cidade), start: String(cidade).length } },
        { cmd: "onBlur", uuid: this.uuidCidade }
      ], tela.url);
    }

    // POST 2: Seleciona Unidade Executora
    if (unidadeExecutora && this.uuidUnidadeExecutora) {
      await this.portal.http.zkau(tela.dtid, [
        { cmd: "onChange", uuid: this.uuidUnidadeExecutora, data: { value: String(unidadeExecutora), start: String(unidadeExecutora).length } },
        { cmd: "onBlur", uuid: this.uuidUnidadeExecutora }
      ], tela.url);
    }

    // POST 3: Datas + Situação + Botão Consultar
    const parseData = (dStr) => {
      const [d, m, y] = String(dStr).split("/");
      return `${y}.${parseInt(m, 10)}.${parseInt(d, 10)}.12.0.0.0`;
    };

    const eventos = [];

    if (situacao && this.uuidSituacao) {
      eventos.push(
        { cmd: "onChange", uuid: this.uuidSituacao, data: { value: String(situacao), start: String(situacao).length } }
      );
    }

    if (dataInicial && this.uuidDataInicial) {
      eventos.push({
        cmd: "onChange",
        uuid: this.uuidDataInicial,
        data: { value: parseData(dataInicial), start: 10, "z$dateKeys": ["value"] }
      });
    }

    if (dataFinal && this.uuidDataFinal) {
      eventos.push({
        cmd: "onChange",
        uuid: this.uuidDataFinal,
        data: { value: parseData(dataFinal), start: 10, "z$dateKeys": ["value"] }
      });
    }

    eventos.push({
      cmd: "onClick",
      uuid: this.uuidBtnConsultar,
      data: { pageX: 0, pageY: 0, which: 1, x: 0, y: 0 }
    });

    let r = await this.portal.enviar(tela, eventos);

    // Se o ZK solicitou carregamento dos dados do modelo (resetDataLoader), dispara onDataLoading no listbox
    const matchLb = r.text.match(/\[\{\$u:'([^']+)'\},\["_lastoffset",0,"resetDataLoader",true/);
    if (matchLb && matchLb[1]) {
      const lbUuid = matchLb[1];
      const rData = await this.portal.http.zkau(tela.dtid, [
        { cmd: "onDataLoading", uuid: lbUuid, data: { offset: 0, number: 20 } }
      ], tela.url);
      r.text += "\n" + rData.text;
    } else if (this.uuidListboxExecutados || this.uuidListboxExecucao) {
      const targetLb = this.uuidListboxExecutados || this.uuidListboxExecucao;
      const rData = await this.portal.http.zkau(tela.dtid, [
        { cmd: "onDataLoading", uuid: targetLb, data: { offset: 0, number: 20 } }
      ], tela.url);
      r.text += "\n" + rData.text;
    }

    return {
      cidade,
      unidadeExecutora,
      servico,
      situacao,
      ras: extrairLinhasECO711(r.text),
      bruto: r.text,
    };
  }
}

module.exports = { Eco711, extrairLinhasECO711, CAMINHO };
