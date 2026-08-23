const test = require("node:test");
const assert = require("node:assert");

// Force offline mode
process.env.SUPERVISORIO_OFFLINE = "1";

const {
  saneago_supervisorio_telemetria,
  saneago_supervisorio_historico,
  saneago_supervisorio_minima_noturna,
  saneago_supervisorio_listar_componentes,
  saneago_supervisorio_listar_dmcs,
  saneago_supervisorio_horimetro
} = require("../src/tools/supervisorio");

test("supervisorio tool - telemetria via mock_offline", async (t) => {
  const result = await saneago_supervisorio_telemetria({ unidade: 6 });
  assert.strictEqual(result.sucesso, true);
  assert.strictEqual(result.origem, "mock_offline");
  assert.ok(Array.isArray(result.data));
  assert.strictEqual(result.data[0].id_componente, 243397);
});

test("supervisorio tool - historico via mock_offline parse and aggregate", async (t) => {
  const result = await saneago_supervisorio_historico({
    componentes: [243397],
    dInicial: "2026-08-19",
    dFinal: "2026-08-20"
  });
  
  assert.strictEqual(result.sucesso, true);
  assert.ok(result.pontos.length > 0);
  assert.strictEqual(result.total_pontos, result.pontos.length);
  
  // Aggregate asserts
  assert.ok(result.agregacoes["243397"]);
  const agg = result.agregacoes["243397"];
  assert.strictEqual(typeof agg.min, "number");
  assert.strictEqual(typeof agg.max, "number");
  assert.strictEqual(typeof agg.avg, "number");
  assert.strictEqual(agg.count, result.pontos.length);
});

test("supervisorio tool - historico missing args", async (t) => {
  await assert.rejects(
    async () => await saneago_supervisorio_historico({ componentes: [] }),
    /A lista de componentes é obrigatória/
  );
  
  await assert.rejects(
    async () => await saneago_supervisorio_historico({ componentes: [123], dInicial: "2026-08-19" }),
    /Data inicial e data final/
  );
  
  await assert.rejects(
    async () => await saneago_supervisorio_historico({ componentes: [123], dInicial: "26-08-19", dFinal: "2026-08-20" }),
    /formato YYYY-MM-DD/
  );
});

test("supervisorio tool - minima noturna via mock_offline", async (t) => {
  const result = await saneago_supervisorio_minima_noturna({
    unidade: 6, dmcId: 1, dtIni: "2026-08-19", dtFim: "2026-08-20"
  });
  assert.strictEqual(result.sucesso, true);
  assert.strictEqual(result.origem, "mock_offline");
});

test("supervisorio tool - listar componentes via cache local", async (t) => {
  const result = await saneago_supervisorio_listar_componentes({ unidade: 6, limite: 100 });
  assert.strictEqual(result.sucesso, true);
  assert.strictEqual(result.origem, "cache");
  assert.ok(Array.isArray(result.dados));
  assert.ok(result.total_encontrados > 0);
});

test("supervisorio tool - listar componentes filtrados", async (t) => {
  const result = await saneago_supervisorio_listar_componentes({ unidade: 6, buscaTexto: "Goialandia" });
  assert.strictEqual(result.sucesso, true);
  assert.ok(result.dados.length > 0);
  assert.ok(result.dados[0].ds_componente.includes("Goialandia"));
});

test("supervisorio tool - listar DMCs via mock_offline", async (t) => {
  const result = await saneago_supervisorio_listar_dmcs({ unidade: 6 });
  assert.strictEqual(result.sucesso, true);
  assert.strictEqual(result.origem, "mock_offline");
});

test("supervisorio tool - horimetro historico via mock_offline", async (t) => {
  const result = await saneago_supervisorio_horimetro({
    unidade: 6, componente: 1234, dtIni: "2026-08-19", dtFim: "2026-08-20"
  });
  assert.strictEqual(result.sucesso, true);
  assert.strictEqual(result.origem, "mock_offline");
  assert.strictEqual(result.data[0].horas, "12.5");
});

test("supervisorio tool - horimetro evento via mock_offline", async (t) => {
  const result = await saneago_supervisorio_horimetro({
    unidade: 6, componente: 1234, dtIni: "2026-08-19", dtFim: "2026-08-20", detalhado: true
  });
  assert.strictEqual(result.sucesso, true);
  assert.strictEqual(result.origem, "mock_offline");
  assert.strictEqual(result.data[0].evento, "Ligou");
});

test("supervisorio tool - horimetro missing args and bad dates", async (t) => {
  await assert.rejects(
    async () => await saneago_supervisorio_horimetro({ componente: 1234, dtIni: "2026-08-19" }),
    /unidade, componente, dtIni e dtFim são obrigatórios/
  );
  await assert.rejects(
    async () => await saneago_supervisorio_horimetro({ unidade: 6, componente: 123, dtIni: "26-08-19", dtFim: "2026-08-20" }),
    /formato YYYY-MM-DD/
  );
});
