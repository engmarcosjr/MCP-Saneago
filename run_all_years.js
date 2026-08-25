"use strict";

/**
 * Orquestrador de Extração Multiano do DocFlow (Saneago)
 *
 * Executa a extração em massa ano a ano sequencialmente (2025, 2024, 2023...),
 * processando cada ano com 20 workers HTTP concorrentes.
 *
 * Uso:
 *   node run_all_years.js [ano_inicio] [ano_fim] [max_id_estimado] [concorrencia]
 * Exemplo:
 *   node run_all_years.js 2025 2020 15000 20
 */

const { runParallelBatch } = require("./docflow_consulta_massa_2026");

const START_YEAR = parseInt(process.argv[2] || "2025", 10);
const END_YEAR = parseInt(process.argv[3] || "2020", 10);
const MAX_ID = parseInt(process.argv[4] || "99999", 10);
const CONCURRENCY = parseInt(process.argv[5] || "20", 10);

async function main() {
  console.log("==================================================================");
  console.log("ORQUESTRADOR DE EXTRAÇÃO EM MASSA MULTIANO");
  console.log(`Anos a extrair: de ${START_YEAR} até ${END_YEAR}`);
  console.log(`Concorrência: ${CONCURRENCY} workers em paralelo por ano`);
  console.log("==================================================================\n");

  const step = START_YEAR >= END_YEAR ? -1 : 1;

  for (let ano = START_YEAR; step === -1 ? ano >= END_YEAR : ano <= END_YEAR; ano += step) {
    const anoStr = String(ano);
    console.log(`\n🚀 INICIANDO PROCESSAMENTO DO ANO ${anoStr}...`);
    try {
      await runParallelBatch(anoStr, 1, MAX_ID, CONCURRENCY);
    } catch (err) {
      console.error(`❌ Erro durante processamento do ano ${anoStr}:`, err.message);
    }
  }

  console.log("\n✨ TODOS OS ANOS SOLICITADOS FORAM PROCESSADOS!");
}

main().catch(console.error);
