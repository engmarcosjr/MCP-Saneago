"use strict";

const fs = require("fs");
const path = require("path");
const { SupervisorioHttpClient } = require("../supervisorio_http");

const ROOT_DIR = process.env.SUPERVISORIO_DATA_DIR || path.join(__dirname, "..", "..");

async function getClient() {
  const client = new SupervisorioHttpClient();
  // We assume the user has configured credentials.json
  if (process.env.SUPERVISORIO_OFFLINE !== "1") {
    await client.login(); 
  }
  return client;
}

/**
 * Leitura em tempo real por unidade/grupo (telemetria).
 */
async function saneago_supervisorio_telemetria({ unidade = 6, tipoComponente = 1 }) {
  if (!unidade) throw new Error("A unidade é obrigatória (ex: 6 para Anápolis).");
  
  if (process.env.SUPERVISORIO_OFFLINE === "1") {
    // Mock response for tests
    return {
      sucesso: true,
      origem: "mock_offline",
      data: [
        { id_componente: 243397, ds_componente: "Goialandia Apoiado:", ds_leitura: "10.5", dt_leitura: "2026-08-19 00:00:00", ds_grupo_componente: "Goiânia" }
      ]
    };
  }

  const client = await getClient();
  const res = await client.monitorarUnidade(unidade, tipoComponente);
  
  if (!res || !res.data) {
    throw new Error("Resposta inválida da API de telemetria.");
  }
  
  return {
    sucesso: true,
    origem: "online",
    data: res.data.slice(0, 100) // Limite default sensato para não estourar o retorno
  };
}

/**
 * Histórico e agregação.
 */
async function saneago_supervisorio_historico({ componentes, dInicial, dFinal, hInicial = "00:00:00", hFinal = "23:59:59", unidade = 6 }) {
  if (!componentes || componentes.length === 0) {
    throw new Error("A lista de componentes é obrigatória e não pode estar vazia.");
  }
  if (!dInicial || !dFinal) {
    throw new Error("Data inicial e data final são obrigatórias no formato YYYY-MM-DD.");
  }
  
  // Format check
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dInicial) || !/^\d{4}-\d{2}-\d{2}$/.test(dFinal)) {
    throw new Error("Datas devem estar no formato YYYY-MM-DD.");
  }

  let data = [];
  
  if (process.env.SUPERVISORIO_OFFLINE === "1") {
    const fixturePath = path.join(ROOT_DIR, "test", "fixtures", "supervisorio_historico_listar.json");
    if (fs.existsSync(fixturePath)) {
       data = JSON.parse(fs.readFileSync(fixturePath, "utf-8"));
    } else {
       throw new Error("Fixture offline não encontrada.");
    }
  } else {
    const client = await getClient();
    data = await client.consultarHistorico(componentes, dInicial, dFinal, hInicial, hFinal, unidade);
  }

  if (!Array.isArray(data)) {
    throw new Error("Resposta inesperada do histórico (não é um array).");
  }

  // Calculate aggregation
  const aggregations = {};
  
  data.forEach(p => {
    const cid = p.id_componente;
    const val = parseFloat(p.vl_leitura);
    
    if (isNaN(val)) return;
    
    if (!aggregations[cid]) {
       aggregations[cid] = { min: val, max: val, sum: val, count: 1 };
    } else {
       if (val < aggregations[cid].min) aggregations[cid].min = val;
       if (val > aggregations[cid].max) aggregations[cid].max = val;
       aggregations[cid].sum += val;
       aggregations[cid].count += 1;
    }
  });

  for (const cid in aggregations) {
    aggregations[cid].avg = aggregations[cid].sum / aggregations[cid].count;
    delete aggregations[cid].sum;
  }

  return {
    sucesso: true,
    agregacoes: aggregations,
    pontos: data.slice(0, 1000), // Limit output
    total_pontos: data.length
  };
}

/**
 * Minima noturna.
 */
async function saneago_supervisorio_minima_noturna({ unidade = 6, dmcId, dtIni, dtFim }) {
  if (!unidade || !dmcId || !dtIni || !dtFim) {
    throw new Error("unidade, dmcId, dtIni, dtFim são obrigatórios.");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dtIni) || !/^\d{4}-\d{2}-\d{2}$/.test(dtFim)) {
    throw new Error("Datas devem estar no formato YYYY-MM-DD.");
  }

  if (process.env.SUPERVISORIO_OFFLINE === "1") {
    return { sucesso: true, origem: "mock_offline", data: [{ dmc: dmcId, volume: "100" }] };
  }

  const client = await getClient();
  const res = await client.consultarMinimaNoturna(unidade, dmcId, dtIni, dtFim);
  
  return { sucesso: true, origem: "online", data: res };
}

