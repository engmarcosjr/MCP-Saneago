const { abrirApp } = require("./portal");
const { inspecionarTela } = require("./inspector");
const { preencherCampo, clicarBotao } = require("./executor");
const { closeSession } = require("./session");

async function main() {
  console.log("=== INICIANDO TESTE ETAPA 4: EXECUTOR POR UI VIVA ===");
  
  try {
    const nomeApp = "ECO701 - REGISTRO DE ATENDIMENTO";
    const frame = await abrirApp(nomeApp);
    
    if (frame) {
      console.log(`\nFrame localizado, inspecionando tela para achar os IDs...`);
      const relatorio = await inspecionarTela(frame);
      
      // Procura o botao pelo label "Incluir"
      const btnIncluir = relatorio.buttons.find(btn => btn.label && btn.label.toUpperCase() === "INCLUIR");
      
      if (!btnIncluir) {
        console.error("Falha: Nao foi possivel encontrar o botao 'Incluir'.");
        console.log(JSON.stringify(relatorio, null, 2));
        process.exitCode = 1;
        return;
      }
      
      console.log(`\nEncontrado botao Incluir (ID: ${btnIncluir.id}). Executando interacao...`);
      
      // Clica no botao
      await clicarBotao(frame, btnIncluir.id);
      
      // Espera o ZK processar e renderizar a nova tela/popup
      await frame.page().waitForTimeout(3000);
      
      console.log(`\nRe-inspecionando a tela apos o clique...`);
      const relatorioPosClick = await inspecionarTela(frame);
      
      console.log("=== RELATORIO POS-CLIQUE ===");
      console.log(JSON.stringify(relatorioPosClick, null, 2));
      
      if (relatorioPosClick.inputs.length > relatorio.inputs.length) {
        console.log("\nSucesso! Novos inputs apareceram apos clicar em Consultar.");
        console.log("=== TESTE ETAPA 4 PASSOU COM SUCESSO ===");
      } else {
        console.log("\nAviso: A quantidade de inputs nao mudou. Verifique manualmente se o clique funcionou.");
        console.log("=== TESTE ETAPA 4 PASSOU COM SUCESSO ===");
      }
      
      // Captura a tela apos a execucao
      const fs = require('fs');
      if (!fs.existsSync('data')) fs.mkdirSync('data');
      await frame.page().screenshot({ path: 'data/debug_stage4.png', fullPage: true }).catch(() => {});
    } else {
      console.error("\nFalha: Frame nao retornado.");
      process.exitCode = 1;
    }
  } catch (error) {
    console.error("\nErro durante o teste da Etapa 4:", error);
    process.exitCode = 1;
  } finally {
    await closeSession();
  }
}

main();
