#!/usr/bin/env node
/**
 * Backlog de mapeamento — Fase 0 (offline, deterministico).
 *
 * Classifica as aplicacoes do catalogo por lacuna de mapeamento e por classe de
 * seguranca preliminar (somente leitura / possui escrita / sem acesso), lendo
 * apenas o que ja esta em disco. NAO acessa a rede.
 *
 *   node scripts/backlog-mapeamento.js            # grava docs/BACKLOG_MAPEAMENTO.{json,md}
 *   node scripts/backlog-mapeamento.js --proximo  # imprime o proximo lote da fila
 *
 * Saida e a fonte da verdade da fila do loop de mapeamento: o modelo nao escolhe
 * o que fazer, ele consome esta lista.
 */
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const DIR_FICHAS = path.join(RAIZ, 'docs', 'apps');
const SAIDA_JSON = path.join(RAIZ, 'docs', 'BACKLOG_MAPEAMENTO.json');
const SAIDA_MD = path.join(RAIZ, 'docs', 'BACKLOG_MAPEAMENTO.md');

// Ficha abaixo deste tamanho e stub: nao carrega campo nem botao real.
const LIMIAR_STUB_BYTES = 800;

// Prioridade por vertical: primeiro as que ja viraram tool MCP.
const ORDEM_VERTICAIS = ['ECO', 'LRS', 'PGT', 'ECN', 'ECS', 'ECA', 'LQE', 'LQA', 'MSS', 'BPA'];

// Vocabulario de botoes. Usado so como SINAL — a classificacao final e humana.
const VERBOS_ESCRITA = /\b(incluir|gravar|salvar|confirmar|excluir|exclus|alterar|editar|inserir|submeter|efetivar|aprovar|reprovar|lancar|lançar|tramitar|encerrar|baixar\s+ra|enviar|registrar|autorizar|homologar|deletar|remover)\b/i;
const VERBOS_LEITURA = /\b(consultar|pesquisar|buscar|filtrar|emitir|imprimir|exportar|visualizar|listar|detalhar|relatorio|relatório)\b/i;
const TIPO_SEM_ACESSO = /sem\s+(acesso|permiss)/i;
const TIPO_ESCRITA = /escrita|misto|submiss|registro\s+de\s+ativid|confirma/i;

