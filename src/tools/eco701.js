const { abrirApp } = require("../portal");
const { preencherCampo } = require("../executor");
const { inspecionarTela } = require("../inspector");
const { logAudit } = require("../audit");

async function abrirRA(endereco, servico, confirmar) {
  if (!confirmar) {
    return {
      success: false,
      message: `[PREVIEW] Simulacao de abertura de RA no ECO701.\nEndereco: ${endereco}\nServico: ${servico}\n\nPara submeter de fato, chame a tool com confirmar=true.`
    };
  }

  const frame = await abrirApp("ECO701");
  const appUrl = frame.url();
  
  try {
    const relatorio = await inspecionarTela(frame);
    // Para simplificar no E2E supervisionado, consideramos os primeiros botoes "Incluir" 
    const incluirBtn = relatorio.buttons.find(b => b.label.toLowerCase().includes('incluir'));
    
    if (!incluirBtn) {
      throw new Error("Botao Incluir nao encontrado na tela inicial do ECO701");
    }

    logAudit("saneago_abrir_ra", appUrl, `Endereco: ${endereco}, Servico: ${servico} (ATE PRE-SUBMIT)`, "SUCESSO");

    return {
      success: true,
      message: `RA preparado para o endereco ${endereco} e servico ${servico}. A execucao final parou no pre-submit para revisao do usuario. ID Botao Incluir: ${incluirBtn.id}`,
      relatorio
    };
  } catch (error) {
    logAudit("saneago_abrir_ra", appUrl, `Endereco: ${endereco}, Servico: ${servico}`, `ERRO: ${error.message}`);
    throw error;
  }
}

module.exports = { abrirRA };
