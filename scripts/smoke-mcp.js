#!/usr/bin/env node
"use strict";

const path = require("node:path");
const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { StdioClientTransport } = require("@modelcontextprotocol/sdk/client/stdio.js");

async function main() {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [path.join(__dirname, "..", "src", "index.js")],
  });
  const client = new Client(
    { name: "mcp-saneago-smoke", version: "1.0.0" },
    { capabilities: {} }
  );
  await client.connect(transport);
  try {
    const listed = await client.listTools();
    const result = await client.callTool({
      name: "saneago_consultar_roteiro",
      arguments: { codigo: "ECO303" },
    });
    const text = result.content?.find((item) => item.type === "text")?.text || "";
    if (result.isError || !text.includes("ECO303")) {
      throw new Error("Consulta local ECO303 nao retornou o roteiro esperado.");
    }
    console.log(JSON.stringify({ ok: true, tools: listed.tools.length }));
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error.message }));
  process.exit(1);
});
