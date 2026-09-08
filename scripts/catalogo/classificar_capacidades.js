/**
 * Classificador puro de capacidades a partir dos dados brutos capturados de uma tela.
 * Sem dependencias externas de rede ou Playwright.
 */

function removerAcentos(str) {
  return (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

/**
 * Extrai os filtros aceitos por uma tela com base nos rotulos dos campos capturados.
 * 
 * @param {Array<Object>} inputs Lista de inputs capturados na tela
 * @returns {Array<string>} Lista de nomes de filtros normalizados encontrados
 */
function extrairFiltros(inputs) {
  if (!Array.isArray(inputs) || inputs.length === 0) return [];

  const filtrosSet = new Set();
  const labelsNorm = inputs.map(i => removerAcentos(i.rotulo || i.label || ''));

  let temDataInicialOuFinal = false;

  for (const label of labelsNorm) {
    if (!label) continue;

    // Periodo
    if (/per[ií]odo|data.*ini|data.*fim|dt.*ini|dt.*fim|de:.*at[eé]|intervalo|data.*solicitac/i.test(label)) {
      filtrosSet.add('periodo');
      temDataInicialOuFinal = true;
    }
    // Cidade / Municipio
    if (/cidade|munic[ií]pio/i.test(label)) {
      filtrosSet.add('cidade');
    }
    // Bairro
    if (/bairro/i.test(label)) {
      filtrosSet.add('bairro');
    }
    // Logradouro / Endereco / Rua
    if (/logradouro|rua|endere[çc]o|avenida/i.test(label)) {
      filtrosSet.add('logradouro');
    }
    // Conta
    if (/\bconta\b|n[uú]m.*conta|nr.*conta/i.test(label)) {
      filtrosSet.add('conta');
    }
    // RA / Registro de Atendimento
    if (/\bra\b|registro.*atendimento|n[uú]m.*ra|nr.*ra/i.test(label)) {
      filtrosSet.add('ra');
    }
    // CPF / CNPJ
    if (/\bcpf\b|\bcnpj\b|documento/i.test(label)) {
      filtrosSet.add('cpf_cnpj');
    }
    // Nome / Cliente / Solicitante
    if (/\bnome\b|cliente|interessado|solicitante/i.test(label)) {
      filtrosSet.add('nome');
    }
    // Matricula
    if (/matr[ií]cula/i.test(label)) {
      filtrosSet.add('matricula');
    }
    // Hidrometro / Medidor
    if (/hidr[oô]metro|medidor/i.test(label)) {
      filtrosSet.add('hidrometro');
    }
    // Codigo Servico
    if (/servi[çc]o|c[oó]d.*serv/i.test(label)) {
      filtrosSet.add('codigo_servico');
    }
    // UO / Unidade Organizacao
    if (/\buo\b|unidade.*organiz|unidade.*exec/i.test(label)) {
      filtrosSet.add('uo');
    }
    // Data generica (apenas se nao for periodo explicitado)
    if (/data|dt\b/i.test(label) && !temDataInicialOuFinal) {
      filtrosSet.add('data');
    }
  }

  // Se periodo foi detectado, remove "data" redundante se presente
  if (filtrosSet.has('periodo')) {
    filtrosSet.delete('data');
  }

  return Array.from(filtrosSet);
}

/**
 * Deriva as perguntas que a aplicacao consegue responder em pt-BR com base nos filtros e colunas capturados.
 * 
 * @param {Array<string>} filtros Lista de filtros reconhecidos
 * @param {Array<string>} colunas Lista de cabecalhos de tabelas/grids
 * @param {string} nomeApp Nome do aplicativo no catalogo
 * @returns {Array<string>} Frases/perguntas em pt-BR derivadas dos dados reais
 */
function gerarPerguntasQueResponde(filtros, colunas = [], nomeApp = '') {
  if (!filtros || filtros.length === 0) {
    return []; // Importante: vazio quando nao ha filtros reconhecidos
  }

  const perguntas = [];
  const setFiltros = new Set(filtros);

  // Combinacoes ricas de endereco e periodo
  if (setFiltros.has('cidade') && setFiltros.has('logradouro') && setFiltros.has('periodo')) {
    perguntas.push('quais RAs foram registradas na rua <logradouro> em <cidade> no período de <data> a <data>');
  }
  if (setFiltros.has('cidade') && setFiltros.has('periodo')) {
    perguntas.push('quais atendimentos foram registrados em <cidade> entre <data> e <data>');
  }
  if (setFiltros.has('cidade') && setFiltros.has('bairro')) {
    perguntas.push('quais atendimentos foram registrados no bairro <bairro> em <cidade>');
  }

  // Conta
  if (setFiltros.has('conta') && setFiltros.has('periodo')) {
    perguntas.push('qual o histórico de consumo nos últimos meses da conta <conta>');
  } else if (setFiltros.has('conta')) {
    perguntas.push('quais as informações e histórico da conta <conta>');
  }

  // RA
  if (setFiltros.has('ra')) {
    perguntas.push('quais os detalhes e situação do registro de atendimento <ra>');
  }

  // Nome / CPF / CNPJ
  if (setFiltros.has('nome') || setFiltros.has('cpf_cnpj')) {
    perguntas.push('quais as contas ou atendimentos vinculados a <nome/cpf_cnpj>');
  }

  // Hidrometro
  if (setFiltros.has('hidrometro')) {
    perguntas.push('qual o histórico de leituras do hidrômetro <hidrometro>');
  }

  // Matricula
  if (setFiltros.has('matricula')) {
    perguntas.push('quais as informações da matrícula <matricula>');
  }

  // Codigo Servico
  if (setFiltros.has('codigo_servico')) {
    perguntas.push('quais as RAs referentes ao código de serviço <codigo_servico>');
  }

  // UO
  if (setFiltros.has('uo')) {
    perguntas.push('quais atendimentos foram atribuídos à UO <uo>');
  }

  // Data / Periodo generico (caso nao tenha encaixado acima)
  if (setFiltros.has('periodo') && perguntas.length === 0) {
    perguntas.push('quais registros foram efetuados no período de <data> a <data>');
  } else if (setFiltros.has('data') && perguntas.length === 0) {
    perguntas.push('quais registros foram efetuados na data <data>');
  }

  return perguntas;
}

/**
 * Recebe o registro de captura bruta e gera o registro derivado de capacidade.
 * 
 * @param {Object} registro Registro capturado pelo inspector
 * @returns {Object} Registro derivado de capacidade
 */
function classificarCapacidade(registro) {
  const inputs = registro.inputs || [];
  const colunas = registro.colunas || [];
  const filtros_aceitos = extrairFiltros(inputs);
  const perguntas_que_responde = gerarPerguntasQueResponde(filtros_aceitos, colunas, registro.nome);

  return {
    codigo: registro.codigo,
    nome: registro.nome,
    tecnologia: registro.tecnologia || 'desconhecida',
    filtros_aceitos,
    retorna: colunas,
    perguntas_que_responde
  };
}

module.exports = {
  classificarCapacidade,
  extrairFiltros,
  gerarPerguntasQueResponde
};
