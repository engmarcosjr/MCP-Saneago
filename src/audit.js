const fs = require('fs');
const path = require('path');

const AUDIT_DIR = path.join(__dirname, '..', '.auth');
const AUDIT_FILE = path.join(AUDIT_DIR, 'audit.log');

/**
 * Registra uma acao de escrita no log de auditoria.
 * 
 * @param {string} tool Nome da ferramenta (ex: 'saneago_preencher_campo')
 * @param {string} app Nome ou url da aplicacao no momento
 * @param {string} acao Resumo da acao (ex: 'Campo ID x preenchido com y' ou 'Botao ID x clicado')
 * @param {string} resultado Resultado da acao (ex: 'SUCESSO' ou 'ERRO: msg')
 */
function logAudit(tool, app, acao, resultado) {
  try {
    if (!fs.existsSync(AUDIT_DIR)) {
      fs.mkdirSync(AUDIT_DIR, { recursive: true });
    }
    
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] TOOL: ${tool} | APP: ${app} | ACAO: ${acao} | RESULTADO: ${resultado}\n`;
    
    fs.appendFileSync(AUDIT_FILE, logEntry, 'utf8');
  } catch (err) {
    console.error(`[Audit] Erro ao gravar log de auditoria: ${err.message}`);
  }
}

module.exports = { logAudit };
