#!/usr/bin/env node
/**
 * Guarda de cota do OmniRoute — decide se o loop pode rodar.
 *
 *   node scripts/quota-guard.js            # texto + exit code
 *   node scripts/quota-guard.js --json     # JSON
 *
 * Exit: 0 = liberado · 10 = pausar (janela 5h) · 20 = parar (semanal)
 *
 * Os limiares sao em SALDO RESTANTE, nao em consumo: pausa quando resta pouco.
 *   5h      -> pausa com <= 15% restante (a janela reseta em horas, entao so freia
 *              perto do fim; o loop volta sozinho depois do reset)
 *   semanal -> para  com <= 30% restante (nao se recupera em horas: os 30% que
 *              sobram ficam reservados para o trabalho interativo do dia a dia)
 *
 * FONTE: `quota_snapshots` do storage.sqlite do OmniRoute, que e o mesmo dado do
 * dashboard em localhost:20128/dashboard/quota. A API HTTP exige autenticacao e o
 * `omniroute quota` do CLI responde "No quota information available" -- o banco e o
 * unico caminho que funciona sem token.
 *
 * A leitura e somente-leitura (mode=ro): nunca escreve no banco do OmniRoute.
 */
const { execFileSync } = require('child_process');
const path = require('path');
const os = require('os');

const DB = process.env.OMNIROUTE_DB ||
  path.join(os.homedir(), '.omniroute', 'storage.sqlite');

// O loop roda em gemini-3.7-flash-medium; a janela semanal e compartilhada.
const JANELA_CURTA = process.env.QUOTA_MODELO || 'gemini-3.7-flash-medium';
const JANELA_SEMANAL = 'gemini_weekly';

// Limiares em SALDO RESTANTE (remaining_percentage), nao em consumo.
const MIN_RESTANTE_5H = Number(process.env.QUOTA_MIN_RESTANTE_5H || 15);
const MIN_RESTANTE_SEMANAL = Number(process.env.QUOTA_MIN_RESTANTE_SEMANAL || 30);

function consultar() {
  const sql = `
    WITH ult AS (
      SELECT connection_id, window_key, remaining_percentage, is_exhausted, next_reset_at,
             ROW_NUMBER() OVER (PARTITION BY connection_id, window_key ORDER BY created_at DESC) rn
      FROM quota_snapshots
      WHERE window_key IN ('${JANELA_CURTA}','${JANELA_SEMANAL}')
        AND created_at > datetime('now','-6 hours')
    )
    SELECT connection_id, window_key, remaining_percentage, is_exhausted, next_reset_at
    FROM ult WHERE rn = 1;`;
  // Falha de leitura NAO pode virar permissao: banco ausente, sqlite3 indisponivel
  // ou schema mudado devolvem [] e o chamador trata como estado desconhecido -> PARAR.
  try {
    const saida = execFileSync('sqlite3', [`file:${DB}?mode=ro`, '-json', sql], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return saida.trim() ? JSON.parse(saida) : [];
  } catch (e) {
    return [];
  }
}

function avaliar() {
  const linhas = consultar();
  if (!linhas.length) {
    // Sem snapshot recente nao se inventa permissao: o OmniRoute pode estar parado.
    return { decisao: 'PARAR', motivo: 'sem snapshot de cota nas ultimas 6h — estado desconhecido', contas: [] };
  }

  const porConta = new Map();
  for (const l of linhas) {
    const c = porConta.get(l.connection_id) || { id: l.connection_id };
    const restante = Number(l.remaining_percentage);
    if (l.window_key === JANELA_CURTA) {
      c.restante5h = restante;
      c.reset5h = l.next_reset_at;
      c.esgotada = Boolean(l.is_exhausted);
    } else {
      c.restanteSemanal = restante;
    }
    porConta.set(l.connection_id, c);
  }
  const contas = [...porConta.values()].filter((c) => c.restante5h !== undefined);

  // A semanal e o recurso escasso e nao se recupera em horas: se a MEDIA das contas
  // caiu abaixo do piso, parar de vez. Uma conta sozinha com saldo nao salva a operacao.
  const mediaSemanal =
    contas.reduce((s, c) => s + (c.restanteSemanal ?? 100), 0) / (contas.length || 1);
  if (mediaSemanal <= MIN_RESTANTE_SEMANAL) {
    return {
      decisao: 'PARAR',
      motivo: `saldo semanal medio ${mediaSemanal.toFixed(1)}% <= ${MIN_RESTANTE_SEMANAL}%`,
      contas,
      mediaSemanal,
    };
  }

  // Na janela de 5h basta UMA conta com folga: o OmniRoute roteia para ela.
  // Pausar porque a conta X secou, tendo a Y cheia, seria desperdicio.
  const melhor = contas.reduce((a, b) => (a.restante5h >= b.restante5h ? a : b));
  if (melhor.restante5h <= MIN_RESTANTE_5H || melhor.esgotada) {
    const reset = melhor.reset5h ? new Date(melhor.reset5h) : null;
    const esperaMs = reset ? Math.max(0, reset - Date.now()) : 60 * 60 * 1000;
    return {
      decisao: 'PAUSAR',
      motivo: `melhor conta com apenas ${melhor.restante5h.toFixed(1)}% de saldo na janela de 5h (piso ${MIN_RESTANTE_5H}%)`,
      retomarEm: reset ? reset.toISOString() : null,
      esperaMinutos: Math.ceil(esperaMs / 60000),
      contas,
      mediaSemanal,
    };
  }

  return {
    decisao: 'OK',
    motivo: `melhor conta com ${melhor.restante5h.toFixed(1)}% de saldo (5h); media semanal ${mediaSemanal.toFixed(1)}%`,
    contas,
    mediaSemanal,
  };
}

const r = avaliar();
if (process.argv.includes('--json')) {
  console.log(JSON.stringify(r, null, 2));
} else {
  console.log(`[${r.decisao}] ${r.motivo}`);
  if (r.retomarEm) console.log(`  retomar em ${r.retomarEm} (${r.esperaMinutos} min)`);
  for (const c of r.contas) {
    console.log(
      `  ${c.id.slice(0, 8)} | 5h: ${(c.restante5h ?? 0).toFixed(1)}% restante | semana: ${(c.restanteSemanal ?? 0).toFixed(1)}% restante`
    );
  }
}
process.exit(r.decisao === 'OK' ? 0 : r.decisao === 'PAUSAR' ? 10 : 20);
