"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const {
  validarParametrosLRS105,
  montarResumoLRS105
} = require("../src/tools/lrs105");

test("validarParametrosLRS105 aceita RA e código de serviço válidos", () => {
  const result = validarParametrosLRS105({
    ra: "27273762025",
    codigoServicoResposta: "2002"
  });
  assert.deepStrictEqual(result, {
    ra: "27273762025",
    codigoServicoResposta: "2002"
  });
});

test("validarParametrosLRS105 limpa caracteres não numéricos", () => {
  const result = validarParametrosLRS105({
    ra: "2727376-2025",
    codigoServicoResposta: "2002-A"
  });
  assert.deepStrictEqual(result, {
    ra: "27273762025",
    codigoServicoResposta: "2002"
  });
});

test("validarParametrosLRS105 rejeita RA ausente ou inválido", () => {
  assert.throws(
    () => validarParametrosLRS105({ ra: "", codigoServicoResposta: "2002" }),
    /número do RA/i
  );
  assert.throws(
    () => validarParametrosLRS105({ ra: "123", codigoServicoResposta: "2002" }),
    /inválido/i
  );
  assert.throws(
    () => validarParametrosLRS105({ ra: null, codigoServicoResposta: "2002" }),
    /número do RA/i
  );
});

test("validarParametrosLRS105 rejeita código de serviço ausente", () => {
  assert.throws(
    () => validarParametrosLRS105({ ra: "27273762025", codigoServicoResposta: "" }),
    /código do serviço resposta/i
  );
  assert.throws(
    () => validarParametrosLRS105({ ra: "27273762025", codigoServicoResposta: null }),
    /código do serviço resposta/i
  );
});

test("montarResumoLRS105 constrói array de resumo estruturado", () => {
  const consulta = {
    ra: "27273762025",
    servicoSolicitado: "VAZAMENTO EXTERNO / AGUA",
    distrito: "SUPERVISÃO DE ÁGUA E ESGOTO - ANÁPOLIS REGIÃO SUL",
    situacao: "Executado"
  };
  const resumo = montarResumoLRS105(consulta, "2002", "Serviço concluído com sucesso");
  
  assert.strictEqual(Array.isArray(resumo), true);
  assert.strictEqual(resumo.length, 6);
  assert.strictEqual(resumo[0].valor, "27273762025");
  assert.strictEqual(resumo[4].valor, "2002");
  assert.strictEqual(resumo[5].valor, "Serviço concluído com sucesso");
});
