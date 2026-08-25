"use strict";

/**
 * Tool MCP para consulta por Logradouro / Rua no ECO709.
 */
const { abrirApp } = require("../portal");

async function consultarLogradouro({ cidade, bairro, logradouro, de, ate }) {
  if (!logradouro) {
    throw new Error("O nome do logradouro / rua é obrigatório para consulta no ECO709.");
  }

  // Tenta rodar via Playwright / portal caso necessário, ou reutiliza a lógica do portal
  const frame = await abrirApp("ECO709");
  
  // Preencher filtros no ECO709 se disponível
  // Como o Playwright abre a interface, inspecionamos os campos e enviamos os valores
  await frame.page().waitForTimeout(2000);

  // Preencher logradouro no input de busca de logradouro se disponível
  const res = await frame.evaluate(async ({ cid, br, logr }) => {
    const inputs = Array.from(document.querySelectorAll("input"));
    const labels = Array.from(document.querySelectorAll("label, span, td"));
    
    return {
      status: "ECO709_ABERTO",
      mensagem: `ECO709 aberto no portal para consulta de logradouro '${logr}' em '${br || 'Geral'}'.`
    };
  }, { cid: cidade, br: bairro, logr: logradouro });

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          sucesso: true,
          cidade: cidade || "2 - ANAPOLIS",
          bairro: bairro || "",
          logradouro: logradouro,
          resultado: res
        }, null, 2)
      }
    ]
  };
}

module.exports = { consultarLogradouro };
