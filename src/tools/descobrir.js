const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const INDICE_PATH = path.join(ROOT_DIR, 'config', 'indice_capacidades.json');

function removerAcentos(str) {
  return (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Casamento com fronteira de palavra e plural básico em português.
 */
function matchWordBoundary(textNorm, tokenNorm) {
  if (!textNorm || !tokenNorm) return false;
  const pattern = new RegExp(`\\b${escapeRegex(tokenNorm)}(s|es)?\\b`, 'i');
  return pattern.test(textNorm);
}

const STOP_WORDS = new Set([
  'pelo', 'pela', 'pelos', 'pelas', 'num', 'numa', 'nuns', 'numas',
  'por', 'para', 'com', 'sem', 'sob', 'sobre', 'entre', 'de', 'da',
  'do', 'das', 'dos', 'em', 'no', 'na', 'nos', 'nas', 'um', 'uma',
  'uns', 'umas', 'este', 'esta', 'esse', 'essa', 'que', 'qual', 'quais',
  'como', 'onde', 'quando'
]);

/**
 * Expande sinônimos e abreviações comuns do domínio Saneago.
 */
function expandirTokensDomain(tokens) {
  const expanded = new Set(tokens);
  for (const t of tokens) {
    if (t === 'ra' || t === 'ras') {
      expanded.add('registro');
      expanded.add('atendimento');
    }
    if (t === 'cpf' || t === 'cnpj') {
      expanded.add('documento');
      expanded.add('cpf_cnpj');
    }
    if (t === 'proprietario' || t === 'proprietaria' || t === 'titular') {
      expanded.add('nome');
      expanded.add('usuario');
    }
    if (t === 'fatura' || t === 'faturas' || t === 'debito' || t === 'debitos') {
      expanded.add('fatura');
      expanded.add('debito');
      expanded.add('extrato');
    }
  }
  return Array.from(expanded);
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
  if (/\bcontas?\b|n[uú]m.*conta|nr.*conta|fatura/i.test(perguntaNorm)) {
    filtros.add('conta');
  }
  if (/\bras?\b|registro.*atendimento|n[uú]m.*ra|nr.*ra/i.test(perguntaNorm)) {
    filtros.add('ra');
  }
  if (/\bcpf\b|\bcnpj\b|documento/i.test(perguntaNorm)) {
    filtros.add('cpf_cnpj');
  }
  if (/\bnome\b|titular|cliente|interessado|solicitante|marcos|antonio|propriet[aá]rio/i.test(perguntaNorm)) {
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

  const baseTokens = perguntaNorm
    .split(/[\s,./\-():;]+/)
    .filter(t => t.length > 1 && !STOP_WORDS.has(t));

  const tokenPergunta = expandirTokensDomain(baseTokens);

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

    // 1. Match de codigo exato ou contido
    let codeScore = 0;
    if (perguntaNorm && app.codigo.toLowerCase() === perguntaNorm) {
      codeScore += 100;
      porQueCasou.push(`Código de aplicação exato: ${app.codigo}`);
    } else if (perguntaNorm && app.codigo.toLowerCase().includes(perguntaNorm) && perguntaNorm.length >= 3) {
      codeScore += 40;
      porQueCasou.push(`Código de aplicação contido na busca: ${app.codigo}`);
    }

    // 2. Match de nome/título da aplicação (fronteira de palavras e teto)
    let nameScore = 0;
    const nomeNorm = removerAcentos(app.nome || '');
    if (perguntaNorm && (nomeNorm.includes(perguntaNorm) || perguntaNorm.includes(nomeNorm))) {
      nameScore += 40;
      porQueCasou.push(`Nome da aplicação casa com a busca: "${app.nome}"`);
    } else if (tokenPergunta.length > 0) {
      const matchedTokens = tokenPergunta.filter(t => matchWordBoundary(nomeNorm, t));
      if (matchedTokens.length > 0) {
        const rawTokensScore = matchedTokens.length * 10;
        const cappedTokensScore = Math.min(30, rawTokensScore); // Teto: 30
        nameScore += cappedTokensScore;
        porQueCasou.push(`Termos do nome casados (${matchedTokens.join(', ')}): +${cappedTokensScore}`);
      }
    }

    // 3. Match de filtros aceitos (SINAL DOMINANTE) & cobertura de saída em colunas
    let filterScore = 0;
    const appFiltros = (app.filtros || []).map(f => removerAcentos(f));
    const appColunasNorm = (app.colunas_retornadas || []).map(c => removerAcentos(c));

    const filtrosEntradaCasados = [];
    const filtrosSaidaCasados = [];
    const coveredFilters = new Set();

    for (const fd of filtrosDesejados) {
      if (appFiltros.includes(fd)) {
        filtrosEntradaCasados.push(fd);
        coveredFilters.add(fd);
      } else if (appColunasNorm.some(col => matchWordBoundary(col, fd))) {
        filtrosSaidaCasados.push(fd);
        coveredFilters.add(fd);
      }
    }

    if (coveredFilters.size > 0) {
      // 40 pts por filtro de entrada, 35 pts por coluna de saída que atende ao filtro pedido
      const ptsEntrada = filtrosEntradaCasados.length * 40;
      const ptsSaida = filtrosSaidaCasados.length * 35;
      const coberturaRatio = filtrosDesejados.length > 0 ? (coveredFilters.size / filtrosDesejados.length) : 1;
      const ptsCobertura = Math.round(coberturaRatio * 30);

      filterScore += (ptsEntrada + ptsSaida + ptsCobertura);
      porQueCasou.push(`Filtros atendidos (entrada: [${filtrosEntradaCasados.join(', ')}], saída: [${filtrosSaidaCasados.join(', ')}]): +${ptsEntrada + ptsSaida} (cobertura ${Math.round(coberturaRatio * 100)}%: +${ptsCobertura})`);
    }

    // 4. Match em colunas retornadas (Sinal fraco com fronteira de palavras e Teto: 25)
    let colunasScore = 0;
    if (tokenPergunta.length > 0 && Array.isArray(app.colunas_retornadas)) {
      const colunasCasadas = [];
      for (const col of appColunasNorm) {
        for (const token of tokenPergunta) {
          if (matchWordBoundary(col, token) && !colunasCasadas.includes(col)) {
            colunasCasadas.push(col);
          }
        }
      }
      if (colunasCasadas.length > 0) {
        const rawColunasScore = colunasCasadas.length * 5;
        colunasScore = Math.min(25, rawColunasScore); // Teto: 25
        porQueCasou.push(`Colunas de retorno correspondentes (${colunasCasadas.length} colunas): +${colunasScore}`);
      }
    }

    // 5. Match em perguntas que responde (Sinal fraco com Teto: 20)
    let perguntasScore = 0;
    if (tokenPergunta.length > 0 && Array.isArray(app.perguntas_que_responde)) {
      let perguntasCasadasCount = 0;
      for (const p of app.perguntas_que_responde) {
        const pNorm = removerAcentos(p);
        const matched = tokenPergunta.filter(t => matchWordBoundary(pNorm, t));
        if (matched.length >= 2) {
          perguntasCasadasCount++;
        }
      }
      if (perguntasCasadasCount > 0) {
        const rawPergScore = perguntasCasadasCount * 5;
        perguntasScore = Math.min(20, rawPergScore); // Teto: 20
        porQueCasou.push(`Responde a ${perguntasCasadasCount} intenções relacionadas: +${perguntasScore}`);
      }
    }

    // Soma parcial
    let totalAppScore = score + codeScore + nameScore + filterScore + colunasScore + perguntasScore;

    // Penalidade explícita se a pergunta exigiu/inferiu filtros mas a app NÃO atendeu a NENHUM filtro de entrada nem coluna de saída
    if (filtrosDesejados.length > 0 && coveredFilters.size === 0) {
      totalAppScore = Math.floor(totalAppScore * 0.1); // Redução drástica
      porQueCasou.push(`Penalidade por não atender a nenhum filtro/coluna solicitado (${filtrosDesejados.join(', ')})`);
    }

    // Ajustes por confiabilidade e erro
    if (app.erro) {
      totalAppScore = Math.floor(totalAppScore * 0.1);
    } else if (app.confiabilidade === 'alta') {
      totalAppScore += 5;
    } else if (app.confiabilidade === 'media') {
      totalAppScore += 2;
    }

    // Limiar de relevância mínimo (Corte de Cauda)
    const MIN_SCORE = 25;
    if (totalAppScore >= MIN_SCORE && porQueCasou.length > 0) {
      resultados.push({
        score: totalAppScore,
        coveredFiltersCount: coveredFilters.size,
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

  if (resultados.length === 0) {
    return {
      ok: true,
      mensagem: "Nenhuma aplicação encontrada com os critérios fornecidos.",
      filtros_pesquisados: filtrosDesejados,
      candidatas: [],
      confianca: "baixa"
    };
  }

  const top = resultados.slice(0, limite).map(r => r.app);
  const topoResult = resultados[0];

  // Cálculo da confiança da resposta
  let confianca = "baixa";
  if (filtrosDesejados.length > 0) {
    if (topoResult.coveredFiltersCount >= filtrosDesejados.length && topoResult.score >= 50) {
      confianca = "alta";
    } else if (topoResult.coveredFiltersCount > 0 && topoResult.score >= 35) {
      confianca = "media";
    } else {
      confianca = "baixa";
    }
  } else {
    if (topoResult.score >= 50) {
      confianca = "alta";
    } else if (topoResult.score >= 30) {
      confianca = "media";
    } else {
      confianca = "baixa";
    }
  }

  return {
    ok: true,
    total_encontrado: resultados.length,
    filtros_pesquisados: filtrosDesejados,
    candidatas: top,
    confianca
  };
}

module.exports = {
  descobrirAplicacao
};
