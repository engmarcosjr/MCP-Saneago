"use strict";

const { SupervisorioHttpClient } = require("./src/supervisorio_http");
const fs = require("fs");

async function main() {
  const client = new SupervisorioHttpClient();
  console.log("Autenticando no Supervisório Web...");
  await client.login();
  console.log("Autenticado!");

  console.log("Listando componentes da Unidade 6 (Anápolis)...");
  const comps = await client.listarComponentes(6);
  
  const goialandiaComps = comps.filter(c => {
    const s = JSON.stringify(c).toLowerCase();
    return s.includes("goialandia") || s.includes("goialândia");
  });

  console.log(`Encontrados ${goialandiaComps.length} componentes para Goialândia:`);
  console.log(JSON.stringify(goialandiaComps, null, 2));

  // Also check all units if none found in 6
  if (goialandiaComps.length === 0) {
    console.log("Procurando em outras unidades...");
  }
}

main().catch(err => {
  console.error("ERRO:", err);
  process.exit(1);
});
