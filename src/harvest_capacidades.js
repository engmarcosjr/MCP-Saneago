const fs = require('fs');
const path = require('path');
const { getOrCreateSession, closeSession } = require('./session');
const { abrirApp } = require('./portal');
const { inspecionarTela } = require('./inspector');

const ROOT_DIR = path.resolve(__dirname, '..');
const CATALOGO_PATH = path.join(ROOT_DIR, 'config', 'catalogo_aplicacoes.json');
const DEFAULT_SAIDA_PATH = path.join(ROOT_DIR, 'config', 'capacidades.json');

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    resume: false,
    apenas: null,
    limite: null,
    desde: null,
    saida: DEFAULT_SAIDA_PATH,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--resume') {
      options.resume = true;
    } else if (arg === '--apenas' && i + 1 < args.length) {
      options.apenas = args[++i].split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    } else if (arg === '--limite' && i + 1 < args.length) {
      options.limite = parseInt(args[++i], 10);
    } else if (arg === '--desde' && i + 1 < args.length) {
      options.desde = args[++i].trim().toUpperCase();
    } else if (arg === '--saida' && i + 1 < args.length) {
      options.saida = path.resolve(process.cwd(), args[++i]);
    }
  }

  return options;
}

function loadOutput(filePath) {
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (Array.isArray(data)) {
        const map = new Map();
        data.forEach(item => {
          if (item && item.codigo) map.set(item.codigo, item);
        });
        return map;
      }
    } catch (e) {
      console.error(`[Harvest] Aviso: falha ao ler arquivo de saída existente (${filePath}): ${e.message}`);
    }
  }
  return new Map();
}

function saveOutput(filePath, map, catalogo) {
  const catalogoOrd = catalogo.map(a => a.codigo);
  const result = [];
  
  catalogoOrd.forEach(cod => {
    if (map.has(cod)) {
      result.push(map.get(cod));
    }
  });

  for (const [cod, entry] of map.entries()) {
    if (!catalogoOrd.includes(cod)) {
      result.push(entry);
    }
  }

  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(result, null, 2), 'utf8');
}

function timeoutPromise(ms, promise) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Timeout de captura (${Math.round(ms / 1000)}s)`));
    }, ms);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

async function main() {
  const options = parseArgs();
  console.error(`[Harvest] Iniciando varredura de capacidades de aplicações...`);
  console.error(`[Harvest] Opções: resume=${options.resume}, apenas=${options.apenas ? options.apenas.join(',') : 'todos'}, limite=${options.limite || 'sem limite'}, desde=${options.desde || 'início'}, saída=${options.saida}`);

  if (!fs.existsSync(CATALOGO_PATH)) {
    throw new Error(`Catálogo não encontrado em: ${CATALOGO_PATH}`);
  }

  const catalogo = JSON.parse(fs.readFileSync(CATALOGO_PATH, 'utf8'));
  const resultMap = loadOutput(options.saida);

  let apps = [...catalogo];

  if (options.desde) {
    const idx = apps.findIndex(a => a.codigo === options.desde);
    if (idx !== -1) {
      apps = apps.slice(idx);
    } else {
      console.error(`[Harvest] Código --desde "${options.desde}" não encontrado no catálogo.`);
    }
  }

  if (options.apenas && options.apenas.length > 0) {
    apps = apps.filter(a => options.apenas.includes(a.codigo));
  }

  if (options.resume) {
    apps = apps.filter(a => {
      const existing = resultMap.get(a.codigo);
      return !existing || !!existing.erro;
    });
  }

  if (options.limite && options.limite > 0) {
    apps = apps.slice(0, options.limite);
  }

  const total = apps.length;
  console.error(`[Harvest] Total de aplicações a processar nesta rodada: ${total}`);

  if (total === 0) {
    console.error(`[Harvest] Nenhuma aplicação a processar.`);
    return;
  }

  for (let index = 0; index < total; index++) {
    const app = apps[index];
    const prefixoLog = `[${index + 1}/${total}] ${app.codigo}`;

    const registro = {
      codigo: app.codigo,
      nome: app.nome,
      url_real: "",
      tecnologia: "desconhecida",
      titulo_tela: "",
      inputs: [],
      botoes: [],
      colunas: [],
      capturado_em: new Date().toISOString(),
      erro: null
    };

    try {
      await timeoutPromise(45000, (async () => {
        const frame = await abrirApp(app.codigo);
        const inspect = await inspecionarTela(frame);

        registro.url_real = frame.url();
        registro.tecnologia = inspect.tecnologia || "zk";
        registro.titulo_tela = inspect.titulo_tela || "";
        registro.inputs = (inspect.inputs || []).map(i => ({
          rotulo: i.rotulo || i.label || "Sem Rotulo",
          tipo: i.tipo || "text",
          maxlength: i.maxlength || null,
          readonly: i.readonly || false,
          opcoes: i.opcoes || undefined,
          total_opcoes: i.total_opcoes || undefined,
          opcoes_truncadas: i.opcoes_truncadas || undefined
        }));
        registro.botoes = (inspect.botoes || inspect.buttons || []).map(b => ({
          label: b.label || "Sem Rotulo",
          tipo: b.tipo || "button"
        }));
        registro.colunas = inspect.colunas || [];
        registro.capturado_em = new Date().toISOString();
        registro.erro = null;
      })());

      console.error(`${prefixoLog} ok — ${registro.inputs.length} inputs, ${registro.botoes.length} botoes`);

    } catch (err) {
      const msg = err.message || String(err);
      registro.erro = msg;
      registro.capturado_em = new Date().toISOString();
      console.error(`${prefixoLog} FALHA: ${msg}`);
    }

    resultMap.set(app.codigo, registro);
    saveOutput(options.saida, resultMap, catalogo);
  }

  console.error(`[Harvest] Varredura concluída. Resultados salvos em: ${options.saida}`);
  await closeSession().catch(() => {});
}

if (require.main === module) {
  main().catch(err => {
    console.error(`[Harvest] Erro fatal no script de varredura:`, err);
    process.exit(1);
  });
}

module.exports = { parseArgs, loadOutput, saveOutput };
