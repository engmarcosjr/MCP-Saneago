"use strict";

const assert = require("assert");
const { consultarProcessoDocflow, pesquisarProcessosDocflowLocal } = require("../src/tools/docflow");

async function testDocflowTools() {
  console.log("=== Testando ferramentas do DocFlow ===");

  // 1. Testar pesquisa local no ano 2026
  console.log("\n1. Testando pesquisarProcessosDocflowLocal...");
  const resPesquisa = await pesquisarProcessosDocflowLocal({ ano: "2026", limite: 5 });
  console.log(`Encontrados no ano 2026: ${resPesquisa.totalEncontrado}`);
  assert.strictEqual(resPesquisa.sucesso, true);
  assert.ok(Array.isArray(resPesquisa.registros));

  // 2. Testar consulta por processo individual (que exista localmente se disponível)
  console.log("\n2. Testando consultarProcessoDocflow para 13027/2026...");
  const resConsulta = await consultarProcessoDocflow({ processo: "13027/2026" });
  console.log(`Origem: ${resConsulta.origem}, Sucesso: ${resConsulta.sucesso}`);
  assert.strictEqual(resConsulta.sucesso, true);
  assert.strictEqual(resConsulta.origem, "cache_local");
  assert.ok(resConsulta.dados);

  console.log("\n✅ Todos os testes de integração do DocFlow passaram!");
}

testDocflowTools().catch(err => {
  console.error("❌ Falha no teste do DocFlow:", err);
  process.exit(1);
});
