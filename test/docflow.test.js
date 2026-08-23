const test = require("node:test");
const assert = require("node:assert");
const path = require("path");
const fs = require("fs");

process.env.DOCFLOW_DATA_DIR = path.join(__dirname, "fixtures");
process.env.DOCFLOW_OFFLINE = "1";

const {
  consultarProcessoDocflow,
  pesquisarProcessosDocflowLocal
} = require("../src/tools/docflow");

const { parseProcessoData } = require("../scratch/exploracao/docflow/docflow_consultar_processo");

test("docflow tool - consultarProcessoDocflow via cache_local", async () => {
  const result = await consultarProcessoDocflow({ processo: "14652", ano: "2026" });
  assert.strictEqual(result.sucesso, true);
  assert.strictEqual(result.origem, "cache_local");
  assert.strictEqual(result.dados.interessado, "FULANO DE TAL");
});

test("docflow tool - consultarProcessoDocflow quando nao existe (falha online)", async () => {
  // Passamos um processo que não existe no cache. O script tentará a rede.
  // Como estamos sem rede (ou sem credencial) vai falhar
  const result = await consultarProcessoDocflow({ processo: "99999", ano: "2099" });
  assert.strictEqual(result.sucesso, false);
  assert.strictEqual(result.origem, "falha_online");
  assert.ok(result.mensagem.includes("99999/2099"));
});

test("docflow tool - pesquisarProcessosDocflowLocal", async () => {
  const result = await pesquisarProcessosDocflowLocal({ termo: "FULANO" });
  assert.strictEqual(result.sucesso, true);
  assert.strictEqual(result.totalEncontrado, 1);
  assert.strictEqual(result.registros[0].interessado, "FULANO DE TAL");
});

test("docflow parser - parseProcessoData", () => {
  const htmlPath = path.join(__dirname, "fixtures", "detalhes_1309_2021.html");
  const html = fs.readFileSync(htmlPath, "utf-8");
  const parsed = parseProcessoData(html, "1309/2021");
  
  // Como o HTML é de um processo sem acesso aos tramites detalhados, o restrito deve ser true
  assert.strictEqual(parsed.restrito, true);
  assert.strictEqual(parsed.interessado, "BRAGA EMPREENDIMENTOS IMOBILIÁRIOS LTDA");
  assert.strictEqual(parsed.dadosConteudo["Autor"], "ROBERTO FERREIRA BORGES");
});
