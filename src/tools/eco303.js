const { abrirApp } = require("./portal");
const { preencherCampo, clicarBotao } = require("./executor");
const { inspecionarTela } = require("./inspector");
const { logAudit } = require("./audit");

async function consultarConsumo(conta) {
  const frame = await abrirApp("ECO303");
  const appUrl = frame.url();
  
  try {
    const ids = await frame.locator('body').evaluate(() => {
      const norm = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim().toUpperCase();
      const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
      const labels = Array.from(document.querySelectorAll('label, span, div, td'));
      let inputId = null;
      let btnId = null;
      
      for (const lb of labels) {
        if (norm(lb.textContent) === 'CONTA') {
          const scope = lb.closest('tr, .z-row, .z-hbox, .z-vbox, div') || document.body;
          const inputs = Array.from(scope.querySelectorAll('input[type="text"]')).filter(visible);
          // O input editavel da conta e o que queremos preencher
          const editavel = inputs.find(i => !i.disabled && !i.readOnly);
          if (editavel) {
            inputId = editavel.id;
            break;
          }
        }
      }

      const buttons = Array.from(document.querySelectorAll('button')).filter(visible);
      for (const b of buttons) {
        if (norm(b.textContent).includes('CONSULTAR')) {
          btnId = b.id;
          break;
        }
      }
      
      return { inputId, btnId };
    });

    if (!ids.inputId) throw new Error('Campo "Conta" editavel nao encontrado na tela ECO303');
    
    await preencherCampo(frame, ids.inputId, conta);
    
    if (ids.btnId) {
      const btn = frame.locator(`#${ids.btnId}`);
      await btn.click();
    } else {
      await frame.locator(`#${ids.inputId}`).press('Enter');
    }
    
    // wait for response
    await frame.page().waitForResponse(response => response.url().includes('/zkau') && response.status() === 200, { timeout: 10000 }).catch(() => {});
    await frame.page().waitForTimeout(3000); 

    logAudit("saneago_consultar_consumo", appUrl, `Conta ${conta}`, "SUCESSO");
    
    const text = await frame.locator('body').innerText();
    const relatorio = await inspecionarTela(frame);
    
    return {
      text,
      relatorio
    };
  } catch (error) {
    logAudit("saneago_consultar_consumo", appUrl, `Conta ${conta}`, `ERRO: ${error.message}`);
    throw error;
  }
}

module.exports = { consultarConsumo };
