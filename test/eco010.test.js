"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const { efetivarTitularidade, montarResumoEco010 } = require("../src/tools/eco010");

function clienteFalso(resultado) {
  const chamadas = [];
  return {
    chamadas,
    async login() { chamadas.push("login"); },
    async preparar(args) { chamadas.push(["preparar", args]); return resultado; },
    async efetivar(args) { chamadas.push(["efetivar", args]); return resultado; },
  };
}

const PRONTO = {
  conta: "246119-6",
  status: "PRONTO_PARA_INCLUIR",
  dados: { nomeCliente: "FULANO DE TAL", cpfCliente: "123.456.789-09" },
  motivo: "8 - OFICIALIZAÇÃO DE TITULARIDADE",
  observacao: "Confirmado CPF com a Receita Federal",
};

test("preview so prepara: nunca chama efetivar e avisa que nada foi gravado", async () => {
  const cliente = clienteFalso(PRONTO);
  const r = await efetivarTitularidade({ conta: "246119-6", cpfEsperado: "12345678909", confirmar: false }, cliente);
  assert.equal(r.ok, true);
  assert.equal(r.status, "PRONTO_PARA_INCLUIR");
  assert.match(r.message, /Nada foi gravado/);
  assert.deepEqual(cliente.chamadas.map((c) => (Array.isArray(c) ? c[0] : c)), ["login", "preparar"]);
  assert.equal(cliente.chamadas[1][1].observacao, "Confirmado CPF com a Receita Federal");
});

test("preview de conta ja efetivada nao fica pronto", async () => {
  const cliente = clienteFalso({ conta: "244234-5", status: "JA_EFETIVADA", mensagens: ["Motivo 8 desabilitado"] });
  const r = await efetivarTitularidade({ conta: "244234-5", confirmar: false }, cliente);
  assert.equal(r.ok, false);
  assert.equal(r.status, "JA_EFETIVADA");
  assert.doesNotMatch(r.message, /confirmar: true/);
});

test("montarResumoEco010 mostra CPF divergente e mensagens do portal", () => {
  const texto = montarResumoEco010({
    conta: "1-1",
    status: "CPF_DIVERGENTE",
    dados: { nomeCliente: "A", cpfCliente: "111.111.111-11" },
    cpfEsperado: "22222222222",
    mensagens: ["Erro X"],
  });
  assert.match(texto, /Status: CPF_DIVERGENTE/);
  assert.match(texto, /CPF esperado: 22222222222/);
  assert.match(texto, /Portal: Erro X/);
});
