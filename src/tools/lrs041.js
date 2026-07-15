const { abrirApp } = require("../portal");
const { preencherCampo, clicarBotao } = require("../executor");
const { inspecionarTela } = require("../inspector");
const { logAudit } = require("../audit");

async function consultarAsfalto(raOrigem, data) {
  let cidade = "2"; // Anápolis fallback
  let dataSolicitacao = data;

  // 1. Consultar ECO701 para obter Cidade e Data do RA (se necessario)
  try {
    console.error(`[LRS041] Consultando RA ${raOrigem} no ECO701 para descobrir data/cidade...`);
    const frameEco = await abrirApp("ECO701");
    
    const idsEco = await frameEco.locator('body').evaluate(() => {
      const norm = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim().toUpperCase();
      const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
      const labels = Array.from(document.querySelectorAll('label, span, div, td'));
      for (const lb of labels) {
        if (!norm(lb.textContent).includes('NUMERO DO RA')) continue;
        const scope = lb.closest('tr, .z-row, .z-hbox, .z-vbox, div') || document.body;
        const inputs = Array.from(scope.querySelectorAll('input')).filter(visible);
        if (inputs.length) return { raInputId: inputs[0].id };
      }
      return { raInputId: null };
    });
    
    if (idsEco.raInputId) {
      await preencherCampo(frameEco, idsEco.raInputId, raOrigem);
      
      const btn = frameEco.getByRole('button', { name: /consultar/i }).first();
      if (await btn.isVisible().catch(() => false)) {
        await btn.click();
      } else {
        await frameEco.locator(`#${idsEco.raInputId}`).press('Enter');
      }
      
      await frameEco.page().waitForTimeout(3000); // Aguarda consulta
      const relatorioEco = await inspecionarTela(frameEco);
      
      const dataInput = relatorioEco.inputs.find(i => i.label && i.label.toUpperCase().includes('DATA DA SOLICITACAO'));
      if (dataInput && dataInput.valor && !dataSolicitacao) {
        dataSolicitacao = dataInput.valor;
        console.error(`[LRS041] Data inferida do ECO701: ${dataSolicitacao}`);
      }
      
      const cidadeInput = relatorioEco.inputs.find(i => i.label && i.label.toUpperCase() === 'CIDADE');
      if (cidadeInput && cidadeInput.valor) {
        cidade = cidadeInput.valor; 
        console.error(`[LRS041] Cidade inferida do ECO701: ${cidade}`);
      }
    }
  } catch (error) {
    console.error("[LRS041] Aviso: Falha ao consultar ECO701 para enriquecer dados", error.message);
  }

  if (!dataSolicitacao) {
    throw new Error("Data não fornecida e não foi possível obter do ECO701.");
  }

  // 2. Preencher LRS041 por rótulo (Cidade e Data)
  console.error(`[LRS041] Abrindo LRS041 para buscar asfalto...`);
  const frame = await abrirApp("LRS041");
  const appUrl = frame.url();
  
  try {
    const ids = await frame.locator('body').evaluate(() => {
      const norm = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim().toUpperCase();
      const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
      const labels = Array.from(document.querySelectorAll('label, span, div, td'));
      let cidadeId = null;
      let dataInicioId = null;
      let dataFimId = null;
      let btnId = null;

      for (const lb of labels) {
        const txt = norm(lb.textContent).replace(':', '').trim();
        if (txt === 'CIDADE') {
          const scope = lb.closest('tr, .z-row, .z-hbox, .z-vbox, div') || document.body;
          const editavel = Array.from(scope.querySelectorAll('input, select')).filter(visible).find(i => !i.disabled && !i.readOnly);
          if (editavel) cidadeId = editavel.id;
        }
        if (txt.includes('PERIODO') || txt.includes('DATA')) {
          const scope = lb.closest('tr, .z-row, .z-hbox, .z-vbox, div') || document.body;
          const dates = Array.from(scope.querySelectorAll('input')).filter(visible).filter(i => !i.disabled && !i.readOnly && i.className.includes('z-datebox'));
          if (dates.length > 0) dataInicioId = dates[0].id;
          if (dates.length > 1) dataFimId = dates[1].id;
        }
      }

      const buttons = Array.from(document.querySelectorAll('button')).filter(visible);
      for (const b of buttons) {
        if (norm(b.textContent).includes('CONSULTAR')) {
          btnId = b.id;
          break;
        }
      }
      
      return { cidadeId, dataInicioId, dataFimId, btnId };
    });

    if (ids.cidadeId) {
      await preencherCampo(frame, ids.cidadeId, cidade);
    }
    if (ids.dataInicioId && dataSolicitacao) {
      await preencherCampo(frame, ids.dataInicioId, dataSolicitacao);
    }
    if (ids.dataFimId && dataSolicitacao) {
      await preencherCampo(frame, ids.dataFimId, dataSolicitacao);
    }
    
    if (ids.btnId) {
      console.error(`[LRS041] Clicando em Consultar...`);
      await frame.locator(`#${ids.btnId}`).click();
    }
    
    await frame.page().waitForResponse(response => response.url().includes('/zkau') && response.status() === 200, { timeout: 10000 }).catch(() => {});
    await frame.page().waitForTimeout(4000); 
    
    // 3. Paginar tabela procurando o RA
    let encontrado = false;
    let paginasPaginadas = 0;
    let textResult = "";

    console.error(`[LRS041] Paginando tabela em busca do RA ${raOrigem}...`);
    while (!encontrado && paginasPaginadas < 30) {
      const pageText = await frame.locator('body').innerText();
      if (pageText.includes(raOrigem)) {
        encontrado = true;
        textResult = pageText;
        console.error(`[LRS041] RA ${raOrigem} encontrado na página ${paginasPaginadas + 1}!`);
        break;
      }
      
      const nextBtnId = await frame.locator('body').evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button.z-paging-next'));
        const activeBtn = btns.find(b => b.getBoundingClientRect().width > 0 && !b.disabled);
        return activeBtn ? activeBtn.id : null;
      });

      if (nextBtnId) {
        await frame.locator(`#${nextBtnId}`).click();
        await frame.page().waitForTimeout(2000);
        paginasPaginadas++;
      } else {
        break;
      }
    }

    logAudit("saneago_asfalto_da_ra", appUrl, `RA: ${raOrigem}, Data: ${dataSolicitacao}`, "SUCESSO");
    
    const text = encontrado ? textResult : `RA ${raOrigem} não encontrado em ${paginasPaginadas + 1} páginas do LRS041 para a cidade ${cidade} e data ${dataSolicitacao}.`;
    const relatorio = await inspecionarTela(frame);
    
    return {
      text,
      relatorio
    };
  } catch (error) {
    logAudit("saneago_asfalto_da_ra", appUrl, `RA: ${raOrigem}, Data: ${dataSolicitacao}`, `ERRO: ${error.message}`);
    throw error;
  }
}

module.exports = { consultarAsfalto };
