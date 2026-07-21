"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const DEFAULT_TTL_MS = 15 * 60 * 1000;

function sessionId(env = process.env) {
  const value = String(env.DAN01_SESSION_ID || "").trim();
  if (!/^[a-zA-Z0-9._-]{1,128}$/.test(value)) {
    throw new Error("Sessao DAN01 ausente ou invalida para confirmar a abertura de RA.");
  }
  return value;
}

function stateDir(env = process.env) {
  return env.SANEAGO_CONFIRMATION_DIR
    ? path.resolve(env.SANEAGO_CONFIRMATION_DIR)
    : path.join(__dirname, "..", ".auth", "confirmations");
}

function statePath(env = process.env) {
  return path.join(stateDir(env), `${sessionId(env)}.json`);
}

function canonicalArgs(args = {}) {
  const normalized = {
    endereco: String(args.endereco || "").trim().replace(/\s+/g, " "),
    servico: String(args.servico || "").trim().replace(/\s+/g, " "),
    formaAtendimento: String(args.formaAtendimento || "3 - INTERNO").trim().replace(/\s+/g, " "),
    nomeCliente: String(args.nomeCliente || "").trim().replace(/\s+/g, " "),
    nomeContato: String(args.nomeContato || "SANEAGO").trim().replace(/\s+/g, " "),
    telefoneContato: String(args.telefoneContato || "6299999999").replace(/\D/g, ""),
    numeroConta: String(args.numeroConta || "").replace(/\D/g, ""),
  };
  return JSON.stringify(normalized);
}

function createPending(args, env = process.env, now = Date.now()) {
  const dir = stateDir(env);
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });

  const pending = {
    token: crypto.randomBytes(24).toString("base64url"),
    args: canonicalArgs(args),
    createdAt: now,
    expiresAt: now + Number(env.SANEAGO_CONFIRMATION_TTL_MS || DEFAULT_TTL_MS),
  };
  fs.writeFileSync(statePath(env), JSON.stringify(pending), { mode: 0o600 });
  return pending.token;
}

function consumeConfirmed(args, env = process.env, now = Date.now()) {
  if (String(env.SANEAGO_CONFIRMATION_GRANTED || "") !== "1") {
    throw new Error("A abertura real exige confirmacao explicita do usuario em uma nova mensagem.");
  }

  const file = statePath(env);
  let pending;
  try {
    pending = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    throw new Error("Nao existe uma pre-visualizacao pendente para esta sessao.");
  }

  if (!pending.expiresAt || pending.expiresAt < now) {
    fs.rmSync(file, { force: true });
    throw new Error("A pre-visualizacao expirou. Prepare a abertura novamente.");
  }

  const supplied = String(args.confirmationToken || "");
  const expected = String(pending.token || "");
  const tokenMatches =
    supplied.length === expected.length &&
    supplied.length > 0 &&
    crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));

  if (!tokenMatches || canonicalArgs(args) !== pending.args) {
    throw new Error("A confirmacao nao corresponde exatamente a pre-visualizacao pendente.");
  }

  // Consume before the portal submit so a timeout cannot be replayed blindly.
  fs.rmSync(file, { force: true });
}

module.exports = {
  canonicalArgs,
  consumeConfirmed,
  createPending,
};
