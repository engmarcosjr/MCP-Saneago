const test = require('node:test');
const assert = require('node:assert');
const { classificarCapacidade, extrairFiltros, gerarPerguntasQueResponde } = require('../src/classificar_capacidades');
const { parseArgs } = require('../src/harvest_capacidades');

test('classificarCapacidade - extrai filtros de ECO303 (Conta/Hidrometro)', () => {
  const registroECO303 = {
    codigo: 'ECO303',
    nome: 'Acerta Leitura/Consumo',
    tecnologia: 'zk',
    inputs: [
      { rotulo: 'Número da Conta', tipo: 'text', readonly: false },
      { rotulo: 'Número Hidrômetro', tipo: 'text', readonly: false }
    ],
    botoes: [{ label: 'Consultar', tipo: 'button' }],
    colunas: ['Mês/Ano', 'Leitura Anterior', 'Consumo Medido']
  };

  const resultado = classificarCapacidade(registroECO303);

  assert.strictEqual(resultado.codigo, 'ECO303');
  assert.strictEqual(resultado.tecnologia, 'zk');
  assert.deepStrictEqual(resultado.filtros_aceitos.sort(), ['conta', 'hidrometro'].sort());
  assert.strictEqual(resultado.retorna.length, 3);
  assert(resultado.perguntas_que_responde.some(p => p.includes('conta')));
  assert(resultado.perguntas_que_responde.some(p => p.includes('hidrômetro')));
});

test('classificarCapacidade - extrai filtros de LRS041 (Cidade/Data/Logradouro)', () => {
  const registroLRS041 = {
    codigo: 'LRS041',
    nome: 'Relatório de recomposição asfáltica',
    tecnologia: 'zk',
    inputs: [
      { rotulo: 'Cidade', tipo: 'select', readonly: false },
      { rotulo: 'Data Inicial', tipo: 'date', readonly: false },
      { rotulo: 'Data Final', tipo: 'date', readonly: false },
      { rotulo: 'Logradouro', tipo: 'text', readonly: false }
    ],
    botoes: [{ label: 'Consultar', tipo: 'button' }],
    colunas: ['RA Origem', 'Data do Corte', 'Motivo', 'Dimensões']
  };

  const resultado = classificarCapacidade(registroLRS041);

  assert.deepStrictEqual(resultado.filtros_aceitos.sort(), ['cidade', 'logradouro', 'periodo'].sort());
  assert(resultado.perguntas_que_responde.some(p => p.includes('<logradouro>') && p.includes('<cidade>')));
});

test('classificarCapacidade - tela sem filtros conhecidos devolve listas vazias (sem inventar boilerplate)', () => {
  const registroSemFiltros = {
    codigo: 'PGTV912',
    nome: 'Relatório Interno Estático',
    tecnologia: 'html',
    inputs: [],
    botoes: [],
    colunas: ['ID', 'Data Criação']
  };

  const resultado = classificarCapacidade(registroSemFiltros);

  assert.deepStrictEqual(resultado.filtros_aceitos, []);
  assert.deepStrictEqual(resultado.perguntas_que_responde, []);
});

test('extrairFiltros - reconhece os 13 tipos de filtros exigidos', () => {
  const inputsSinteticos = [
    { rotulo: 'Data Inicial' },
    { rotulo: 'Data Final' },
    { rotulo: 'Cidade / Município' },
    { rotulo: 'Bairro' },
    { rotulo: 'Rua / Logradouro' },
    { rotulo: 'Número da Conta' },
    { rotulo: 'Número do RA' },
    { rotulo: 'CPF / CNPJ do Cliente' },
    { rotulo: 'Nome do Solicitante' },
    { rotulo: 'Matrícula do Servidor' },
    { rotulo: 'Medidor / Hidrômetro' },
    { rotulo: 'Código Serviço' },
    { rotulo: 'UO Executora' }
  ];

  const filtros = extrairFiltros(inputsSinteticos);

  const esperados = [
    'periodo', 'cidade', 'bairro', 'logradouro', 'conta',
    'ra', 'cpf_cnpj', 'nome', 'matricula', 'hidrometro',
    'codigo_servico', 'uo'
  ];

  for (const esp of esperados) {
    assert(filtros.includes(esp), `Filtro esperado "${esp}" não foi encontrado em: ${JSON.stringify(filtros)}`);
  }
});
