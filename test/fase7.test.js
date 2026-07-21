const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');

const { derivarVertical, gerarIndiceCapacidades, MAPA_PREFIXOS } = require('../src/gerar_indice_capacidades');
const { descobrirAplicacao } = require('../src/tools/descobrir');

test('derivarVertical - mapeia prefixos conhecidos corretamente', () => {
  assert.strictEqual(derivarVertical('ECO303'), 'comercial');
  assert.strictEqual(derivarVertical('ECOV112'), 'comercial');
  assert.strictEqual(derivarVertical('LRS041'), 'operacional');
  assert.strictEqual(derivarVertical('LRSV272'), 'operacional');
  assert.strictEqual(derivarVertical('JAJ028'), 'juridico');
  assert.strictEqual(derivarVertical('BAP002'), 'rh_pessoal');
  assert.strictEqual(derivarVertical('FGC068'), 'financeiro_licitacoes');
  assert.strictEqual(derivarVertical('MGOV050'), 'ouvidoria_governanca');
  assert.strictEqual(derivarVertical('MTG001'), 'suprimentos_logistica');
  assert.strictEqual(derivarVertical('PGTV511'), 'transportes_frota');
  assert.strictEqual(derivarVertical('HFIV001'), 'patrimonio');
  assert.strictEqual(derivarVertical('HVWV001'), 'viagens_servico');
  assert.strictEqual(derivarVertical('LQAV079'), 'qualidade_laboratorio');
  assert.strictEqual(derivarVertical('BTWV001'), 'ti_sistemas');
  assert.strictEqual(derivarVertical('XYZ999'), 'indefinida');
});

test('gerarIndiceCapacidades - calcula confiabilidade alta, media e baixa', () => {
  const tmpEntrada = path.join(__dirname, 'tmp_capacidades_test.json');
  const tmpSaida = path.join(__dirname, 'tmp_indice_test.json');

  const fixtureData = [
    {
      codigo: 'ECO303',
      nome: 'Acerta Leitura/Consumo',
      url_real: 'https://www.saneago.com.br/...',
      tecnologia: 'zk',
      inputs: [{ rotulo: 'Número da Conta' }],
      botoes: [{ label: 'Consultar' }],
      colunas: ['Mês/Ano', 'Leitura', 'Consumo'],
      erro: null
    },
    {
      codigo: 'LRS732',
      nome: 'Atendimento Por Período',
      url_real: 'https://www.saneago.com.br/...',
      tecnologia: 'html',
      inputs: [{ rotulo: 'Data Inicial' }, { rotulo: 'Data Final' }],
      botoes: [],
      colunas: [],
      erro: null
    },
    {
      codigo: 'TEST001',
      nome: 'Sem Dados',
      url_real: '',
      tecnologia: 'html',
      inputs: [],
      botoes: [],
      colunas: [],
      erro: 'Timeout de captura (45s)'
    }
  ];

  fs.writeFileSync(tmpEntrada, JSON.stringify(fixtureData, null, 2), 'utf8');

  try {
    const indice = gerarIndiceCapacidades(tmpEntrada, tmpSaida);

    assert.strictEqual(indice.total_aplicacoes, 3);
    assert.strictEqual(indice.resumo.confiabilidade_alta, 1);
    assert.strictEqual(indice.resumo.confiabilidade_media, 1);
    assert.strictEqual(indice.resumo.confiabilidade_baixa, 1);
    assert.strictEqual(indice.resumo.com_erro, 1);

    assert(indice.por_filtro.conta.includes('ECO303'));
    assert(indice.por_filtro.periodo.includes('LRS732'));
    assert(indice.por_vertical.comercial.includes('ECO303'));
    assert(indice.por_vertical.operacional.includes('LRS732'));
    assert(indice.por_vertical.indefinida.includes('TEST001'));

  } finally {
    if (fs.existsSync(tmpEntrada)) fs.unlinkSync(tmpEntrada);
    if (fs.existsSync(tmpSaida)) fs.unlinkSync(tmpSaida);
  }
});

test('descobrirAplicacao - busca local sobre o indice', () => {
  const tmpEntrada = path.join(__dirname, 'tmp_capacidades_test.json');
  const tmpSaida = path.join(__dirname, 'tmp_indice_test.json');
  const fixtureData = [
    {
      codigo: 'ECO303',
      nome: 'Acerta Leitura/Consumo',
      url_real: 'https://www.saneago.com.br/...',
      tecnologia: 'zk',
      inputs: [{ rotulo: 'Número da Conta' }],
      botoes: [{ label: 'Consultar' }],
      colunas: ['Mês/Ano', 'Leitura', 'Consumo'],
      erro: null
    }
  ];
  fs.writeFileSync(tmpEntrada, JSON.stringify(fixtureData, null, 2), 'utf8');
  gerarIndiceCapacidades(tmpEntrada, tmpSaida);

  try {
    const resultado = descobrirAplicacao({ pergunta: 'ECO303', indicePath: tmpSaida });
    assert(resultado.ok);
    assert(resultado.candidatas.length > 0);
    assert.strictEqual(resultado.candidatas[0].codigo, 'ECO303');
    assert(resultado.candidatas[0].por_que_casou.length > 0);
  } finally {
    if (fs.existsSync(tmpEntrada)) fs.unlinkSync(tmpEntrada);
    if (fs.existsSync(tmpSaida)) fs.unlinkSync(tmpSaida);
  }
});

test('descobrirAplicacao - devolve mensagem honesta quando nada casa', () => {
  const tmpEntrada = path.join(__dirname, 'tmp_capacidades_test.json');
  const tmpSaida = path.join(__dirname, 'tmp_indice_test.json');
  const fixtureData = [
    {
      codigo: 'ECO303',
      nome: 'Acerta Leitura/Consumo',
      url_real: 'https://www.saneago.com.br/...',
      tecnologia: 'zk',
      inputs: [{ rotulo: 'Número da Conta' }],
      botoes: [{ label: 'Consultar' }],
      colunas: ['Mês/Ano', 'Leitura', 'Consumo'],
      erro: null
    }
  ];
  fs.writeFileSync(tmpEntrada, JSON.stringify(fixtureData, null, 2), 'utf8');
  gerarIndiceCapacidades(tmpEntrada, tmpSaida);

  try {
    const resultado = descobrirAplicacao({ pergunta: 'xyz999naoexiste', indicePath: tmpSaida });
    assert(resultado.ok);
    assert.strictEqual(resultado.candidatas.length, 0);
    assert(resultado.mensagem.includes('Nenhuma aplicação'));
  } finally {
    if (fs.existsSync(tmpEntrada)) fs.unlinkSync(tmpEntrada);
    if (fs.existsSync(tmpSaida)) fs.unlinkSync(tmpSaida);
  }
});