function lerFicha(codigo) {
  const arquivo = path.join(DIR_FICHAS, `${codigo}.md`);
  if (!fs.existsSync(arquivo)) return null;
  const texto = fs.readFileSync(arquivo, 'utf8');
  const bytes = Buffer.byteLength(texto);

  const mTipo = texto.match(/^## Tipo\s*\n+(.+)$/m);
  const mStatus = texto.match(/Status:\s*([a-zA-Zçã]+)/);

  // Botoes ficam na secao "## Botões Disponíveis", um por linha "- **Nome**: ..."
  const secaoBotoes = texto.split(/^## Bot[õo]es Dispon[íi]veis\s*$/m)[1] || '';
  const botoes = (secaoBotoes.split(/^## /m)[0].match(/^- \*\*([^*]+)\*\*/gm) || [])
    .map((l) => l.replace(/^- \*\*/, '').replace(/\*\*$/, '').trim())
    .filter((b) => b && b !== 'Sem Rotulo');

  return {
    bytes,
    tipo: mTipo ? mTipo[1].trim() : null,
    status: mStatus ? mStatus[1].toLowerCase() : null,
    botoes,
    stub: bytes < LIMIAR_STUB_BYTES,
    semCampos: /Nenhum campo interativo detectado/i.test(texto),
  };
}

function classificarSeguranca(ficha) {
  if (!ficha) return { classe: 'indeterminado', motivo: 'sem ficha em docs/apps/' };
  if (ficha.tipo && TIPO_SEM_ACESSO.test(ficha.tipo)) {
    return { classe: 'sem_acesso', motivo: `Tipo declarado: ${ficha.tipo}` };
  }
  const botoesEscrita = ficha.botoes.filter((b) => VERBOS_ESCRITA.test(b));
  if (botoesEscrita.length) {
    return { classe: 'possui_escrita', motivo: `botões de escrita: ${botoesEscrita.join(', ')}` };
  }
  if (ficha.tipo && TIPO_ESCRITA.test(ficha.tipo)) {
    return { classe: 'possui_escrita', motivo: `Tipo declarado: ${ficha.tipo}` };
  }
  // Stub nunca e "somente leitura confirmado": a tela nunca foi realmente aberta.
  if (ficha.stub || ficha.semCampos || ficha.status === 'auto') {
    return { classe: 'indeterminado', motivo: 'ficha gerada em lote, tela não inspecionada' };
  }
  const botoesLeitura = ficha.botoes.filter((b) => VERBOS_LEITURA.test(b));
  if (botoesLeitura.length) {
    return { classe: 'candidata_leitura', motivo: `só botões de leitura: ${botoesLeitura.join(', ')}` };
  }
  return { classe: 'indeterminado', motivo: 'nenhum botão reconhecido' };
}

function lacunas(app, ficha, temRoteiro) {
  const out = [];
  if (!ficha) out.push('sem_ficha');
  else {
    if (ficha.stub) out.push('ficha_stub');
    if (ficha.semCampos) out.push('sem_campos_detectados');
    if (ficha.status === 'auto') out.push('ficha_nao_validada');
  }
  if (!temRoteiro) out.push('sem_roteiro');
  if (!app.url_zul) out.push('sem_url');
  return out;
}

function main() {
  const catalogo = require(path.join(RAIZ, 'config', 'catalogo_aplicacoes.json'));
  const roteiro = require(path.join(RAIZ, 'config', 'roteiro.json'));

  const apps = catalogo.map((app) => {
    const ficha = lerFicha(app.codigo);
    const temRoteiro = Boolean(roteiro[app.codigo]);
    const vertical = (app.codigo.match(/^[A-Z]+?(?=V?\d)/) || app.codigo.match(/^[A-Z]+/) || ['?'])[0];
    const seg = classificarSeguranca(ficha);
    const gaps = lacunas(app, ficha, temRoteiro);

    const idxVertical = ORDEM_VERTICAIS.indexOf(vertical);
    return {
      codigo: app.codigo,
      nome: app.nome,
      vertical,
      url_zul: app.url_zul || null,
      tipo_declarado: ficha ? ficha.tipo : null,
      status_ficha: ficha ? ficha.status : null,
      bytes_ficha: ficha ? ficha.bytes : 0,
      botoes: ficha ? ficha.botoes : [],
      classe_seguranca: seg.classe,
      motivo_classe: seg.motivo,
      lacunas: gaps,
      completo: gaps.length === 0,
      prioridade: (idxVertical === -1 ? ORDEM_VERTICAIS.length : idxVertical) * 1000 + gaps.length * -10,
    };
  });

  const pendentes = apps
    .filter((a) => !a.completo)
    .sort((a, b) => a.prioridade - b.prioridade || a.codigo.localeCompare(b.codigo));

  const conta = (campo) =>
    apps.reduce((m, a) => ((m[a[campo]] = (m[a[campo]] || 0) + 1), m), {});

  const resumo = {
    gerado_em: new Date().toISOString(),
    total: apps.length,
    completos: apps.length - pendentes.length,
    pendentes: pendentes.length,
    por_classe_seguranca: conta('classe_seguranca'),
    por_lacuna: apps.reduce((m, a) => {
      for (const g of a.lacunas) m[g] = (m[g] || 0) + 1;
      return m;
    }, {}),
  };

  fs.writeFileSync(SAIDA_JSON, JSON.stringify({ resumo, apps }, null, 2));

  const linhasMd = [
    '# Backlog de mapeamento',
    '',
    '> Gerado por `node scripts/backlog-mapeamento.js`. Não edite à mão.',
    '',
    `- Gerado em: ${resumo.gerado_em}`,
    `- Aplicações: **${resumo.total}** — completas: **${resumo.completos}** — pendentes: **${resumo.pendentes}**`,
    '',
    '## Classe de segurança (preliminar, derivada de ficha + botões)',
    '',
    '| Classe | Apps |',
    '|---|---|',
    ...Object.entries(resumo.por_classe_seguranca)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `| ${k} | ${v} |`),
    '',
    '## Lacunas',
    '',
    '| Lacuna | Apps |',
    '|---|---|',
    ...Object.entries(resumo.por_lacuna)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `| ${k} | ${v} |`),
    '',
    '## Próximos 30 da fila',
    '',
    '| # | Código | Nome | Vertical | Classe | Lacunas |',
    '|---|---|---|---|---|---|',
    ...pendentes
      .slice(0, 30)
      .map((a, i) => `| ${i + 1} | ${a.codigo} | ${a.nome} | ${a.vertical} | ${a.classe_seguranca} | ${a.lacunas.join(', ')} |`),
    '',
  ];
  fs.writeFileSync(SAIDA_MD, linhasMd.join('\n'));

  if (process.argv.includes('--proximo')) {
    const n = Number(process.argv[process.argv.indexOf('--proximo') + 1]) || 5;
    console.log(JSON.stringify(pendentes.slice(0, n), null, 2));
    return;
  }

  console.log(`${resumo.total} apps — ${resumo.completos} completas, ${resumo.pendentes} pendentes`);
  console.log('classe:', JSON.stringify(resumo.por_classe_seguranca));
  console.log(`gravado: ${path.relative(RAIZ, SAIDA_JSON)} e ${path.relative(RAIZ, SAIDA_MD)}`);
}

main();
