const { abrirApp } = require("./portal");
const { closeSession } = require("./session");

async function main() {
  console.log("=== INICIANDO TESTE ETAPA 2: ABRIR APLICACAO E ACHAR FRAME ===");
  
  try {
    const nomeApp = "ECO701 - REGISTRO DE ATENDIMENTO";
    const frame = await abrirApp(nomeApp);
    
    if (frame) {
      console.log(`\nSucesso! Frame localizado corretamente.`);
      console.log(`URL do Frame: ${frame.url()}`);
      
      // Vamos verificar o que tem dentro do frame
      const html = await frame.content().catch(() => '');
      console.log(`Tamanho do HTML do frame: ${html.length} bytes`);
      
      const fs = require('fs');
      fs.writeFileSync('data/frame_content.html', html);
      
      // Procura iframes filhos (as vezes montarMenu.zul tem outro iframe dentro)
      const childFrames = frame.childFrames();
      if (childFrames.length > 0) {
        console.log(`O frame possui ${childFrames.length} iframes filhos:`);
        childFrames.forEach(cf => console.log(` - Filho URL: ${cf.url()}`));
      }
      
      console.log("\n=== TESTE ETAPA 2 PASSOU COM SUCESSO ===");
    } else {
      console.error("\nFalha: Frame nulo retornado.");
      console.error("=== TESTE ETAPA 2 FALHOU ===");
      process.exitCode = 1;
    }
  } catch (error) {
    console.error("\nErro durante o teste da Etapa 2:", error);
    process.exitCode = 1;
  } finally {
    await closeSession();
  }
}

main();
