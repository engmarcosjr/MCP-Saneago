"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const {
  canonicalArgs,
  consumeConfirmed,
  createPending,
} = require("../src/confirmation-gate");

function fixture(tool = "saneago_abrir_ra") {
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
  return { args, dir, env, tool };
}

test("confirmation is bound to the exact preview and consumed once", () => {
  const { args, env, tool } = fixture();
  const token = createPending(tool, args, env, 1000);
  const confirmed = { ...args, confirmar: true, confirmationToken: token };

  assert.doesNotThrow(() => consumeConfirmed(tool, confirmed, env, 2000));
  assert.throws(() => consumeConfirmed(tool, confirmed, env, 2000), /pre-visualizacao pendente/);
});

test("confirmation requires a server-side grant", () => {
  const { args, env, tool } = fixture();
  const token = createPending(tool, args, env, 1000);

  assert.throws(
    () => consumeConfirmed(
      tool,
      { ...args, confirmar: true, confirmationToken: token },
      { ...env, SANEAGO_CONFIRMATION_GRANTED: "0" },
      2000
    ),
    /confirmacao explicita/
  );
});

test("confirmation rejects changed arguments and expired previews", () => {
  const first = fixture();
  const token = createPending(first.tool, first.args, first.env, 1000);
  assert.throws(
    () => consumeConfirmed(
      first.tool,
      { ...first.args, servico: "999", confirmar: true, confirmationToken: token },
      first.env,
      2000
    ),
    /nao corresponde/
  );

  const second = fixture();
  const expiredToken = createPending(
    second.tool,
    second.args,
    { ...second.env, SANEAGO_CONFIRMATION_TTL_MS: "10" },
    1000
  );
  assert.throws(
    () => consumeConfirmed(
      second.tool,
      { ...second.args, confirmar: true, confirmationToken: expiredToken },
      second.env,
      2000
    ),
    /expirou/
  );
});

test("confirmation gate handles numeroConta binding and format normalization", () => {
  const { args, env, tool } = fixture();
  const previewArgs = { ...args, numeroConta: "123456-7" };
  const token = createPending(tool, previewArgs, env, 1000);

  // Rejection when numeroConta is different
  assert.throws(
    () => consumeConfirmed(
      tool,
      { ...previewArgs, numeroConta: "999999-9", confirmar: true, confirmationToken: token },
      env,
      2000
    ),
    /nao corresponde/
  );

  // Acceptance when numeroConta is identical
  const { args: args2, env: env2, tool: tool2 } = fixture();
  const previewArgs2 = { ...args2, numeroConta: "123456-7" };
  const token2 = createPending(tool2, previewArgs2, env2, 1000);
  assert.doesNotThrow(() =>
    consumeConfirmed(
      tool2,
      { ...previewArgs2, numeroConta: "123456-7", confirmar: true, confirmationToken: token2 },
      env2,
      2000
    )
  );

  // Acceptance when numeroConta has different formatting normalizing to same digits ("1234567" vs "123456-7")
  const { args: args3, env: env3, tool: tool3 } = fixture();
  const previewArgs3 = { ...args3, numeroConta: "123456-7" };
  const token3 = createPending(tool3, previewArgs3, env3, 1000);
  assert.doesNotThrow(() =>
    consumeConfirmed(
      tool3,
      { ...previewArgs3, numeroConta: "1234567", confirmar: true, confirmationToken: token3 },
      env3,
      2000
    )
  );
});

test("absence of numeroConta in preview and confirmation continues to work (regression)", () => {
  const { args, env, tool } = fixture();

  // Explicitly ensure numeroConta is undefined / omitted
  assert.strictEqual(args.numeroConta, undefined);

  const token = createPending(tool, args, env, 1000);
  const confirmed = { ...args, confirmar: true, confirmationToken: token };

  assert.doesNotThrow(() => consumeConfirmed(tool, confirmed, env, 2000));
});

test("confirmation gate supports legacy signature without explicit tool name", () => {
  const { args, env } = fixture();
  const token = createPending(args, env, 1000);
  const confirmed = { ...args, confirmar: true, confirmationToken: token };

  assert.doesNotThrow(() => consumeConfirmed(confirmed, env, 2000));
});

