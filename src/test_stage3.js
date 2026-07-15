const { abrirApp } = require("./portal");
const { inspecionarTela } = require("./inspector");
const { closeSession } = require("./session");

async function main() {
  console.log("=== INICIANDO TESTE ETAPA 3: INSPETOR DE TELA ===");
  
  try {
    const nomeApp = "ECO701 - REGISTRO DE ATENDIMENTO";
    const frame = await abrirApp(nomeApp);
    
    if (frame) {
      console.log(`\nFrame localizado, inspecionando...`);
      
      const relatorio = await inspecionarTela(frame);
      
      console.log("\n=== RELATORIO DE TELA ===");
      console.log(JSON.stringify(relatorio, null, 2));
      
      if (relatorio.inputs.length > 0 || relatorio.buttons.length > 0) {
        console.log("\nSucesso! Elementos interativos encontrados.");
        console.log("=== TESTE ETAPA 3 PASSOU COM SUCESSO ===");
      } else {
        console.error("\nFalha: Nenhum elemento encontrado (Pode indicar que a aplicacao ainda estava carregando ou a logica falhou).");
        process.exitCode = 1;
      }
    } else {
      console.error("\nFalha: Frame nao retornado.");
      process.exitCode = 1;
    }
  } catch (error) {
    console.error("\nErro durante o teste da Etapa 3:", error);
    process.exitCode = 1;
  } finally {
    await closeSession();
  }
}

main();
