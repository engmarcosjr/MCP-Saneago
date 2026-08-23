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
    if (t === 'asfalto' || t === 'asfaltica' || t === 'corte') {
      expanded.add('asfalto');
      expanded.add('asfaltica');
      expanded.add('recomposicao');
    }
    if (t === 'recomposto' || t === 'recomposicao' || t === 'recomposica') {
      expanded.add('recomposicao');
      expanded.add('asfaltica');
      expanded.add('recomposto');
    }
    if (t === 'recadastramento' || t === 'recadastro') {
      expanded.add('recadastramento');
      expanded.add('recadastro');
    }
    if (t === 'paralisacao' || t === 'paralizacao' || t === 'paralisa') {
      expanded.add('paralisacao');
      expanded.add('paralizacao');
      expanded.add('paralisa');
    }
    if (t === 'telefone' || t === 'celular') {
      expanded.add('telefone');
      expanded.add('contato');
    }
    if (t === 'consumo' || t === 'medido' || t === 'leitura') {
      expanded.add('consumo');
      expanded.add('medido');
      expanded.add('leitura');
    }
    // Supervisório Web
    if (t === 'rap' || t === 'reservatorio' || t === 'nivel' || t === 'reservatorios') {
      expanded.add('nivel');
      expanded.add('nivel_percent');
      expanded.add('reservatorio');
      expanded.add('telemetria');
      expanded.add('supervisorio');
    }
    if (t === 'bomba' || t === 'bombeamento' || t === 'pressao' || t === 'vazao') {
      expanded.add('bomba');
      expanded.add('status_bomba');
      expanded.add('telemetria');
      expanded.add('supervisorio');
    }
    if (t === 'horimetro' || t === 'horimetros') {
      expanded.add('horimetro');
      expanded.add('horas_trabalhadas');
      expanded.add('acionamentos');
      expanded.add('bomba');
    }
    if (t === 'noturna' || t === 'noturno' || t === 'dmc') {
      expanded.add('minima_noturna');
      expanded.add('dmc');
      expanded.add('vazao_minima');
      expanded.add('supervisorio');
    }
    // Webmail / Zimbra
    if (t === 'email' || t === 'e-mail' || t === 'emails' || t === 'mensagem' || t === 'mensagens' || t === 'webmail' || t === 'zimbra') {
      expanded.add('email');
      expanded.add('assunto');
      expanded.add('remetente');
      expanded.add('webmail');
      expanded.add('mensagem');
    }
    // DocFlow / GED
    if (t === 'processo' || t === 'processos' || t === 'ged' || t === 'docflow') {
      expanded.add('processo');
      expanded.add('numero_processo');
      expanded.add('docflow');
      expanded.add('interessado');
    }
    if (t === 'projeto' || t === 'projetos' || t === 'empreendimento' || t === 'avto') {
      expanded.add('projeto');
      expanded.add('empreendimento');
      expanded.add('avto');
      expanded.add('docflow_ged');
    }
  }
  return Array.from(expanded);
}

/**
 * Mapeia termos comuns da pergunta para nomes de filtros reconhecidos,
 * distinguindo parâmetros de entrada de colunas de saída com base em preposições.
 */
