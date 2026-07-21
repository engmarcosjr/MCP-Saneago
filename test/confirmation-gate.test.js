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

test("confirmation gate handles numeroConta binding and format normalization", () => {
  const { args, env } = fixture();
  const previewArgs = { ...args, numeroConta: "123456-7" };
  const token = createPending(previewArgs, env, 1000);

  // Rejection when numeroConta is different
  assert.throws(
    () => consumeConfirmed(
      { ...previewArgs, numeroConta: "999999-9", confirmar: true, confirmationToken: token },
      env,
      2000
    ),
    /nao corresponde/
  );

  // Acceptance when numeroConta is identical
  const { args: args2, env: env2 } = fixture();
  const previewArgs2 = { ...args2, numeroConta: "123456-7" };
  const token2 = createPending(previewArgs2, env2, 1000);
  assert.doesNotThrow(() =>
    consumeConfirmed(
      { ...previewArgs2, numeroConta: "123456-7", confirmar: true, confirmationToken: token2 },
      env2,
      2000
    )
  );

  // Acceptance when numeroConta has different formatting normalizing to same digits ("1234567" vs "123456-7")
  const { args: args3, env: env3 } = fixture();
  const previewArgs3 = { ...args3, numeroConta: "123456-7" };
  const token3 = createPending(previewArgs3, env3, 1000);
  assert.doesNotThrow(() =>
    consumeConfirmed(
      { ...previewArgs3, numeroConta: "1234567", confirmar: true, confirmationToken: token3 },
      env3,
      2000
    )
  );
});

test("absence of numeroConta in preview and confirmation continues to work (regression)", () => {
  const { args, env } = fixture();

  // Explicitly ensure numeroConta is undefined / omitted
  assert.strictEqual(args.numeroConta, undefined);

  const token = createPending(args, env, 1000);
  const confirmed = { ...args, confirmar: true, confirmationToken: token };

  assert.doesNotThrow(() => consumeConfirmed(confirmed, env, 2000));
});

