"use strict";

const fs = require("fs");
const path = require("path");

const BASE_ASFALTO = "/Users/macbookmj/repos/Asfalto-Pendentes/output";

/**
 * Busca por logradouro, rua, bairro e/ou quadra nas planilhas e caches locais de asfalto.
 */
async function pesquisarAsfaltoLocal({ rua, bairro, quadra, ra }) {
  const ruaNorm = (rua || "").toLowerCase().trim();
  const bairroNorm = (bairro || "").toLowerCase().trim();
  const quadraNorm = (quadra || "").toLowerCase().trim();
  const raNorm = (ra || "").trim();

  if (!ruaNorm && !bairroNorm && !quadraNorm && !raNorm) {
    throw new Error("Informe pelo menos um parâmetro para a busca: rua, bairro, quadra ou ra.");
  }

  const resultados = [];

  // 1. Pesquisar no cache JSON de laudos
  const cachePath = path.join(BASE_ASFALTO, "_laudo_cache.json");
  if (fs.existsSync(cachePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
      if (Array.isArray(data)) {
        for (const item of data) {
          const logr = str(item.logradouro);
          const bai = str(item.bairro);
          const qd = str(item.quadra);
          const numRa = str(item.ra);

          let match = true;
          if (ruaNorm && !logr.includes(ruaNorm)) match = false;
          if (bairroNorm && !bai.includes(bairroNorm) && !bai.replace("y", "i").includes(bairroNorm)) match = false;
          if (quadraNorm && qd !== quadraNorm && !qd.includes(quadraNorm)) match = false;
          if (raNorm && numRa !== raNorm) match = false;

          if (match) {
            resultados.push({
              fonte: "_laudo_cache.json",
              ra: item.ra,
              programacao: item.programacao,
              codigo: item.codigo,
              dataExecucao: item.data_execucao,
              situacaoRa: item.situacao_ra,
              logradouro: item.logradouro,
              bairro: item.bairro,
              quadra: item.quadra,
              lote: item.lote,
              laudo: item.laudo
            });
          }
        }
      }
    } catch (e) {
      // Ignore cache parse error
    }
  }

  // 2. Limitar a no máximo 15 registros para não estourar contexto
  const totalEncontrado = resultados.length;
  const exibidos = resultados.slice(0, 15);

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          sucesso: true,
          parametros: { rua, bairro, quadra, ra },
          totalEncontrado,
          registros: exibidos
        }, null, 2)
      }
    ]
  };
}

function str(v) {
  return String(v || "").toLowerCase().trim();
}

module.exports = { pesquisarAsfaltoLocal };