test("lrs105_lancar_servico: rejects when argument is changed", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dan01-confirm-"));
  const env = {
    DAN01_SESSION_ID: "user.session-1",
    SANEAGO_CONFIRMATION_DIR: dir,
    SANEAGO_CONFIRMATION_GRANTED: "1",
  };
  const tool = "saneago_lrs105_lancar_servico";
  const args = {
    ra: "123",
    codigoServicoResposta: "456",
    observacao: "ok",
    confirmar: false,
  };

  const token = createPending(tool, args, env, 1000);

  // Rejeita se trocar codigoServicoResposta por "789"
  assert.throws(
    () => consumeConfirmed(
      tool,
      { ...args, codigoServicoResposta: "789", confirmar: true, confirmationToken: token },
      env,
      2000
    ),
    /nao corresponde/
  );

  // Aceita com argumentos idênticos
  assert.doesNotThrow(() =>
    consumeConfirmed(
      tool,
      { ...args, confirmar: true, confirmationToken: token },
      env,
      2000
    )
  );
});

test("cross-tool token reuse is prevented (abrir_ra vs lrs105_lancar_servico)", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dan01-confirm-"));
  const env = {
    DAN01_SESSION_ID: "user.session-1",
    SANEAGO_CONFIRMATION_DIR: dir,
    SANEAGO_CONFIRMATION_GRANTED: "1",
  };

  const raArgs = {
    endereco: "Rua A, 10",
    servico: "123",
    confirmar: false,
  };
  const raToken = createPending("saneago_abrir_ra", raArgs, env, 1000);

  const lrsArgs = {
    ra: "123",
    codigoServicoResposta: "456",
    observacao: "ok",
    confirmar: true,
    confirmationToken: raToken,
  };

  // Token gerado para saneago_abrir_ra NÃO pode ser usado para confirmar saneago_lrs105_lancar_servico
  assert.throws(
    () => consumeConfirmed("saneago_lrs105_lancar_servico", lrsArgs, env, 2000),
    /pre-visualizacao pendente/
  );
});

test("pending previews for abrir_ra and lancar_servico coexist in the same session without overwriting", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dan01-confirm-"));
  const env = {
    DAN01_SESSION_ID: "user.session-1",
    SANEAGO_CONFIRMATION_DIR: dir,
    SANEAGO_CONFIRMATION_GRANTED: "1",
  };

  const raArgs = {
    endereco: "Rua Teste, 100",
    servico: "123",
    confirmar: false,
  };
  const lrsArgs = {
    ra: "98765",
    codigoServicoResposta: "456",
    observacao: "servico ok",
    confirmar: false,
  };

  const tokenRA = createPending("saneago_abrir_ra", raArgs, env, 1000);
  const tokenLRS = createPending("saneago_lrs105_lancar_servico", lrsArgs, env, 1000);

  // Ambos os arquivos devem existir no disco
  const fileRA = path.join(dir, "user.session-1.saneago_abrir_ra.json");
  const fileLRS = path.join(dir, "user.session-1.saneago_lrs105_lancar_servico.json");
  assert.ok(fs.existsSync(fileRA), "Arquivo do state de abrir_ra deve existir");
  assert.ok(fs.existsSync(fileLRS), "Arquivo do state de lancar_servico deve existir");

  // Confirmar LRS não deve consumir RA
  assert.doesNotThrow(() =>
    consumeConfirmed(
      "saneago_lrs105_lancar_servico",
      { ...lrsArgs, confirmar: true, confirmationToken: tokenLRS },
      env,
      2000
    )
  );
  assert.strictEqual(fs.existsSync(fileLRS), false, "LRS consumido deve ter sido removido");
  assert.strictEqual(fs.existsSync(fileRA), true, "RA ainda deve estar pendente");

  // Confirmar RA subsequentemente
  assert.doesNotThrow(() =>
    consumeConfirmed(
      "saneago_abrir_ra",
      { ...raArgs, confirmar: true, confirmationToken: tokenRA },
      env,
      2000
    )
  );
  assert.strictEqual(fs.existsSync(fileRA), false, "RA consumido deve ter sido removido");
});
