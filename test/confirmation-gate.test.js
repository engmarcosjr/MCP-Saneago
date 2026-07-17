"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const {
  consumeConfirmed,
  createPending,
} = require("../src/confirmation-gate");

function fixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dan01-confirm-"));
  const env = {
    DAN01_SESSION_ID: "user.session-1",
    SANEAGO_CONFIRMATION_DIR: dir,
    SANEAGO_CONFIRMATION_GRANTED: "1",
  };
  const args = {
    endereco: "Rua A, numero 10, CEP 75000-000",
    servico: "123",
    confirmar: false,
    nomeCliente: "Pessoa Teste",
  };
  return { args, dir, env };
}

test("confirmation is bound to the exact preview and consumed once", () => {
  const { args, env } = fixture();
  const token = createPending(args, env, 1000);
  const confirmed = { ...args, confirmar: true, confirmationToken: token };

  assert.doesNotThrow(() => consumeConfirmed(confirmed, env, 2000));
  assert.throws(() => consumeConfirmed(confirmed, env, 2000), /pre-visualizacao pendente/);
});

test("confirmation requires a server-side grant", () => {
  const { args, env } = fixture();
  const token = createPending(args, env, 1000);

  assert.throws(
    () => consumeConfirmed(
      { ...args, confirmar: true, confirmationToken: token },
      { ...env, SANEAGO_CONFIRMATION_GRANTED: "0" },
      2000
    ),
    /confirmacao explicita/
  );
});

test("confirmation rejects changed arguments and expired previews", () => {
  const first = fixture();
  const token = createPending(first.args, first.env, 1000);
  assert.throws(
    () => consumeConfirmed(
      { ...first.args, servico: "999", confirmar: true, confirmationToken: token },
      first.env,
      2000
    ),
    /nao corresponde/
  );

  const second = fixture();
  const expiredToken = createPending(
    second.args,
    { ...second.env, SANEAGO_CONFIRMATION_TTL_MS: "10" },
    1000
  );
  assert.throws(
    () => consumeConfirmed(
      { ...second.args, confirmar: true, confirmationToken: expiredToken },
      second.env,
      2000
    ),
    /expirou/
  );
});
