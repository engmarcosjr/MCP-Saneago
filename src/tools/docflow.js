"use strict";

const fs = require("fs");
const path = require("path");
const { parseProcessoData, consultarProcesso } = require("../../docflow_consultar_processo");

const ROOT_DIR = path.join(__dirname, "..", "..");

/**
 * Consulta um processo individual no DocFlow por número (ex: "14652/2026" ou id: 14652, ano: 2026).
 * Verifica primeiro o repositório local de dados (data_processos_YYYY/); se não encontrar, tenta buscar online.
 */
async function consultarProcessoDocflow({ processo, ano }) {
  let processoNum = String(processo || "").trim();
  let anoTarget = ano ? String(ano).trim() : "";

  if (processoNum.includes("/")) {
    const parts = processoNum.split("/");
    processoNum = parts[0].trim();
    anoTarget = parts[1].trim();
  }

  if (!processoNum || !anoTarget) {
    throw new Error("Informe o número do processo e o ano (ex: '14652/2026' ou processo: '14652', ano: '2026').");
  }

  const idLimpo = processoNum.replace(/[^0-9]/g, "");
  const anoLimpo = anoTarget.replace(/[^0-9]/g, "");
  const numFormatado = `${idLimpo}/${anoLimpo}`;

  const localFile = path.join(ROOT_DIR, `data_processos_${anoLimpo}`, `processo_${idLimpo}_${anoLimpo}.json`);

  if (fs.existsSync(localFile)) {
    try {
      const content = JSON.parse(fs.readFileSync(localFile, "utf-8"));
      return {
        sucesso: true,
        origem: "cache_local",
        arquivo: localFile,
        dados: content
      };
    } catch (e) {
      // Falha ao ler cache, tenta via rede
    }
  }

  try {
    const resultadoRede = await consultarProcesso(numFormatado);
    return {
      sucesso: true,
      origem: "requisicao_http",
      dados: resultadoRede
    };
  } catch (err) {
    return {
      sucesso: false,
      origem: "falha_online",
      mensagem: `Processo ${numFormatado} não encontrado no cache local e a consulta online retornou erro: ${err.message}`,
      cacheLocalVerificado: localFile
    };
  }
}

/**
 * Pesquisa processos no repositório local (data_processos_YYYY) por termo, interessado ou assunto.
 */
async function pesquisarProcessosDocflowLocal({ termo, interessado, assunto, ano, limite = 15 }) {
  const termoNorm = (termo || "").toLowerCase().trim();
  const interessadoNorm = (interessado || "").toLowerCase().trim();
  const assuntoNorm = (assunto || "").toLowerCase().trim();
  const anoNorm = ano ? String(ano).trim() : null;

  if (!termoNorm && !interessadoNorm && !assuntoNorm && !anoNorm) {
    throw new Error("Informe ao menos um critério de pesquisa: termo, interessado, assunto ou ano.");
  }

  const resultados = [];

  let pastasAnos = [];
  if (anoNorm) {
    pastasAnos = [`data_processos_${anoNorm}`];
  } else {
    pastasAnos = fs.readdirSync(ROOT_DIR).filter(f => f.startsWith("data_processos_"));
  }

  for (const pasta of pastasAnos) {
    const pastaPath = path.join(ROOT_DIR, pasta);
    if (!fs.existsSync(pastaPath) || !fs.statSync(pastaPath).isDirectory()) continue;

    const arquivos = fs.readdirSync(pastaPath).filter(f => f.endsWith(".json"));

    for (const arq of arquivos) {
      const filePath = path.join(pastaPath, arq);
      try {
        const item = JSON.parse(fs.readFileSync(filePath, "utf-8"));

        const inter = str(item.interessado);
        const assun = str(item.assunto);
        const obs = str(item.observacoes);
        const num = str(item.processoConsultado || item.numero);

        let match = true;

        if (interessadoNorm && !inter.includes(interessadoNorm)) match = false;
        if (assuntoNorm && !assun.includes(assuntoNorm)) match = false;
        if (termoNorm) {
          const matchTermo = inter.includes(termoNorm) || assun.includes(termoNorm) || obs.includes(termoNorm) || num.includes(termoNorm);
          if (!matchTermo) match = false;
        }

        if (match && (item.numero || item.interessado || item.assunto || (item.dadosConteudo && Object.keys(item.dadosConteudo).length > 0))) {
          resultados.push({
            processo: item.processoConsultado || num,
            interessado: item.interessado,
            assunto: item.assunto,
            tipo: item.tipo,
            dataProcesso: item.dataProcesso || item.dataCriacao,
            localizacaoAtual: item.localizacaoAtual,
            restrito: item.restrito,
            arquivo: filePath
          });

          if (resultados.length >= limite * 3) break;
        }
      } catch (e) {
        // ignora erro de parse individual
      }
    }
  }

  const totalEncontrado = resultados.length;
  const exibidos = resultados.slice(0, limite);

  return {
    sucesso: true,
    parametros: { termo, interessado, assunto, ano, limite },
    totalEncontrado,
    registros: exibidos
  };
}

function str(v) {
  return String(v || "").toLowerCase().trim();
}

module.exports = {
  consultarProcessoDocflow,
  pesquisarProcessosDocflowLocal
};
