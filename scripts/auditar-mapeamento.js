#!/usr/bin/env node
/**
 * Auditoria do mapeamento — verifica os artefatos contra a EVIDENCIA BRUTA.
 *
 *   node scripts/auditar-mapeamento.js               # audita o estado atual de todas as apps
 *   node scripts/auditar-mapeamento.js ECO010        # audita so os codigos informados
 *   node scripts/auditar-mapeamento.js --lote lote-02 # audita so as apps tocadas nesse lote
 *   node scripts/auditar-mapeamento.js --json        # divergencias em JSON (consumido
 *                                                     pelo backlog para reenfileirar)

 * O JSONL e append-only: uma app reinspecionada ganha uma linha NOVA, e a auditoria
 * considera a ULTIMA linha de cada codigo como o estado corrente. As anteriores ficam
 * como historico. Uma linha que muda a classe de uma app tem de declarar `corrige`.
 *
 * Sai com codigo 1 e a lista de divergencias. Offline e deterministico.
 *
 * O modo de falha que este script existe para pegar nao e o executor errar — e ele
 * produzir um artefato plausivel que a tela nunca sustentou. Por isso NENHUMA checagem
 * confia na ficha, no diario ou no autorrelato: tudo e conferido contra o
 * `.inspect.json`, que e o retorno verbatim da tool.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const RAIZ = path.join(__dirname, '..');
const P_JSONL = path.join(RAIZ, 'docs', 'mapeamento', 'AUDITORIA.jsonl');
const P_SAFELIST = path.join(RAIZ, 'docs', 'SAFELIST_LEITURA.md');
const P_ROTEIRO = path.join(RAIZ, 'config', 'roteiro.json');
const P_INDICE = path.join(RAIZ, 'config', 'indice_capacidades.json');
const DIR_EVID = path.join(RAIZ, 'docs', 'mapeamento', 'evidencias');
const DIR_FICHAS = path.join(RAIZ, 'docs', 'apps');

// Mesmo vocabulario do backlog: qualquer um destes num botao impede `somente_leitura`.
const VERBOS_ESCRITA = /\b(incluir|gravar|salvar|confirmar|excluir|exclus|alterar|editar|inserir|submeter|efetivar|aprovar|reprovar|lancar|lançar|tramitar|encerrar|enviar|registrar|solicitar|autorizar|homologar|deletar|remover)\b/i;

const CLASSES = ['somente_leitura', 'possui_escrita', 'sem_campos_confirmado', 'sem_acesso', 'bloqueada'];

const divergencias = [];
function falha(codigo, checagem, msg) {
  divergencias.push({ codigo, checagem, msg });
}

const sha256 = (p) =>
  fs.existsSync(p) ? crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex') : null;

/** Aceita a evidencia crua ou dentro de envelope {url, capturado_em, inspecao}. */
function normalizarEvidencia(bruto) {
  const insp = bruto && bruto.inspecao ? bruto.inspecao : bruto;
  const url = (bruto && bruto.url) || (insp && (insp.url_real || insp.url)) || null;
  return {
    url,
    inputs: (insp && insp.inputs) || [],
    botoes: (insp && (insp.botoes || insp.buttons)) || [],
    texto: JSON.stringify(bruto),
  };
}

/**
 * Rotulos declarados na ficha, apenas das secoes de campos e de botoes.
 *
 * As fichas foram escritas em tres formatos ao longo do mapeamento, e ler so um
 * deixa o C2 cego -- que e o mesmo que nao ter C2:
 *   1. `## Botoes Disponiveis` + `- **Consultar**: descricao`
 *   2. `## Botoes Disponiveis` + `- \`Consultar\``
 *   3. `## Botoes e Acoes`     + tabela markdown `| Consultar | button | ... |`
 */
