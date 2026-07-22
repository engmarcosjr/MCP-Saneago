const { abrirApp } = require("../portal");
const {
  setarCampoZk,
  confirmarCampoZk,
  clicarZk,
} = require("../executor");
const { inspecionarTela, aguardarInputPorRotulo } = require("../inspector");
const { logAudit } = require("../audit");

function validarParametrosLRS105({ ra, codigoServicoResposta }) {
  if (!ra || !String(ra).trim()) {
    throw new Error("É necessário informar o número do RA para lançamento de serviço no LRS105.");
  }
  const raLimpo = String(ra).replace(/\D/g, "");
  if (!raLimpo || raLimpo.length < 5) {
    throw new Error("Número do RA informado é inválido.");
  }
  if (!codigoServicoResposta || !String(codigoServicoResposta).trim()) {
    throw new Error("É necessário informar o código do serviço resposta a ser lançado.");
  }
  const servicoLimpo = String(codigoServicoResposta).replace(/\D/g, "");
  if (!servicoLimpo) {
    throw new Error("Código de serviço resposta inválido.");
  }
  return { ra: raLimpo, codigoServicoResposta: servicoLimpo };
}

function montarResumoLRS105(dadosConsulta, codigoServicoResposta, observacao = "") {
  return [
    { label: "R.A.", valor: dadosConsulta.ra || "" },
    { label: "Serviço Solicitado", valor: dadosConsulta.servicoSolicitado || "" },
    { label: "Distrito", valor: dadosConsulta.distrito || "" },
    { label: "Situação Atual", valor: dadosConsulta.situacao || "" },
    { label: "Código Serviço Resposta (A Lançar)", valor: codigoServicoResposta },
    { label: "Observação", valor: observacao || "Sem observação" }
  ];
}

async function lancarServicoExecutado(ra, codigoServicoResposta, confirmar = false, observacao = "") {
  const params = validarParametrosLRS105({ ra, codigoServicoResposta });

  const frame = await abrirApp("LRS105");
  const appUrl = frame.url();

  try {
    // 1. Localizar e preencher campo R.A. na tela inicial
    let raInputId = await aguardarInputPorRotulo(frame, "R.A.", { tentativas: 10, intervalo: 500 });
    if (!raInputId) {
      raInputId = await aguardarInputPorRotulo(frame, "RA", { tentativas: 5, intervalo: 500 });
    }
    if (!raInputId) {
      throw new Error("Campo 'R.A.' não encontrado na tela inicial do LRS105.");
    }

    console.error(`[LRS105] Preenchendo R.A. (${raInputId}) com ${params.ra}...`);
    await setarCampoZk(frame, raInputId, params.ra);
    await confirmarCampoZk(frame, raInputId);

    // 2. Clicar em Consultar
    let btnConsultarId = await frame.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button.z-button, a.z-button"))
        .find(b => b.innerText.trim().toUpperCase() === "CONSULTAR");
      return btn ? btn.id : null;
    });

    if (!btnConsultarId) {
      throw new Error("Botão 'Consultar' não encontrado na tela inicial do LRS105.");
    }

    console.error(`[LRS105] Clicando no botão Consultar (${btnConsultarId})...`);
    await clicarZk(frame, btnConsultarId);
    await frame.page().waitForTimeout(4000);

    // 3. Inspecionar o estado pós-consulta
    const relatorioPos = await inspecionarTela(frame);

    const extrairValor = (labelBusca) => {
      const inp = relatorioPos.inputs.find(i => (i.label || i.rotulo || "").toUpperCase().includes(labelBusca));
      return inp ? inp.valor_atual : "";
    };

    const dadosConsulta = {
      ra: extrairValor("R.A.") || params.ra,
      servicoSolicitado: extrairValor("SERVIÇO SOLICITADO") || extrairValor("SERVICO SOLICITADO"),
      distrito: extrairValor("DISTRITO"),
      situacao: extrairValor("SITUAÇÃO") || extrairValor("SITUACAO")
    };

    const resumo = montarResumoLRS105(dadosConsulta, params.codigoServicoResposta, observacao);

    const isWriteAllowed =
      process.env.SANEAGO_ALLOW_WRITE === '1' ||
      process.env.SANEAGO_ALLOW_WRITE === 'true' ||
      process.env.SANEAGO_ALLOW_LRS105_WRITE === '1' ||
      process.env.SANEAGO_ALLOW_LRS105_WRITE === 'true';

    // Se !confirmar: Retorna PREVIEW sem avançar/submeter
    if (!confirmar) {
      logAudit("saneago_lrs105_lancar_servico", appUrl, `RA: ${params.ra}, Servico: ${params.codigoServicoResposta} (PRE-SUBMIT)`, "PREVIEW");
      return {
        success: false,
        message: `[PREVIEW] Lançamento de serviço executado no LRS105 preparado para submissão.\nResumo do pré-submit:\n${JSON.stringify(resumo, null, 2)}\n\nPara efetivar a gravação real (gate humano), chame com confirmar: true.`,
        resumo,
        dadosConsulta
      };
    }

    if (!isWriteAllowed) {
      throw new Error("Ações de escrita reais estão bloqueadas pelo ambiente (SANEAGO_ALLOW_LRS105_WRITE).");
    }

    // Se confirmar for true E a flag de escrita estiver ligada (bloqueado nesta fase por ambiente)
    throw new Error("Submissão real bloqueada: gate humano supervisionado de Marcos Jr necessário.");

  } catch (error) {
    logAudit("saneago_lrs105_lancar_servico", appUrl, `RA: ${params.ra}, Servico: ${params.codigoServicoResposta}`, `ERRO: ${error.message}`);
    throw error;
  }
}

module.exports = {
  lancarServicoExecutado,
  validarParametrosLRS105,
  montarResumoLRS105
};
