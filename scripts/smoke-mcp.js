#!/usr/bin/env node
/**
 * smoke-mcp.js — Teste de fumaça do MCP-Saneago (Fase 15)
 *
 * Valida sem rede:
 *  1. Que o servidor sobe e responde tools/list
 *  2. Que cada tool declarada tem schema válido (type=object, properties, required consistente)
 *  3. Que tools de escrita (preencher_campo, clicar_botao, abrir_ra, lrs105_lancar_servico)
 *     NÃO aparecem quando as flags de gate estão desligadas (comportamento padrão)
 *  4. Que tools de escrita aparecem quando as flags correspondentes estão ligadas
 *  5. Que saneago_consultar_roteiro retorna dados coerentes (prova end-to-end sem rede)
 *  8. (T4-handler) Que cada tool declarada em tools/list tem handler correspondente no
 *     switch de despacho de src/index.js, e que não há cases órfãos (análise estática
 *     offline — sem rede, sem execução de tool).
 *
 * Falha (exit 1) se qualquer verificação não passar — é rede de segurança contra regressão.
 */
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { StdioClientTransport } = require("@modelcontextprotocol/sdk/client/stdio.js");

// ── Configuração ──────────────────────────────────────────────────────────────

const SERVER_PATH = path.join(__dirname, "..", "src", "index.js");

// Tools que devem estar sempre presentes (read-only, sem gate)
const TOOLS_ALWAYS = [
  "saneago_listar_aplicacoes",
  "saneago_abrir_e_inspecionar",
  "saneago_eco701_consultar_ra",
  "saneago_consultar_consumo",
  "saneago_lrs105_verificar_estatistica",
  "saneago_consultar_roteiro",
  "saneago_asfalto_da_ra",
  "saneago_descobrir_aplicacao",
  "saneago_eco709_consultar_logradouro",
  "saneago_pesquisar_asfalto_local",
  "saneago_docflow_consultar_processo",
  "saneago_docflow_listar_anexos",
  "saneago_docflow_indexar_projetos",
  "saneago_docflow_pesquisar_local",
  "saneago_supervisorio_telemetria",
  "saneago_supervisorio_historico",
  "saneago_supervisorio_minima_noturna",
  "saneago_supervisorio_listar_componentes",
  "saneago_supervisorio_listar_dmcs",
  "saneago_supervisorio_horimetro",
  "saneago_webmail_buscar",
  "saneago_webmail_ler_thread",
  "saneago_webmail_listar_pastas",
];

// Tools que DEVEM SER BLOQUEADAS sem gate (nunca devem aparecer sem a flag)
const TOOLS_WRITE_GATED = {
  saneago_preencher_campo:   "SANEAGO_ALLOW_GENERIC_WRITE",
  saneago_clicar_botao:      "SANEAGO_ALLOW_GENERIC_WRITE",
  saneago_abrir_ra:          "SANEAGO_ALLOW_RA_WRITE",
  saneago_lrs105_lancar_servico: "SANEAGO_ALLOW_LRS105_WRITE",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeClient(env = {}) {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [SERVER_PATH],
    env: { ...process.env, ...env },
  });
  const client = new Client(
    { name: "mcp-saneago-smoke", version: "2.0.0" },
    { capabilities: {} }
  );
  return { client, transport };
}

async function conectar(env = {}) {
  const { client, transport } = makeClient(env);
  await client.connect(transport);
  return client;
}

function validarSchema(tool) {
  const erros = [];
  const s = tool.inputSchema;
  if (!s) {
    erros.push("inputSchema ausente");
    return erros;
  }
  if (s.type !== "object") {
    erros.push(`inputSchema.type="${s.type}" deve ser "object"`);
  }
  if (!s.properties || typeof s.properties !== "object") {
    erros.push("inputSchema.properties ausente ou não é objeto");
  }
  if (!Array.isArray(s.required)) {
    if (s.required !== undefined) {
      erros.push("inputSchema.required deve ser array ou omitido");
    }
  } else {
    // Verifica que cada campo em required existe em properties
    for (const req of s.required) {
      if (!(s.properties && req in s.properties)) {
        erros.push(`Campo obrigatório "${req}" não está em properties`);
      }
    }
  }
  return erros;
}

