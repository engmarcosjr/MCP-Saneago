"use strict";

/**
 * Tool MCP para consulta por Logradouro / Rua no ECO709.
 *
 * T3 — HONESTIDADE: Esta implementação é um stub DECLARADO.
 *
 * A consulta HTTP direta ao ECO709 exige mapear os UUIDs dinâmicos dos campos internos
 * de cada macro `caixaPesquisa` (txtCodigo de pesquisaCidade, pesquisaBairro,
 * pesquisaLogradouro), conforme documentado em docs/HTTP-ECO707-ECO709.md.
 * Esse mapeamento requer sessão ativa com o portal Saneago e captura em rede —
 * impossível validar offline.
 *
 * A via Playwright também requer rede: a tela exige bairro E logradouro (não
 * funciona só por cidade), e o preenchimento de campos ZK dependentes de onChange/onBlur
 * não é confiável sem UUID capturado.
 *
 * PENDÊNCIA PRIORITÁRIA (requer rede): implementar a consulta HTTP conforme contrato em
 * docs/HTTP-ECO707-ECO709.md, capturando UUIDs via POST /prt/zkau após GET da tela.
 */

async function consultarLogradouro({ logradouro }) {
  if (!logradouro) {
    throw new Error("O nome do logradouro / rua é obrigatório para consulta no ECO709.");
  }

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          sucesso: false,
          status: "NAO_IMPLEMENTADO",
          mensagem:
            "A tool saneago_eco709_consultar_logradouro ainda não executa a consulta real. " +
            "O ECO709 requer preenchimento de bairro + logradouro via protocolo ZK com UUIDs " +
            "dinâmicos que só podem ser capturados com sessão ativa na rede Saneago. " +
            "Para obter RAs por logradouro agora, use saneago_abrir_e_inspecionar com código 'ECO709' " +
            "e preencha os campos manualmente com saneago_preencher_campo e saneago_clicar_botao " +
            "(requer SANEAGO_ALLOW_GENERIC_WRITE=1).",
          pendencia:
            "Implementar consulta HTTP ao ECO709 conforme docs/HTTP-ECO707-ECO709.md. " +
            "Requer captura dos UUIDs dinâmicos de pesquisaCidade/pesquisaBairro/pesquisaLogradouro " +
            "em sessão com rede Saneago ativa."
        }, null, 2)
      }
    ]
  };
}

module.exports = { consultarLogradouro };
