"use strict";

const { SupervisorioHttpClient } = require("./src/supervisorio_http");
const fs = require("fs");

async function main() {
  const client = new SupervisorioHttpClient();
  console.log("1. Autenticando no Supervisório Web...");
  await client.login();
  console.log("Autenticado com sucesso!");

  // Dates for last 2 days
  const now = new Date();
  const dFinal = now.toISOString().slice(0, 10);
  const d2DaysAgo = new Date(now.getTime() - 2 * 24 * 3600 * 1000);
  const dInicial = d2DaysAgo.toISOString().slice(0, 10);

  console.log(`2. Consultando histórico de ${dInicial} até ${dFinal} para componentes 243397 (RAP) e 243408 (Bomba B1)...`);
  const data = await client.consultarHistorico([243397, 243408], dInicial, dFinal, "00:00:00", "23:59:59", 6);

  console.log("Total de leituras retornadas:", Array.isArray(data) ? data.length : typeof data);
  if (Array.isArray(data) && data.length > 0) {
    console.log("Primeira leitura:", data[0]);
    console.log("Última leitura:", data[data.length - 1]);
    fs.writeFileSync("scratch_goialandia_ultimos_2dias.json", JSON.stringify(data, null, 2));
    console.log("Salvo em scratch_goialandia_ultimos_2dias.json");
  } else {
    console.log("Retorno bruto:", JSON.stringify(data));
  }
}

main().catch(err => {
  console.error("ERRO:", err);
  process.exit(1);
});
