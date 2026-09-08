const { getOrCreateSession, closeSession } = require("./session");

async function main() {
  console.log("=== INICIANDO TESTE ETAPA 1: SESSAO VIVA ===");
  
  console.log("\nTentativa 1: Obtendo ou criando sessao...");
  const session1 = await getOrCreateSession();
  const url1 = session1.page.url();
  console.log(`Sucesso! URL atual da sessao 1: ${url1}`);
  
  console.log("\nTentativa 2: Obtendo sessao novamente (deve reusar a mesma)...");
  const t0 = Date.now();
  const session2 = await getOrCreateSession();
  const url2 = session2.page.url();
  const duration = Date.now() - t0;
  
  console.log(`Sucesso! URL atual da sessao 2: ${url2}`);
  console.log(`Tempo de resposta para reuso: ${duration}ms`);
  
  const isReused = session1.page === session2.page;
  console.log(`A pagina foi reusada? ${isReused ? "SIM (Correto!)" : "NAO (Falha!)"}`);
  
  await closeSession();
  console.log("\nSessao encerrada.");
  
  if (isReused && url1.includes("principal.zul")) {
    console.log("\n=== TESTE ETAPA 1 PASSOCOM SUCESSO ===");
    process.exit(0);
  } else {
    console.error("\n=== TESTE ETAPA 1 FALHOU ===");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("Erro no teste:", e);
  process.exit(1);
});
