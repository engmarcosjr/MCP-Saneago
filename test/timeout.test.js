"use strict";

/**
 * P1 (FASE 16) — Prova de que os clientes HTTP nativos NAO ficam pendurados.
 *
 * Sem timeout, uma resposta que nunca fecha deixa a promise pendente para sempre e
 * trava o processo MCP inteiro (nao apenas aquela chamada). Estes testes sobem um
 * servidor local que aceita a conexao e deliberadamente NUNCA responde, e exigem que
 * o cliente rejeite com mensagem clara dentro do prazo.
 *
 * 100% offline: nada sai para a rede externa.
 */

const { test } = require("node:test");
const assert = require("node:assert");
const net = require("node:net");

const { SupervisorioHttpClient } = require("../src/supervisorio_http");

function servidorMudo() {
  return new Promise((resolve) => {
    // Aceita a conexao TCP e nunca fala nada — o caso patologico que trava o MCP.
    const srv = net.createServer(() => {});
    srv.listen(0, "127.0.0.1", () => resolve(srv));
  });
}

test("supervisorio: request rejeita por timeout em vez de ficar pendurado", async () => {
  const srv = await servidorMudo();
  const { port } = srv.address();
  try {
    const client = new SupervisorioHttpClient({
      hostname: "127.0.0.1",
      hostHeader: "127.0.0.1",
      timeoutMs: 300
    });

    const inicio = Date.now();
    await assert.rejects(
      () => client.request({ port, path: "/nunca-responde", method: "GET" }),
      (err) => {
        assert.match(err.message, /[Tt]imeout/, "mensagem deve citar timeout");
        assert.ok(!/\n\s+at /.test(err.message), "mensagem nao pode conter stack trace");
        return true;
      }
    );
    // Prova que rejeitou por timeout, e nao ficou pendente ate o runner desistir.
    assert.ok(Date.now() - inicio < 2000, "deve rejeitar no prazo configurado (300ms), nao no default do SO");
  } finally {
    srv.close();
  }
});

test("supervisorio: mensagem de timeout identifica o endpoint", async () => {
  const srv = await servidorMudo();
  const { port } = srv.address();
  try {
    const client = new SupervisorioHttpClient({
      hostname: "127.0.0.1",
      hostHeader: "127.0.0.1",
      timeoutMs: 300
    });
    await assert.rejects(
      () => client.request({ port, path: "/endpoint-diagnostico", method: "GET" }),
      (err) => {
        assert.match(err.message, /endpoint-diagnostico/, "deve citar o path para diagnostico");
        return true;
      }
    );
  } finally {
    srv.close();
  }
});

test("supervisorio: timeoutMs tem default e e configuravel", () => {
  const padrao = new SupervisorioHttpClient({});
  assert.ok(padrao.timeoutMs > 0, "default deve ser positivo (sem timeout = trava o MCP)");
  const custom = new SupervisorioHttpClient({ timeoutMs: 1234 });
  assert.strictEqual(custom.timeoutMs, 1234);
});

const { ZimbraClient } = (() => {
  const mod = require("../src/zimbra");
  return { ZimbraClient: mod.ZimbraClient || mod.ZimbraHttpClient || Object.values(mod).find(v => typeof v === "function") };
})();

test("zimbra: request rejeita por timeout em vez de ficar pendurado", async (t) => {
  if (!ZimbraClient) return t.skip("cliente Zimbra nao exportado como classe");
  const srv = await servidorMudo();
  const { port } = srv.address();
  try {
    const client = new ZimbraClient({ hostname: "127.0.0.1", hostHeader: "127.0.0.1", timeoutMs: 300 });
    const inicio = Date.now();
    await assert.rejects(
      () => client.request({ port, path: "/nunca-responde", method: "GET" }),
      (err) => {
        assert.match(err.message, /[Tt]imeout/);
        assert.ok(!/\n\s+at /.test(err.message), "sem stack trace");
        return true;
      }
    );
    assert.ok(Date.now() - inicio < 2000, "deve rejeitar no prazo configurado");
  } finally {
    srv.close();
  }
});