// ── Testes ───────────────────────────────────────────────────────────────────

let falhas = 0;
let ok = 0;

function pass(msg) {
  ok++;
  console.log(`  ✔ ${msg}`);
}

function fail(msg) {
  falhas++;
  console.error(`  ✖ FALHA: ${msg}`);
}

async function run() {
  // ── Teste 1: servidor sobe e lista tools sem gates ──────────────────────────
  console.log("\n[1] Servidor sobe e responde tools/list (sem flags de escrita)");
  let clientePadrao;
  let toolsPadrao = [];
  try {
    clientePadrao = await conectar({
      SUPERVISORIO_OFFLINE: "1",
      DOCFLOW_OFFLINE: "1",
      ZIMBRA_OFFLINE: "1",
    });
    const listed = await clientePadrao.listTools();
    toolsPadrao = listed.tools || [];
    pass(`Servidor respondeu tools/list: ${toolsPadrao.length} tools`);
  } catch (e) {
    fail(`Servidor não subiu: ${e.message}`);
    process.exit(1);
  }

  // ── Teste 2: todas as tools obrigatórias estão presentes ──────────────────
  console.log("\n[2] Todas as tools read-only obrigatórias estão presentes");
  const nomesPadrao = new Set(toolsPadrao.map(t => t.name));
  for (const nome of TOOLS_ALWAYS) {
    if (nomesPadrao.has(nome)) {
      pass(nome);
    } else {
      fail(`Tool "${nome}" não encontrada no tools/list`);
    }
  }

  // ── Teste 3: schemas válidos ───────────────────────────────────────────────
  console.log("\n[3] inputSchema de cada tool é válido");
  for (const tool of toolsPadrao) {
    const erros = validarSchema(tool);
    if (erros.length === 0) {
      pass(`${tool.name}: schema OK`);
    } else {
      for (const e of erros) {
        fail(`${tool.name}: ${e}`);
      }
    }
  }

  // ── Teste 4: tools de escrita NÃO aparecem sem flags ──────────────────────
  console.log("\n[4] Tools de escrita estão bloqueadas sem flags de gate");
  for (const [nome] of Object.entries(TOOLS_WRITE_GATED)) {
    if (nomesPadrao.has(nome)) {
      fail(`Tool de escrita "${nome}" apareceu sem flag de gate — REGRESSÃO DE SEGURANÇA`);
    } else {
      pass(`"${nome}" corretamente ausente sem flag`);
    }
  }

  // ── Teste 5: tools de escrita APARECEM quando flag habilitada ─────────────
  console.log("\n[5] Tools de escrita aparecem com flags de gate habilitadas");
  const flagsEscrita = {
    SANEAGO_ALLOW_GENERIC_WRITE: "1",
    SANEAGO_ALLOW_RA_WRITE: "1",
    SANEAGO_ALLOW_LRS105_WRITE: "1",
    SUPERVISORIO_OFFLINE: "1",
    DOCFLOW_OFFLINE: "1",
    ZIMBRA_OFFLINE: "1",
  };
  let clienteEscrita;
  try {
    clienteEscrita = await conectar(flagsEscrita);
    const listedEscrita = await clienteEscrita.listTools();
    const nomesEscrita = new Set((listedEscrita.tools || []).map(t => t.name));

    for (const [nome, flag] of Object.entries(TOOLS_WRITE_GATED)) {
      if (nomesEscrita.has(nome)) {
        pass(`"${nome}" presente com ${flag}=1`);
        // Valida schema também
        const tool = (listedEscrita.tools || []).find(t => t.name === nome);
        if (tool) {
          const erros = validarSchema(tool);
          if (erros.length === 0) {
            pass(`${nome}: schema OK`);
          } else {
            for (const e of erros) fail(`${nome}: ${e}`);
          }
        }
      } else {
        fail(`"${nome}" deveria aparecer com ${flag}=1`);
      }
    }
    await clienteEscrita.close();
  } catch (e) {
    fail(`Servidor com flags de escrita não subiu: ${e.message}`);
  }

  // ── Teste 6: call real sem rede (saneago_consultar_roteiro) ──────────────
  console.log("\n[6] saneago_consultar_roteiro retorna dados locais (sem rede)");
  try {
    const result = await clientePadrao.callTool({
      name: "saneago_consultar_roteiro",
      arguments: { codigo: "ECO303" },
    });
    const text = result.content?.find(i => i.type === "text")?.text || "";
    if (result.isError) {
      fail(`saneago_consultar_roteiro retornou isError`);
    } else if (!text.includes("ECO303")) {
      fail(`saneago_consultar_roteiro não retornou "ECO303" no texto`);
    } else {
      pass(`saneago_consultar_roteiro(ECO303) retornou conteúdo esperado`);
    }
  } catch (e) {
    fail(`saneago_consultar_roteiro lançou exceção: ${e.message}`);
  }

  // ── Teste 7: total de tools declaradas == expected ────────────────────────
  console.log("\n[7] Contagem total de tools está no intervalo esperado");
  // Com flags desligadas: 23 tools read-only.
  // Com flags ligadas: 23 + 4 = 27 tools.
  const totalSemGate = toolsPadrao.length;
  if (totalSemGate >= 20 && totalSemGate <= 30) {
    pass(`${totalSemGate} tools sem gate (intervalo aceitável: 20–30)`);
  } else {
    fail(`${totalSemGate} tools — fora do intervalo esperado. Possível tool nova sem registro ou schema`);
  }

  // ── Teste 8 (T4-handler): cada tool declarada tem handler no switch ──────
  console.log("\n[8] (T4-handler) Cada tool declarada tem handler no switch de despacho");
  {
    // Lê src/index.js como texto puro — análise estática, sem execução
    const indexSrc = fs.readFileSync(SERVER_PATH, "utf8");

    // Extrai todos os `case "saneago_*":` do switch de despacho
    // Captura o nome entre as aspas após "case "
    const caseRe = /case\s+"(saneago_[^"]+)"\s*:/g;
    const handlers = new Set();
    let m;
    while ((m = caseRe.exec(indexSrc)) !== null) {
      handlers.add(m[1]);
    }

    // Pega todas as tools declaradas (sem gate + com gate)
    // já temos: toolsPadrao (sem gate) + TOOLS_WRITE_GATED (gated)
    const todasDeclaradas = new Set([
      ...toolsPadrao.map(t => t.name),
      ...Object.keys(TOOLS_WRITE_GATED),
    ]);

    // Verifica: declarada sem handler
    let handlerOk = 0;
    let handlerFail = 0;
    for (const nome of todasDeclaradas) {
      if (handlers.has(nome)) {
        pass(`"${nome}": handler encontrado no switch`);
        handlerOk++;
      } else {
        fail(`"${nome}": tool DECLARADA mas sem handler no switch de despacho — AUSÊNCIA DE CASE`);
        handlerFail++;
      }
    }

    // Verifica: handler órfão sem declaração (case existe mas tool não foi declarada)
    for (const nome of handlers) {
      if (!todasDeclaradas.has(nome)) {
        fail(`"${nome}": case no switch mas tool NÃO declarada em tools/list — HANDLER ÓRFÃO`);
        handlerFail++;
      }
    }

    if (handlerFail === 0) {
      console.log(`  → ${handlerOk} tools: declaração e handler 1:1 verificados`);
    }
  }

  // ── Encerramento ──────────────────────────────────────────────────────────
  try { await clientePadrao.close(); } catch (_) {}

  console.log(`\n${"─".repeat(60)}`);
  if (falhas === 0) {
    console.log(`✔  Smoke OK: ${ok} verificações, 0 falhas`);
    console.log(JSON.stringify({ ok: true, verificacoes: ok, tools: totalSemGate }));
    process.exit(0);
  } else {
    console.error(`✖  Smoke FALHOU: ${falhas} falha(s), ${ok} ok`);
    console.log(JSON.stringify({ ok: false, falhas, verificacoes: ok }));
    process.exit(1);
  }
}

run().catch(e => {
  console.error(JSON.stringify({ ok: false, error: e.message }));
  process.exit(1);
});
