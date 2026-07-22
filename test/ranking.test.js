const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { descobrirAplicacao } = require('../src/tools/descobrir');

const INDICE_PATH = path.join(__dirname, '..', 'config', 'indice_capacidades.json');

test('ranking - conta pelo nome do proprietário -> ECO154 em 1º no índice completo', () => {
  const res = descobrirAplicacao({
    pergunta: 'conta pelo nome do proprietario',
    indicePath: INDICE_PATH
  });

  assert.strictEqual(res.ok, true);
  assert(res.candidatas.length > 0, 'Devia retornar candidatas');
  assert.strictEqual(res.candidatas[0].codigo, 'ECO154', `Esperado ECO154 em 1º, obteve ${res.candidatas[0].codigo}`);
  assert.strictEqual(res.confianca, 'alta');

  // Garante que ECA002 (ruído de colunas) não está no top-3
  const top3Codigos = res.candidatas.slice(0, 3).map(c => c.codigo);
  assert(!top3Codigos.includes('ECA002'), 'ECA002 não deve aparecer no top-3 por ter 0 filtros correspondentes');
});

test('ranking - RAs por logradouro e bairro num periodo -> ECO709 em 1º no índice completo', () => {
  const res = descobrirAplicacao({
    pergunta: 'RAs por logradouro e bairro num periodo',
    indicePath: INDICE_PATH
  });

  assert.strictEqual(res.ok, true);
  assert(res.candidatas.length > 0);
  assert.strictEqual(res.candidatas[0].codigo, 'ECO709', `Esperado ECO709 em 1º, obteve ${res.candidatas[0].codigo}`);
  assert.strictEqual(res.confianca, 'alta');
});

test('ranking - consultar RA por numero -> ECO701 em 1º no índice completo', () => {
  const res = descobrirAplicacao({
    pergunta: 'consultar RA por numero',
    indicePath: INDICE_PATH
  });

  assert.strictEqual(res.ok, true);
  assert(res.candidatas.length > 0);
  assert.strictEqual(res.candidatas[0].codigo, 'ECO701', `Esperado ECO701 em 1º, obteve ${res.candidatas[0].codigo}`);
  assert.strictEqual(res.confianca, 'alta');

  // Trava a regressão da coluna-de-saída-dominante: EAC005 NÃO pode aparecer no top-3
  const top3 = res.candidatas.slice(0, 3).map(c => c.codigo);
  assert(!top3.includes('EAC005'), `EAC005 não deve aparecer no top-3 por ter RA apenas como coluna de saída (top-3 obtido: ${top3.join(', ')})`);
});

test('ranking - asfalto recomposto por RA / recomposição asfáltica por cidade -> LRS041 no top-3', () => {
  const resAsfalto = descobrirAplicacao({
    pergunta: 'asfalto recomposto por RA',
    indicePath: INDICE_PATH
  });

  assert.strictEqual(resAsfalto.ok, true);
  assert(resAsfalto.candidatas.length > 0, 'Devia retornar candidatas para asfalto recomposto por RA');
  const top3Asfalto = resAsfalto.candidatas.slice(0, 3).map(c => c.codigo);
  assert(top3Asfalto.includes('LRS041'), `LRS041 deve estar no top-3 para asfalto recomposto por RA, obtido top-3: ${top3Asfalto.join(', ')}`);

  const resRecomp = descobrirAplicacao({
    pergunta: 'recomposição asfáltica por cidade',
    indicePath: INDICE_PATH
  });

  assert.strictEqual(resRecomp.ok, true);
  assert(resRecomp.candidatas.length > 0, 'Devia retornar candidatas para recomposição asfáltica por cidade');
  const top3Recomp = resRecomp.candidatas.slice(0, 3).map(c => c.codigo);
  assert(top3Recomp.includes('LRS041'), `LRS041 deve estar no top-3 para recomposição asfáltica por cidade, obtido top-3: ${top3Recomp.join(', ')}`);
});

test('ranking - debitos/faturas de uma conta -> ECO506 (ou ECO563/ECO548) em 1º lugar', () => {
  const res = descobrirAplicacao({
    pergunta: 'debitos/faturas de uma conta',
    indicePath: INDICE_PATH
  });

  assert.strictEqual(res.ok, true);
  assert(res.candidatas.length > 0);
  const aceitos = ['ECO506', 'ECO563', 'ECO548', 'ECN003'];
  assert(aceitos.includes(res.candidatas[0].codigo), `Esperado um app legítimo de faturas/débitos (ex: ECO506/ECO563), obteve ${res.candidatas[0].codigo}`);
  assert.strictEqual(res.confianca, 'alta');
});

test('ranking - pergunta sem resposta real -> lista vazia + mensagem honesta + confianca baixa', () => {
  const res = descobrirAplicacao({
    pergunta: 'xyz999naoexiste',
    indicePath: INDICE_PATH
  });

  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.candidatas.length, 0);
  assert.strictEqual(res.confianca, 'baixa');
  assert(res.mensagem.includes('Nenhuma aplicação'));
});

test('ranking - pergunta com filtros reconhecidos mas sem app correspondente -> descarte e honestidade', () => {
  const res = descobrirAplicacao({
    pergunta: 'hidrometro por uo',
    indicePath: INDICE_PATH
  });

  assert.strictEqual(res.ok, true);
  // Se houver candidatas, nenhuma com 0 filtros casados pode ser rankeada com alta confiança
  if (res.candidatas.length > 0) {
    const top = res.candidatas[0];
    assert.notStrictEqual(res.confianca, 'alta', 'Não pode dar confiança alta se a app não casa os filtros');
  } else {
    assert.strictEqual(res.confianca, 'baixa');
  }
});