function rotulosDaFicha(md) {
  // Fatiar por cabecalho em vez de regex com lookahead: a versao anterior usava
  // `\\Z` (sintaxe de Python) que em JavaScript e a LETRA Z, entao a secao era
  // cortada no primeiro "Z" do texto. Bug silencioso -- o C2 lia secao truncada.
  const blocos = md.split(/^## /m).slice(1);
  const secao = (padrao) => {
    const re = new RegExp(`^${padrao}`, 'i');
    const b = blocos.find((x) => re.test(x));
    return b ? b.slice(b.indexOf('\n') + 1) : '';
  };

  const extrai = (txt) => {
    const negrito = [...txt.matchAll(/^- \*\*([^*]+)\*\*/gm)].map((x) => x[1]);
    const crase = [...txt.matchAll(/^- `([^`]+)`/gm)].map((x) => x[1]);
    // Tabela: a primeira celula e o rotulo; descarta cabecalho e separador.
    const tabela = [...txt.matchAll(/^\|\s*([^|]+?)\s*\|/gm)]
      .map((x) => x[1])
      .filter(
        (v) =>
          v &&
          !/^[-:\s]+$/.test(v) &&
          // Cabecalho de tabela, em qualquer combinacao ("Rotulo / Label", "Campo").
          !/^(r[óo]tulo|campo|nome|label|tipo|id|a[çc][ãa]o[^|]*)(\s*\/\s*(r[óo]tulo|label|nome|campo))?$/i.test(v)
      );
    return [...new Set([...negrito, ...crase, ...tabela].map((v) => v.trim()).filter(Boolean))];
  };

  // "Botoes Ignorados" e declaracao explicita de descarte, nao alegacao de tela.
  const semIgnorados = (txt) => txt.split(/^###\s+Bot[õo]es Ignorados/m)[0];

  return {
    campos: extrai(secao('(Campos|Entradas Identificadas|Filtros)')),
    botoes: extrai(semIgnorados(secao('Bot[õo]es[^\\n]*'))),
  };
}

function main() {
  if (!fs.existsSync(P_JSONL)) {
    console.error('AUDITORIA.jsonl não encontrado — nenhum lote a auditar.');
    process.exit(1);
  }

  // ---- Checagem 9: JSON de configuracao valido (antes de tudo, senão o resto mente).
  let roteiro = {};
  for (const [nome, p] of [['roteiro.json', P_ROTEIRO], ['indice_capacidades.json', P_INDICE]]) {
    try {
      const obj = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (nome === 'roteiro.json') roteiro = obj;
    } catch (e) {
      falha('-', 'C9 json-valido', `${nome} inválido: ${e.message}`);
    }
  }

  const args = process.argv.slice(2);
  const iLote = args.indexOf('--lote');
  const loteAlvo = iLote !== -1 ? args[iLote + 1] : null;
  const filtro = args
    .filter((a, i) => !a.startsWith('--') && (iLote === -1 || i !== iLote + 1))
    .map((s) => s.toUpperCase());
  const linhas = fs.readFileSync(P_JSONL, 'utf8').trim().split('\n').filter(Boolean);
  const safelist = fs.existsSync(P_SAFELIST) ? fs.readFileSync(P_SAFELIST, 'utf8') : '';

  // O JSONL e append-only: a ultima linha de cada codigo e o estado corrente.
  const historico = new Map();
  for (const [i, linha] of linhas.entries()) {
    try {
      const o = JSON.parse(linha);
      if (!historico.has(o.codigo)) historico.set(o.codigo, []);
      historico.get(o.codigo).push(o);
    } catch (err) {
      falha('-', 'C0 jsonl', `linha ${i + 1} não é JSON válido`);
    }
  }

  const vistos = new Map();
  let auditados = 0;

  for (const [cod, entradas] of historico) {
    const e = entradas[entradas.length - 1];
    if (filtro.length && !filtro.includes(cod)) continue;
    if (loteAlvo && e.lote !== loteAlvo) continue;
    auditados++;

    // ---- Checagem 5: correcao de classe tem de se declarar.
    const anterior = entradas[entradas.length - 2];
    if (anterior && anterior.classe_proposta !== e.classe_proposta && !e.corrige) {
      falha(cod, 'C5 correcao-nao-declarada', `classe mudou de ${anterior.classe_proposta} para ${e.classe_proposta} sem campo "corrige"`);
    }
    vistos.set(cod, e.classe_proposta);

    if (!CLASSES.includes(e.classe_proposta)) {
      falha(cod, 'C0 classe', `classe inválida: ${e.classe_proposta}`);
    }

    const pEvid = path.join(DIR_EVID, `${cod}.inspect.json`);
    const pFicha = path.join(DIR_FICHAS, `${cod}.md`);

    // ---- Checagem 1: evidencia e ficha existem e os hashes batem.
    if (!fs.existsSync(pEvid)) {
      falha(cod, 'C1 evidencia', 'evidência bruta ausente');
      continue;
    }
    if (e.sha256_evidencia && e.sha256_evidencia !== sha256(pEvid)) {
      falha(cod, 'C1 hash', 'evidência foi alterada depois de registrada');
    }
    if (!fs.existsSync(pFicha)) {
      falha(cod, 'C1 ficha', 'ficha ausente em docs/apps/');
    } else if (e.sha256_ficha && e.sha256_ficha !== sha256(pFicha)) {
      falha(cod, 'C1 hash', 'ficha foi alterada depois de registrada');
    }

    let ev;
    try {
      ev = normalizarEvidencia(JSON.parse(fs.readFileSync(pEvid, 'utf8')));
    } catch (err) {
      falha(cod, 'C1 evidencia', `evidência não é JSON válido: ${err.message}`);
      continue;
    }

    const rotulosBotoes = ev.botoes.map((b) => (b.label || '').trim()).filter(Boolean);
    const rotulosCampos = ev.inputs.map((c) => (c.rotulo || c.label || '').trim()).filter(Boolean);
    const bloqueada = e.classe_proposta === 'bloqueada';

    // ---- Checagem 2: nada na ficha que a evidencia nao sustente.
    if (fs.existsSync(pFicha) && !bloqueada) {
      const ficha = rotulosDaFicha(fs.readFileSync(pFicha, 'utf8'));
      for (const c of ficha.campos) {
        if (!rotulosCampos.includes(c)) falha(cod, 'C2 ficha-inventada', `campo "${c}" não existe na evidência`);
      }
      for (const b of ficha.botoes) {
        if (!rotulosBotoes.includes(b)) falha(cod, 'C2 ficha-inventada', `botão "${b}" não existe na evidência`);
      }
    }

    // ---- Checagem 3: `somente_leitura` nao admite verbo de escrita NA EVIDENCIA.
    if (e.classe_proposta === 'somente_leitura') {
      const suspeitos = rotulosBotoes.filter((b) => VERBOS_ESCRITA.test(b));
      if (suspeitos.length) {
        falha(cod, 'C3 classe-otimista', `marcada somente_leitura mas a evidência tem: ${suspeitos.join(', ')}`);
      }
    }

    // ---- Checagem 4: roteiro presente e URL coerente com a evidencia.
    if (!bloqueada) {
      const r = roteiro[cod];
      if (!r) {
        falha(cod, 'C4 roteiro', 'sem entrada em config/roteiro.json');
      } else if (ev.url && r.url_zul && !ev.url.includes(String(r.url_zul).replace(/^https?:\/\/[^/]+/, ''))) {
        falha(cod, 'C4 url', `roteiro diz "${r.url_zul}" mas a evidência veio de "${ev.url}"`);
      }
      if (ev.url && e.url_zul && !ev.url.includes(String(e.url_zul).replace(/^https?:\/\/[^/]+/, ''))) {
        falha(cod, 'C4 url', `JSONL diz "${e.url_zul}" mas a evidência veio de "${ev.url}"`);
      }
      if (!ev.url) {
        falha(cod, 'C4 url', 'evidência não carrega a URL da tela — origem não verificável');
      }
    }

    // ---- Checagem 6: tela vazia so pode ter desfecho declarado como vazio.
    if (rotulosCampos.length === 0 && rotulosBotoes.length === 0) {
      if (!['sem_campos_confirmado', 'bloqueada', 'sem_acesso'].includes(e.classe_proposta)) {
        falha(cod, 'C6 tela-vazia', `evidência sem campos e sem botões, mas classe é ${e.classe_proposta} (sessão expirada?)`);
      }
    }

    // ---- Checagem 7: safelist cobre a app e nao cita botao inexistente.
    if (!safelist.includes(cod)) {
      falha(cod, 'C7 safelist', 'sem linha em docs/SAFELIST_LEITURA.md');
    } else {
      // So o trecho "Botões: ..." e alegacao sobre a tela; o motivo pode citar
      // nomes de campo em crase sem que isso seja afirmacao de botao.
      const linhaSafe = safelist.split('\n').find((l) => l.includes(cod)) || '';
      const trecho = (linhaSafe.match(/Bot[õo]es\s*:([^|]*)/i) || [, ''])[1];
      for (const citado of [...trecho.matchAll(/`([^`]+)`/g)].map((m) => m[1].trim())) {
        if (!rotulosBotoes.includes(citado)) {
          falha(cod, 'C7 safelist-inventada', `declara o botão "${citado}", ausente da evidência`);
        }
      }
    }

    // ---- Checagem 8: contagens do JSONL reconciliam com a evidencia.
    if (typeof e.n_campos === 'number' && e.n_campos !== rotulosCampos.length) {
      falha(cod, 'C8 contagem', `JSONL diz ${e.n_campos} campos, evidência tem ${rotulosCampos.length}`);
    }
    const declarados = new Set([...(e.botoes || []), ...(e.botoes_ignorados || [])].map((s) => String(s).trim()));
    const naoDeclarados = [...new Set(rotulosBotoes)].filter((b) => !declarados.has(b));
    if (naoDeclarados.length) {
      falha(
        cod,
        'C8 botao-descartado',
        `evidência tem botões não declarados no JSONL: ${naoDeclarados.join(', ')} (use "botoes_ignorados" para descartar explicitamente)`
      );
    }
  }

  // ---- Checagem 8 (global): nenhuma app processada fora do JSONL.
  const noRoteiro = [...vistos.keys()].filter((c) => roteiro[c]).length;
  if (args.includes('--json')) {
    console.log(JSON.stringify({ auditados, divergencias }, null, 2));
    process.exit(divergencias.length ? 1 : 0);
  }

  const escopo = loteAlvo ? ` (lote ${loteAlvo})` : '';
  console.log(`Auditadas ${auditados} apps${escopo} · ${noRoteiro} com entrada em roteiro.json`);

  if (divergencias.length) {
    console.error(`\n${divergencias.length} divergência(s):\n`);
    for (const d of divergencias) console.error(`  [${d.checagem}] ${d.codigo}: ${d.msg}`);
    process.exit(1);
  }
  console.log('0 divergências.');
}

main();
