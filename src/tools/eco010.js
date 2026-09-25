"use strict";

// ECO010 - efetivar (oficializar) titularidade, por zkau puro via saneago-auth.
// Sem navegador: o fluxo capturado está documentado em saneago-auth/eco010-client.js.

const { Eco010HttpClient, OBSERVACAO_PADRAO_ECO010 } = require("saneago-auth");
const { readCredentials } = require("../session");
const { logAudit } = require("../audit");

const TOOL = "saneago_eco010_efetivar_titularidade";

function clienteEco010() {
  const cred = readCredentials();
  return new Eco010HttpClient({
    ...process.env,
    SANEAGO_USER: cred.usuario,
    SANEAGO_PASS: cred.senha,
  });
}

function montarResumoEco010(r) {
  const d = r.dados || {};
  const linhas = [
    `Conta: ${r.conta}`,
    `Status: ${r.status}`,
  ];
  if (d.nomeCliente || d.cpfCliente) linhas.push(`Cliente: ${d.nomeCliente || "-"} (${d.cpfCliente || "-"})`);
  if (d.nomeProprietario || d.cpfProprietario) linhas.push(`Proprietário: ${d.nomeProprietario || "-"} (${d.cpfProprietario || "-"})`);
  if (d.endereco) linhas.push(`Endereço: ${d.endereco}`);
  if (r.motivo) linhas.push(`Motivo: ${r.motivo}`);
  if (r.observacao) linhas.push(`Observação: ${r.observacao}`);
  if (r.cpfEsperado) linhas.push(`CPF esperado: ${r.cpfEsperado}`);
  if (r.etapa) linhas.push(`Etapa: ${r.etapa}`);
  for (const m of r.mensagens || []) linhas.push(`Portal: ${m}`);
  return linhas.join("\n");
}

/**
 * confirmar=false: executa Solicitar -> Sim -> Motivo 8 -> Observação -> Prosseguir e para
 * com o Incluir habilitado (nada é gravado). confirmar=true: repete e clica Incluir + "Sim".
 */
async function efetivarTitularidade({ conta, dv, cpfEsperado, observacao = OBSERVACAO_PADRAO_ECO010, confirmar }, client = clienteEco010()) {
  await client.login();
  const args = { conta, dv, cpfEsperado, observacao };

  if (!confirmar) {
    const r = await client.preparar(args);
    const pronto = r.status === "PRONTO_PARA_INCLUIR";
    return {
      ok: pronto,
      status: r.status,
      message: `[PREVIEW] ECO010 - oficialização de titularidade${pronto ? " pronta para inclusão" : " não pode prosseguir"}.\n${montarResumoEco010(r)}` +
        (pronto ? "\n\nNada foi gravado. Para efetivar, chame com confirmar: true." : ""),
    };
  }

  const r = await client.efetivar(args);
  logAudit(TOOL, "ECO010", `Oficializar titularidade conta ${r.conta} (motivo 8)`, r.status === "EFETIVADA" ? "SUCESSO" : `ERRO: ${r.status} ${(r.mensagens || []).join(" | ")}`);
  return {
    ok: r.status === "EFETIVADA",
    status: r.status,
    message: `${r.status === "EFETIVADA" ? "[EFETIVADA]" : "[NÃO EFETIVADA]"} ECO010\n${montarResumoEco010(r)}`,
  };
}

module.exports = { TOOL, efetivarTitularidade, montarResumoEco010 };
