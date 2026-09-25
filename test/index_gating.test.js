"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");
const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { StdioClientTransport } = require("@modelcontextprotocol/sdk/client/stdio.js");

const SERVER_PATH = path.join(__dirname, "..", "src", "index.js");

const WRITE_TOOLS = [
  "saneago_preencher_campo",
  "saneago_clicar_botao",
  "saneago_abrir_ra",
  "saneago_lrs105_lancar_servico",
  "saneago_eco010_efetivar_titularidade",
];

async function getToolsList(env = {}) {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [SERVER_PATH],
    env: {
      ...process.env,
      SUPERVISORIO_OFFLINE: "1",
      DOCFLOW_OFFLINE: "1",
      ZIMBRA_OFFLINE: "1",
      ...env,
    },
  });
  const client = new Client(
    { name: "test-gating-client", version: "1.0.0" },
    { capabilities: {} }
  );

  await client.connect(transport);
  const result = await client.listTools();
  await client.close();
  return (result.tools || []).map((t) => t.name);
}

test("sem flags de escrita: nenhuma tool de escrita e exposta no tools/list", async () => {
  const tools = await getToolsList({
    SANEAGO_ALLOW_WRITE: "0",
    SANEAGO_ALLOW_RA_WRITE: "0",
    SANEAGO_ALLOW_GENERIC_WRITE: "0",
    SANEAGO_ALLOW_LRS105_WRITE: "0",
    SANEAGO_ALLOW_TITULARIDADE_WRITE: "0",
  });

  for (const wt of WRITE_TOOLS) {
    assert.strictEqual(
      tools.includes(wt),
      false,
      `A ferramenta ${wt} nao deve estar presente sem flags de escrita`
    );
  }
});

test("SANEAGO_ALLOW_RA_WRITE=1 expoe apenas saneago_abrir_ra entre as de escrita", async () => {
  const tools = await getToolsList({
    SANEAGO_ALLOW_RA_WRITE: "1",
    SANEAGO_ALLOW_GENERIC_WRITE: "0",
    SANEAGO_ALLOW_LRS105_WRITE: "0",
    SANEAGO_ALLOW_WRITE: "0",
  });

  assert.strictEqual(tools.includes("saneago_abrir_ra"), true);
  assert.strictEqual(tools.includes("saneago_preencher_campo"), false);
  assert.strictEqual(tools.includes("saneago_clicar_botao"), false);
  assert.strictEqual(tools.includes("saneago_lrs105_lancar_servico"), false);
});

test("SANEAGO_ALLOW_LRS105_WRITE=1 expoe apenas saneago_lrs105_lancar_servico entre as de escrita", async () => {
  const tools = await getToolsList({
    SANEAGO_ALLOW_RA_WRITE: "0",
    SANEAGO_ALLOW_GENERIC_WRITE: "0",
    SANEAGO_ALLOW_LRS105_WRITE: "1",
    SANEAGO_ALLOW_WRITE: "0",
  });

  assert.strictEqual(tools.includes("saneago_lrs105_lancar_servico"), true);
  assert.strictEqual(tools.includes("saneago_abrir_ra"), false);
  assert.strictEqual(tools.includes("saneago_preencher_campo"), false);
  assert.strictEqual(tools.includes("saneago_clicar_botao"), false);
});

test("SANEAGO_ALLOW_TITULARIDADE_WRITE=1 expoe apenas saneago_eco010_efetivar_titularidade entre as de escrita", async () => {
  const tools = await getToolsList({
    SANEAGO_ALLOW_RA_WRITE: "0",
    SANEAGO_ALLOW_GENERIC_WRITE: "0",
    SANEAGO_ALLOW_LRS105_WRITE: "0",
    SANEAGO_ALLOW_TITULARIDADE_WRITE: "1",
    SANEAGO_ALLOW_WRITE: "0",
  });

  assert.strictEqual(tools.includes("saneago_eco010_efetivar_titularidade"), true);
  assert.strictEqual(tools.includes("saneago_abrir_ra"), false);
  assert.strictEqual(tools.includes("saneago_lrs105_lancar_servico"), false);
  assert.strictEqual(tools.includes("saneago_preencher_campo"), false);
});

test("SANEAGO_ALLOW_GENERIC_WRITE=1 expoe preencher_campo e clicar_botao", async () => {
  const tools = await getToolsList({
    SANEAGO_ALLOW_RA_WRITE: "0",
    SANEAGO_ALLOW_GENERIC_WRITE: "1",
    SANEAGO_ALLOW_LRS105_WRITE: "0",
    SANEAGO_ALLOW_WRITE: "0",
  });

  assert.strictEqual(tools.includes("saneago_preencher_campo"), true);
  assert.strictEqual(tools.includes("saneago_clicar_botao"), true);
  assert.strictEqual(tools.includes("saneago_abrir_ra"), false);
  assert.strictEqual(tools.includes("saneago_lrs105_lancar_servico"), false);
});

test("SANEAGO_ALLOW_WRITE=1 (legado) expoe todas as tools de escrita", async () => {
  const tools = await getToolsList({
    SANEAGO_ALLOW_WRITE: "1",
  });

  for (const wt of WRITE_TOOLS) {
    assert.strictEqual(
      tools.includes(wt),
      true,
      `A ferramenta ${wt} deve estar presente com SANEAGO_ALLOW_WRITE=1`
    );
  }
});
