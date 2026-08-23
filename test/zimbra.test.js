"use strict";

const test = require("node:test");
const assert = require("node:assert");
const { 
  saneago_webmail_buscar, 
  saneago_webmail_ler_thread, 
  saneago_webmail_listar_pastas 
} = require("../src/tools/zimbra");
const path = require("path");
const fs = require("fs");

test("Zimbra Tools (Offline)", async (t) => {
  // Configura ambiente offline
  process.env.ZIMBRA_OFFLINE = "1";

  await t.test("saneago_webmail_buscar - retorna metadados limitados paginados", async () => {
    const res = await saneago_webmail_buscar({ query: "teste", limite: 10, offset: 0 });
    assert.strictEqual(res.sucesso, true);
    assert.strictEqual(res.total_retornado, 1);
    assert.strictEqual(res.limite_aplicado, 10);
    assert.strictEqual(res.offset_aplicado, 0);
    assert.strictEqual(res.mensagens[0].id, "12345");
    assert.strictEqual(res.mensagens[0].assunto, "Assunto Teste");
    assert.strictEqual(res.mensagens[0].remetente.email, "remetente@ficticio.com");
  });

  await t.test("saneago_webmail_buscar - respeita limite de seguranca maximo (200)", async () => {
    const res = await saneago_webmail_buscar({ query: "teste", limite: 500, offset: 0 });
    assert.strictEqual(res.sucesso, true);
    assert.strictEqual(res.limite_aplicado, 200);
  });

  await t.test("saneago_webmail_buscar - caso nada encontrado (mock vazio)", async () => {
    // Para simular nada encontrado, vamos trocar a fixture temporariamente
    const fixturePath = path.resolve(__dirname, "fixtures", "zimbra_buscar.json");
    const original = fs.readFileSync(fixturePath, "utf8");
    fs.writeFileSync(fixturePath, JSON.stringify({ m: [] }));
    
    try {
      const res = await saneago_webmail_buscar({ query: "nao_existe" });
      assert.strictEqual(res.sucesso, true);
      assert.strictEqual(res.total_retornado, 0);
      assert.strictEqual(res.mensagens.length, 0);
    } finally {
      // Restaura
      fs.writeFileSync(fixturePath, original);
    }
  });

  await t.test("saneago_webmail_ler_thread - erro ao passar sem ID", async () => {
    await assert.rejects(
      async () => {
        await saneago_webmail_ler_thread({});
      },
      /O 'id' da mensagem\/conversa é obrigatório/
    );
  });

  await t.test("saneago_webmail_ler_thread - retorna conteudo completo", async () => {
    const res = await saneago_webmail_ler_thread({ id: "12345" });
    assert.strictEqual(res.sucesso, true);
    assert.strictEqual(res.mensagens_na_conversa, 1);
    assert.strictEqual(res.mensagens[0].corpo, "Conteudo completo da mensagem teste.");
  });

  await t.test("saneago_webmail_listar_pastas - retorna arvore mapeada", async () => {
    const res = await saneago_webmail_listar_pastas();
    assert.strictEqual(res.sucesso, true);
    assert.strictEqual(res.pastas.length, 1);
    assert.strictEqual(res.pastas[0].nome, "USER_ROOT");
    assert.strictEqual(res.pastas[0].subpastas.length, 2);
    assert.strictEqual(res.pastas[0].subpastas[0].nome, "Inbox");
    assert.strictEqual(res.pastas[0].subpastas[0].total, 5);
  });
});
