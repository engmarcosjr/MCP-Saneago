"use strict";

function extractDtid(text) {
  return (String(text || "").match(/z_[A-Za-z0-9_-]+/) || [])[0] || "";
}

function uuidByComponentId(text, id) {
  const escapedId = String(id).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp("\\['zul\\.[^']+',\\s*'([^']+)'[^\\n]*id:'" + escapedId + "'");
  return (String(text || "").match(re) || [])[1] || "";
}

/**
  Localiza o uuid de um componente filho ancorado pelo id estavel de uma macro/container pai.
  Exemplo: resolverFilho(text, 'pesquisaCidade', 'txtCodigo')
 */
function resolverFilho(text, idMacro, idFilho) {
  const str = String(text || "");
  const escapedMacro = String(idMacro).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const macroRegex = new RegExp("id:'" + escapedMacro + "'|id:\"" + escapedMacro + "\"");
  const matchMacro = macroRegex.exec(str);
  if (!matchMacro) return "";

  // Limita a subárvore da macro aos próximos 2000 caracteres
  const sliceFromMacro = str.slice(matchMacro.index, matchMacro.index + 2000);

  if (idFilho) {
    const escapedFilho = String(idFilho).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const filhoRegex = new RegExp("\\['zul\\.[^']+',\\s*'([^']+)'[^\\n]*id:'" + escapedFilho + "'");
    const matchFilho = filhoRegex.exec(sliceFromMacro);
    if (matchFilho) {
      return matchFilho[1];
    }

    const filhoRegexAlt = new RegExp("\\{\\$u:'([^']+)'[^}]*id:'" + escapedFilho + "'");
    const matchFilhoAlt = filhoRegexAlt.exec(sliceFromMacro);
    if (matchFilhoAlt) {
      return matchFilhoAlt[1];
    }
  }

  // Fallback: busca o UUID do primeiro Intbox ou Textbox na subárvore da macro
  const firstInputRegex = /\['zul\.inp\.(?:Intbox|Textbox)',\s*'([^']+)'/;
  const matchInput = firstInputRegex.exec(sliceFromMacro);
  if (matchInput) {
    return matchInput[1];
  }

  return "";
}

function uuidByLabel(text, label) {
  const decoded = decodeZkText(text);
  const escaped = String(label).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const labelRe = new RegExp("(?:value|label|_value):'[^']*" + escaped + "[^']*'", "i");
  const match = labelRe.exec(decoded);
  if (!match) return "";
  const before = decoded.slice(0, match.index);
  const uuids = [...before.matchAll(/'([zA-Za-z0-9_-]{8,})',\{/g)];
  return uuids.length ? uuids[uuids.length - 1][1] : "";
}

function initialEchoes(text) {
  return [...String(text || "").matchAll(/echo2','\[\{\$u:\\'([^']+)\\'\},"([^"]+)"\]'/g)]
    .map((match) => ({ uuid: match[1], name: match[2] }));
}

function echoUuid(text, name) {
  const escapedName = String(name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp("echo2\",\\[\\{\\$u:'([^']+)'\\},\"" + escapedName + "\"\\]");
  return (String(text || "").match(re) || [])[1] || "";
}

function decodeZkText(text) {
  return String(text || "")
    .replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\r/g, "\r")
    .replace(/\\n/g, "\n")
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}

function extractDownloadUrl(text) {
  const decoded = decodeZkText(text);

  const download = decoded.match(/"download",\["([^"]+)"/);
  if (download) return download[1];

  const dnload = decoded.match(/((?:https?:\/\/[^\s"'\\]+)?\/[^\s"'\\]*_dnload\/[^\s"'\\]+)/);
  if (dnload) return dnload[1];

  const view = decoded.match(/((?:https?:\/\/[^\s"'\\]+)?\/prt\/zkau\/view\/[^\s"'\\]+)/);
  if (view) return view[1];

  const redirect = decoded.match(/"redirect",\["([^"]+\.(?:pdf|xls|xlsx|csv|zip|doc|docx)[^"]*)"/i);
  if (redirect) return redirect[1];

  return "";
}

function filenameFromUrl(url, fallback) {
  const clean = String(url || "").split(/[?#]/)[0];
  const last = clean.split("/").filter(Boolean).pop() || "";
  if (last && /\.[a-z0-9]{2,5}$/i.test(last)) return decodeURIComponent(last);
  return fallback;
}

function filenameFromContentDisposition(headerValue) {
  const value = String(headerValue || "");
  const star = value.match(/filename\*\s*=\s*[^']*''([^;]+)/i);
  if (star) return decodeURIComponent(star[1].trim().replace(/^"|"$/g, ""));
  const plain = value.match(/filename\s*=\s*"?([^";]+)"?/i);
  if (plain) return plain[1].trim();
  return "";
}

module.exports = {
  extractDtid,
  uuidByComponentId,
  resolverFilho,
  uuidByLabel,
  initialEchoes,
  echoUuid,
  decodeZkText,
  extractDownloadUrl,
  filenameFromUrl,
  filenameFromContentDisposition,
};