/**
 * Listar componentes com cache lookup.
 */
async function saneago_supervisorio_listar_componentes({ unidade = 6, buscaTexto = "", grupo = "", limite = 100 }) {
  if (!unidade) throw new Error("A unidade é obrigatória.");

  let data = [];
  
  // T2: Cache de catálogo
  const cachePath = path.join(ROOT_DIR, "config", `supervisorio_componentes_${unidade}.json`);
  let loadedFromCache = false;

  if (fs.existsSync(cachePath)) {
    try {
      data = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
      loadedFromCache = true;
    } catch (e) {
      // Falha ao ler cache, ignorar
    }
  }

  if (!loadedFromCache) {
    if (process.env.SUPERVISORIO_OFFLINE === "1") {
       throw new Error(`Cache local supervisorio_componentes_${unidade}.json não encontrado, e ambiente offline ativo.`);
    }
    const client = await getClient();
    const res = await client.listarComponentes(unidade);
    if (res && res.data) {
       data = res.data;
       // T6: o cache em disco NÃO é atualizado aqui para manter o contrato de leitura puro.
       // Para popular/renovar o cache, execute o script administrativo offline:
       //   node scripts/atualizar_cache_supervisorio.js <unidade>
    }
  }

  // Filtragem
  let result = data;
  if (buscaTexto) {
    const bt = buscaTexto.toLowerCase();
    result = result.filter(c => 
       (c.ds_componente && c.ds_componente.toLowerCase().includes(bt)) ||
       (c.id_componente && String(c.id_componente).includes(bt))
    );
  }
  if (grupo) {
    const gr = grupo.toLowerCase();
    result = result.filter(c => 
       (c.ds_grupo_componente && c.ds_grupo_componente.toLowerCase().includes(gr))
    );
  }

  return {
    sucesso: true,
    origem: loadedFromCache ? "cache" : "online",
    total_encontrados: result.length,
    dados: result.slice(0, limite),
    limite_aplicado: limite
  };
}

/**
 * Listar DMCs.
 */
async function saneago_supervisorio_listar_dmcs({ unidade = 6 }) {
  if (!unidade) throw new Error("A unidade é obrigatória.");

  if (process.env.SUPERVISORIO_OFFLINE === "1") {
    return { sucesso: true, origem: "mock_offline", data: [{ id_dmc: 1, ds_dmc: "DMC Mock" }] };
  }

  const client = await getClient();
  const res = await client.consultarDMCs(unidade);
  
  return { sucesso: true, origem: "online", data: res };
}

/**
 * Horímetro de bomba/conjunto motor-bomba.
 */
async function saneago_supervisorio_horimetro({ unidade = 6, componente, dtIni, dtFim, detalhado = false }) {
  if (!unidade || !componente || !dtIni || !dtFim) {
    throw new Error("unidade, componente, dtIni e dtFim são obrigatórios.");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dtIni) || !/^\d{4}-\d{2}-\d{2}$/.test(dtFim)) {
    throw new Error("Datas devem estar no formato YYYY-MM-DD.");
  }

  if (process.env.SUPERVISORIO_OFFLINE === "1") {
    // Mock response for tests
    return {
      sucesso: true,
      origem: "mock_offline",
      data: detalhado 
        ? [{ id_componente: componente, evento: "Ligou", dt_evento: dtIni + " 08:00:00" }]
        : [{ id_componente: componente, horas: "12.5", data: dtIni }]
    };
  }

  const client = await getClient();
  const res = await client.consultarHorimetro(unidade, componente, dtIni, dtFim, detalhado);
  
  return { sucesso: true, origem: "online", data: res };
}

module.exports = {
  saneago_supervisorio_telemetria,
  saneago_supervisorio_historico,
  saneago_supervisorio_minima_noturna,
  saneago_supervisorio_listar_componentes,
  saneago_supervisorio_listar_dmcs,
  saneago_supervisorio_horimetro
};
