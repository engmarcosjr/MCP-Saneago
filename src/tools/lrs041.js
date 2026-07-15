const { abrirApp } = require("../portal");
const { preencherCampo, clicarBotao } = require("../executor");
const { inspecionarTela } = require("../inspector");
const { logAudit } = require("../audit");

async function consultarAsfalto(raRua, data) {
  const frame = await abrirApp("LRS041");
  const appUrl = frame.url();
  
  try {
    const ids = await frame.locator('body').evaluate(() => {
      const norm = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim().toUpperCase();
      const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
      const labels = Array.from(document.querySelectorAll('label, span, div, td'));
      let inputRaId = null;
      let inputData1Id = null;
      let inputData2Id = null;
      let btnId = null;

      // Inputs de texto sao RA, etc. Tem 3 text e 2 dates.
      const textInputs = Array.from(document.querySelectorAll('input')).filter(visible).filter(i => !i.disabled && !i.readOnly && !i.className.includes('z-datebox'));
      // A primeira caixa editavel e provavelmente o numero do RA
      if (textInputs.length > 0) {
        inputRaId = textInputs[0].id;
      }
      
      const dateInputs = Array.from(document.querySelectorAll('.z-datebox-input')).filter(visible).filter(i => !i.disabled && !i.readOnly);
      if (dateInputs.length > 0) {
        inputData1Id = dateInputs[0].id;
      }
      if (dateInputs.length > 1) {
        inputData2Id = dateInputs[1].id;
      }

      const buttons = Array.from(document.querySelectorAll('button')).filter(visible);
      for (const b of buttons) {
        if (norm(b.textContent).includes('CONSULTAR')) {
          btnId = b.id;
          break;
        }
      }
      
      return { inputRaId, inputData1Id, inputData2Id, btnId };
    });

    // Preenche
    if (ids.inputRaId && raRua) {
      await preencherCampo(frame, ids.inputRaId, raRua);
    }
    if (ids.inputData1Id && data) {
      await preencherCampo(frame, ids.inputData1Id, data);
    }
    if (ids.inputData2Id && data) {
      await preencherCampo(frame, ids.inputData2Id, data);
    }
    
    if (ids.btnId) {
      const btn = frame.locator(`#${ids.btnId}`);
      await btn.click();
    } else {
      if (ids.inputRaId) await frame.locator(`#${ids.inputRaId}`).press('Enter');
    }
    
    await frame.page().waitForResponse(response => response.url().includes('/zkau') && response.status() === 200, { timeout: 10000 }).catch(() => {});
    await frame.page().waitForTimeout(3000); 

    logAudit("saneago_asfalto_da_ra", appUrl, `RA/Rua: ${raRua}, Data: ${data}`, "SUCESSO");
    
    const text = await frame.locator('body').innerText();
    const relatorio = await inspecionarTela(frame);
    
    return {
      text,
      relatorio
    };
  } catch (error) {
    logAudit("saneago_asfalto_da_ra", appUrl, `RA/Rua: ${raRua}, Data: ${data}`, `ERRO: ${error.message}`);
    throw error;
  }
}

module.exports = { consultarAsfalto };
