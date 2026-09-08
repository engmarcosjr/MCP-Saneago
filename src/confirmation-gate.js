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

function sanitizeTool(tool) {
  const t = String(tool || "").trim();
  if (!t) {
    throw new Error("Nome da ferramenta (tool) ausente para o gate de confirmacao.");
  }
  return t.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function statePath(tool, env = process.env) {
  const safeTool = sanitizeTool(tool);
  return path.join(stateDir(env), `${sessionId(env)}.${safeTool}.json`);
}

function canonicalArgs(toolOrArgs, maybeArgs) {
  let tool;
  let args;
  if (typeof toolOrArgs === "string") {
    tool = toolOrArgs;
    args = maybeArgs || {};
  } else {
    tool = "saneago_abrir_ra";
    args = toolOrArgs || {};
  }

  const normalized = {
    tool: String(tool || "").trim(),
  };

  if (tool === "saneago_abrir_ra") {
    normalized.endereco = String(args.endereco || "").trim().replace(/\s+/g, " ");
    normalized.servico = String(args.servico || "").trim().replace(/\s+/g, " ");
    normalized.formaAtendimento = String(args.formaAtendimento || "3 - INTERNO").trim().replace(/\s+/g, " ");
    normalized.nomeCliente = String(args.nomeCliente || "").trim().replace(/\s+/g, " ");
    normalized.nomeContato = String(args.nomeContato || "SANEAGO").trim().replace(/\s+/g, " ");
    normalized.telefoneContato = String(args.telefoneContato || "6299999999").replace(/\D/g, ""),
    normalized.numeroConta = String(args.numeroConta || "").replace(/\D/g, "");
  }

  for (const key of Object.keys(args)) {
    if (key === "confirmar" || key === "confirmationToken") continue;
    if (key in normalized) continue;
    normalized[key] = String(args[key] ?? "").trim().replace(/\s+/g, " ");
  }

  const sortedKeys = Object.keys(normalized).sort();
  const sortedObj = {};
  for (const k of sortedKeys) {
    sortedObj[k] = normalized[k];
  }
  return JSON.stringify(sortedObj);
}

function parseParams(toolOrArgs, maybeArgs, maybeEnv, maybeNow) {
  if (typeof toolOrArgs === "string") {
    return {
      tool: toolOrArgs,
      args: maybeArgs || {},
      env: maybeEnv || process.env,
      now: maybeNow !== undefined ? maybeNow : Date.now(),
    };
  }
  return {
    tool: "saneago_abrir_ra",
    args: toolOrArgs || {},
    env: maybeArgs || process.env,
    now: maybeEnv !== undefined ? maybeEnv : Date.now(),
  };
}

function createPending(toolOrArgs, maybeArgs, maybeEnv, maybeNow) {
  const { tool, args, env, now } = parseParams(toolOrArgs, maybeArgs, maybeEnv, maybeNow);
  const dir = stateDir(env);
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });

  const pending = {
    tool: String(tool).trim(),
    token: crypto.randomBytes(24).toString("base64url"),
    args: canonicalArgs(tool, args),
    createdAt: now,
    expiresAt: now + Number(env.SANEAGO_CONFIRMATION_TTL_MS || DEFAULT_TTL_MS),
  };
  fs.writeFileSync(statePath(tool, env), JSON.stringify(pending), { mode: 0o600 });
  return pending.token;
}

function consumeConfirmed(toolOrArgs, maybeArgs, maybeEnv, maybeNow) {
  const { tool, args, env, now } = parseParams(toolOrArgs, maybeArgs, maybeEnv, maybeNow);
  if (String(env.SANEAGO_CONFIRMATION_GRANTED || "") !== "1") {
    throw new Error("A abertura real exige confirmacao explicita do usuario em uma nova mensagem.");
  }

  const file = statePath(tool, env);
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

  if (!tokenMatches || canonicalArgs(tool, args) !== pending.args) {
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
