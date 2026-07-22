const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const INDICE_PATH = path.join(ROOT_DIR, 'config', 'indice_capacidades.json');

function removerAcentos(str) {
  return (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

/**
 * Mapeia termos comuns da pergunta para nomes de filtros reconhecidos.
 */
function inferirFiltrosDaPergunta(perguntaNorm) {
  const filtros = new Set();

  if (/per[ií]odo|data.*ini|data.*fim|dt.*ini|dt.*fim|de:.*at[eé]|intervalo|ultimos.*meses|meses|dias/i.test(perguntaNorm)) {
    filtros.add('periodo');
  }
  if (/cidade|munic[ií]pio|goi[aâ]nia|an[aá]polis|aparecida/i.test(perguntaNorm)) {
    filtros.add('cidade');
  }
  if (/bairro|setor|maracan[aã]/i.test(perguntaNorm)) {
    filtros.add('bairro');
  }
  if (/logradouro|rua|endere[çc]o|avenida|ada centine/i.test(perguntaNorm)) {
    filtros.add('logradouro');
  }
  if (/\bconta\b|n[uú]m.*conta|nr.*conta|fatura/i.test(perguntaNorm)) {
    filtros.add('conta');
  }
  if (/\bra\b|registro.*atendimento|n[uú]m.*ra|nr.*ra/i.test(perguntaNorm)) {
    filtros.add('ra');
  }
  if (/\bcpf\b|\bcnpj\b|documento/i.test(perguntaNorm)) {
    filtros.add('cpf_cnpj');
  }
  if (/\bnome\b|titular|cliente|interessado|solicitante|marcos/i.test(perguntaNorm)) {
    filtros.add('nome');
  }
  if (/matr[ií]cula/i.test(perguntaNorm)) {
    filtros.add('matricula');
  }
  if (/hidr[oô]metro|medidor/i.test(perguntaNorm)) {
    filtros.add('hidrometro');
  }
  if (/servi[çc]o|c[oó]d.*serv/i.test(perguntaNorm)) {
    filtros.add('codigo_servico');
  }
  if (/\buo\b|unidade.*organiz/i.test(perguntaNorm)) {
    filtros.add('uo');
  }

  return Array.from(filtros);
}

function descobrirAplicacao(params = {}) {
  const { pergunta, filtros: filtrosFiltro, vertical, limite = 10, indicePath = INDICE_PATH } = params;

  if (!fs.existsSync(indicePath)) {
    throw new Error(`Índice de capacidades não encontrado em: ${indicePath}. Execute 'node src/gerar_indice_capacidades.js' primeiro.`);
  }

  const indice = JSON.parse(fs.readFileSync(indicePath, 'utf8'));
  const aplicacoes = indice.aplicacoes || [];

  const perguntaNorm = removerAcentos(pergunta || '');
  const verticalNorm = removerAcentos(vertical || '');
  const filtrosDesejados = (filtrosFiltro || []).map(f => removerAcentos(f));

  if (perguntaNorm) {
    const filtrosInferidos = inferirFiltrosDaPergunta(perguntaNorm);
    for (const f of filtrosInferidos) {
      if (!filtrosDesejados.includes(f)) {
        filtrosDesejados.push(f);
      }
    }
  }

  const tokenPergunta = perguntaNorm.split(/\s+/).filter(t => t.length > 2);
  const resultados = [];

  for (const app of aplicacoes) {
    let score = 0;
    const porQueCasou = [];

    // Filtro de vertical estrito se especificado
    if (verticalNorm) {
      const vertAppNorm = removerAcentos(app.vertical || '');
      if (vertAppNorm !== verticalNorm) {
        continue;
      }
      porQueCasou.push(`Vertical casada: ${app.vertical}`);
      score += 5;
    }

    // Match de codigo exato
    if (perguntaNorm && app.codigo.toLowerCase() === perguntaNorm) {
      score += 50;
      porQueCasou.push(`Código de aplicação exato: ${app.codigo}`);
    } else if (perguntaNorm && app.codigo.toLowerCase().includes(perguntaNorm)) {
      score += 20;
      porQueCasou.push(`Código de aplicação contido na busca: ${app.codigo}`);
    }

    // Match de nome de app
    const nomeNorm = removerAcentos(app.nome || '');
    if (perguntaNorm && nomeNorm.includes(perguntaNorm)) {
      score += 15;
      porQueCasou.push(`Nome da aplicação casa com a busca: "${app.nome}"`);
    } else if (tokenPergunta.length > 0) {
      const matchedTokens = tokenPergunta.filter(t => nomeNorm.includes(t));
      if (matchedTokens.length > 0) {
        score += matchedTokens.length * 4;
        porQueCasou.push(`Termos do nome casados: ${matchedTokens.join(', ')}`);
      }
    }

    // Match de filtros aceitos
    const appFiltros = (app.filtros || []).map(f => removerAcentos(f));

    for (const fd of filtrosDesejados) {
      if (appFiltros.includes(fd)) {
        score += 15;
        porQueCasou.push(`Filtro aceito pela tela: ${fd}`);
      }
    }

    // Match em colunas retornadas
    if (tokenPergunta.length > 0 && Array.isArray(app.colunas_retornadas)) {
      const colunasNorm = app.colunas_retornadas.map(c => removerAcentos(c));
      const colunasCasadas = [];
      for (const col of colunasNorm) {
        for (const token of tokenPergunta) {
          if (col.includes(token) && !colunasCasadas.includes(col)) {
            colunasCasadas.push(col);
          }
        }
      }
      if (colunasCasadas.length > 0) {
        score += colunasCasadas.length * 6;
        porQueCasou.push(`Colunas de retorno correspondentes: ${colunasCasadas.join(', ')}`);
      }
    }

    // Match em perguntas que responde
    if (tokenPergunta.length > 0 && Array.isArray(app.perguntas_que_responde)) {
      let perguntasCasadasCount = 0;
      for (const p of app.perguntas_que_responde) {
        const pNorm = removerAcentos(p);
        const matched = tokenPergunta.filter(t => pNorm.includes(t));
        if (matched.length >= 2) {
          perguntasCasadasCount++;
        }
      }
      if (perguntasCasadasCount > 0) {
        score += perguntasCasadasCount * 5;
        porQueCasou.push(`Responde a ${perguntasCasadasCount} intenções relacionadas`);
      }
    }

    if (app.erro) {
      score = Math.floor(score * 0.2);
    } else if (app.confiabilidade === 'alta') {
      score += 5;
    } else if (app.confiabilidade === 'media') {
      score += 2;
    }

    if (score > 0 && porQueCasou.length > 0) {
      resultados.push({
        score,
        app: {
          codigo: app.codigo,
          nome: app.nome,
          url_real: app.url_real,
          filtros: app.filtros,
          colunas_retornadas: app.colunas_retornadas,
          por_que_casou: porQueCasou
        }
      });
    }
  }

  resultados.sort((a, b) => b.score - a.score);

  const top = resultados.slice(0, limite).map(r => r.app);

  if (top.length === 0) {
    return {
      ok: true,
      mensagem: "Nenhuma aplicação encontrada com os critérios fornecidos.",
      filtros_pesquisados: filtrosDesejados,
      candidatas: []
    };
  }

  return {
    ok: true,
    total_encontrado: resultados.length,
    filtros_pesquisados: filtrosDesejados,
    candidatas: top
  };
}

module.exports = {
  descobrirAplicacao
};