function inferirFiltrosDaPergunta(perguntaNorm) {
  const filtrosEntrada = new Set();
  const colunasSaida = new Set();

  const matchPrep = perguntaNorm.match(/^(.*?)\s+\b(por|pelo|pela|de|da|do|num|numa)\b\s+(.*)$/i);
  let parteFiltro = perguntaNorm;
  let parteResultado = '';

  if (matchPrep) {
    parteResultado = matchPrep[1].trim();
    parteFiltro = matchPrep[3].trim();
  }

  function extrairFiltrosDeTexto(texto, destinoSet) {
    if (!texto) return;
    if (/per[ií]odo|data.*ini|data.*fim|dt.*ini|dt.*fim|de:.*at[eé]|intervalo|ultimos.*meses|meses|dias/i.test(texto)) {
      destinoSet.add('periodo');
    }
    if (/\bdata\b|\bdt\b/i.test(texto)) {
      destinoSet.add('data');
    }
    if (/cidade|munic[ií]pio|goi[aâ]nia|an[aá]polis|aparecida/i.test(texto)) {
      destinoSet.add('cidade');
    }
    if (/bairro|setor|maracan[aã]/i.test(texto)) {
      destinoSet.add('bairro');
    }
    if (/logradouro|rua|endere[çc]o|avenida|ada centine/i.test(texto)) {
      destinoSet.add('logradouro');
    }
    if (/\bcontas?\b|n[uú]m.*conta|nr.*conta|fatura/i.test(texto)) {
      destinoSet.add('conta');
    }
    if (/\bras?\b|registro.*atendimento|n[uú]m(ero)?.*ra|nr.*ra/i.test(texto)) {
      destinoSet.add('ra');
    }
    if (/\bcpf\b|\bcnpj\b|documento/i.test(texto)) {
      destinoSet.add('cpf_cnpj');
    }
    if (/\bnome\b|titular|cliente|interessado|solicitante|marcos|antonio|propriet[aá]rio/i.test(texto)) {
      destinoSet.add('nome');
    }
    if (/matr[ií]cula/i.test(texto)) {
      destinoSet.add('matricula');
    }
    if (/hidr[oô]metro|medidor/i.test(texto)) {
      destinoSet.add('hidrometro');
    }
    if (/servi[çc]o|c[oó]d.*serv/i.test(texto)) {
      destinoSet.add('codigo_servico');
    }
    if (/\buo\b|unidade.*organiz/i.test(texto)) {
      destinoSet.add('uo');
    }
  }

  extrairFiltrosDeTexto(parteFiltro, filtrosEntrada);
  if (parteResultado) {
    extrairFiltrosDeTexto(parteResultado, colunasSaida);
  }

  if (filtrosEntrada.size === 0) {
    extrairFiltrosDeTexto(perguntaNorm, filtrosEntrada);
  }

  return {
    filtrosEntrada: Array.from(filtrosEntrada),
    colunasSaida: Array.from(colunasSaida)
  };
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
  
  const filtrosEntradaDesejados = (filtrosFiltro || []).map(f => removerAcentos(f));
  let colunasSaidaDesejadas = [];

  if (perguntaNorm) {
    const { filtrosEntrada: feInf, colunasSaida: csInf } = inferirFiltrosDaPergunta(perguntaNorm);
    for (const f of feInf) {
      if (!filtrosEntradaDesejados.includes(f)) {
        filtrosEntradaDesejados.push(f);
      }
    }
    colunasSaidaDesejadas = csInf;
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
        const rawTokensScore = matchedTokens.length * 15;
        const cappedTokensScore = Math.min(30, rawTokensScore); // Teto: 30
        nameScore += cappedTokensScore;
        porQueCasou.push(`Termos do nome casados (${matchedTokens.join(', ')}): +${cappedTokensScore}`);
      }
    }

    // 3. Match de filtros de entrada (SINAL DOMINANTE - Tier 1) vs Colunas de saída (SINAL FRACO - Tier 3)
    let filterScore = 0;
    const appFiltros = (app.filtros || []).map(f => removerAcentos(f));
    const appColunasNorm = (app.colunas_retornadas || []).map(c => removerAcentos(c));

    const filtrosEntradaCasados = [];
    const filtrosSaidaCasados = [];

    for (const fe of filtrosEntradaDesejados) {
      if (appFiltros.includes(fe)) {
        filtrosEntradaCasados.push(fe);
      } else if (appColunasNorm.some(col => matchWordBoundary(col, fe))) {
        filtrosSaidaCasados.push(fe);
      }
    }

    for (const cs of colunasSaidaDesejadas) {
      if (appColunasNorm.some(col => matchWordBoundary(col, cs)) && !filtrosSaidaCasados.includes(cs)) {
        filtrosSaidaCasados.push(cs);
      }
    }

    // A. Filtros de entrada (Dominantes: 50 pts cada + cobertura)
    if (filtrosEntradaCasados.length > 0) {
      const ptsEntrada = filtrosEntradaCasados.length * 50;
      const coberturaRatio = filtrosEntradaDesejados.length > 0 ? (filtrosEntradaCasados.length / filtrosEntradaDesejados.length) : 1;
      const ptsCobertura = Math.round(coberturaRatio * 30);
      filterScore += (ptsEntrada + ptsCobertura);
      porQueCasou.push(`Filtros de entrada atendidos ([${filtrosEntradaCasados.join(', ')}]): +${ptsEntrada} (cobertura ${Math.round(coberturaRatio * 100)}%: +${ptsCobertura})`);
    }

    // B. Colunas de retorno (Teto estrito de 15 pts para apps SEM filtro de entrada, ou 25 pts COM filtro de entrada)
    let colunasScore = 0;
    const colunasCasadas = [];
    if (tokenPergunta.length > 0 && Array.isArray(app.colunas_retornadas)) {
      for (const col of appColunasNorm) {
        for (const token of tokenPergunta) {
          if (matchWordBoundary(col, token) && !colunasCasadas.includes(col)) {
            colunasCasadas.push(col);
          }
        }
      }
    }

    const rawSaidaPts = (filtrosSaidaCasados.length * 10) + (colunasCasadas.length * 2);
    if (rawSaidaPts > 0) {
      const tetoSaida = filtrosEntradaCasados.length === 0 ? 15 : 25;
      colunasScore = Math.min(tetoSaida, rawSaidaPts);
      porQueCasou.push(`Colunas de saída casadas (filtros: [${filtrosSaidaCasados.join(', ')}], colunas: ${colunasCasadas.length}): +${colunasScore}`);
    }

    // 4. Match em perguntas que responde (Sinal fraco com Teto: 15)
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
        perguntasScore = Math.min(15, rawPergScore); // Teto: 15
        porQueCasou.push(`Responde a ${perguntasCasadasCount} intenções relacionadas: +${perguntasScore}`);
      }
    }

    // Soma parcial
    let totalAppScore = score + codeScore + nameScore + filterScore + colunasScore + perguntasScore;

    // Identifica tokens de tópico (excluindo nomes de filtros genéricos)
    const filterTokenNames = new Set(['ra', 'ras', 'registro', 'atendimento', 'numero', 'num', 'nr', 'conta', 'contas', 'periodo', 'cidade', 'bairro', 'logradouro', 'uo', 'cpf', 'cnpj', 'matricula', 'hidrometro', 'data', 'consultar', 'consulta']);
    const topicTokens = tokenPergunta.filter(t => !filterTokenNames.has(t));

    let matchesTopic = true;
    if (topicTokens.length > 0) {
      const nameMatched = topicTokens.some(t => matchWordBoundary(nomeNorm, t));
      const colMatched = appColunasNorm.some(col => topicTokens.some(t => matchWordBoundary(col, t)));
      const pergMatched = (app.perguntas_que_responde || []).some(p => topicTokens.some(t => matchWordBoundary(removerAcentos(p), t)));
      matchesTopic = nameMatched || colMatched || pergMatched;
    }

    if (topicTokens.length > 0 && !matchesTopic) {
      totalAppScore = Math.floor(totalAppScore * 0.2);
      porQueCasou.push(`Penalidade por não corresponder ao tópico específico da busca (${topicTokens.join(', ')})`);
    }

    // Penalidade se a pergunta exigiu/inferiu filtros de entrada mas a app NÃO atendeu a NENHUM filtro de entrada
    if (filtrosEntradaDesejados.length > 0 && filtrosEntradaCasados.length === 0) {
      if (matchesTopic && topicTokens.length > 0) {
        totalAppScore = Math.floor(totalAppScore * 0.8);
        porQueCasou.push(`Suavizada penalidade de filtro por casar com o tópico da busca ([${topicTokens.join(', ')}])`);
      } else if (nameScore < 20) {
        totalAppScore = Math.floor(totalAppScore * 0.1);
        porQueCasou.push(`Penalidade por não atender a nenhum filtro de entrada solicitado ([${filtrosEntradaDesejados.join(', ')}])`);
      } else {
        totalAppScore = Math.floor(totalAppScore * 0.5);
        porQueCasou.push(`Penalidade por não ter filtro de entrada solicitado ([${filtrosEntradaDesejados.join(', ')}])`);
      }
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
    const coveredFiltersCount = filtrosEntradaCasados.length + filtrosSaidaCasados.length;
    if (totalAppScore >= MIN_SCORE && porQueCasou.length > 0) {
      resultados.push({
        score: totalAppScore,
        coveredFiltersCount,
        coveredEntradaCount: filtrosEntradaCasados.length,
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
      filtros_pesquisados: filtrosEntradaDesejados,
      candidatas: [],
      confianca: "baixa"
    };
  }

  const top = resultados.slice(0, limite).map(r => r.app);
  const topoResult = resultados[0];

  // Cálculo da confiança da resposta
  const totalDesejadosSet = new Set([...filtrosEntradaDesejados, ...colunasSaidaDesejadas]);
  const totalDesejadosCount = totalDesejadosSet.size;
  let confianca = "baixa";
  if (totalDesejadosCount > 0) {
    const topoEntradaCount = topoResult.coveredEntradaCount || 0;
    const topoTotalCovered = topoResult.coveredFiltersCount || 0;
    if (topoEntradaCount >= filtrosEntradaDesejados.length && topoTotalCovered >= totalDesejadosCount && topoResult.score >= 50) {
      confianca = "alta";
    } else if (topoTotalCovered > 0 && topoResult.score >= 35) {
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
    filtros_pesquisados: filtrosEntradaDesejados,
    candidatas: top,
    confianca
  };
}

module.exports = {
  descobrirAplicacao
};
