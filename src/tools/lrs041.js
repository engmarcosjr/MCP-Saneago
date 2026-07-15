const { abrirApp } = require("../portal");
const { preencherCampo, clicarBotao } = require("../executor");
const { inspecionarTela } = require("../inspector");
const { logAudit } = require("../audit");

// Localiza por rótulo os campos da tela de filtro do LRS041 (Cidade, período e botão Consultar).
async function buscarCamposLRS041(frame) {
  return frame.locator('body').evaluate(() => {
    const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim().toUpperCase();
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
}

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
      
      // A consulta popula a tela de forma assíncrona; faz polling até a data aparecer.
      // Extrai direto do DOM: acha o rótulo ("Data/Hora Solicitação", "Cidade") e lê o
      // .value dos inputs no mesmo escopo — a associação rótulo→input do inspector é
      // imprecisa nesta tela (a data cai num input "Sem Rotulo").
      let dados = { data: null, cidade: null };
      for (let tentativa = 0; tentativa < 10 && !dados.data; tentativa++) {
        await frameEco.page().waitForTimeout(1500);
        dados = await frameEco.locator('body').evaluate(() => {
          const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim().toUpperCase();
          const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
          const labels = Array.from(document.querySelectorAll('label, span, div, td'));
          let data = null, cidadeVal = null;
          for (const lb of labels) {
            const txt = norm(lb.textContent).replace(':', '').trim();
            const scope = lb.closest('tr, .z-row, .z-hbox, .z-vbox, div') || document.body;
            const valores = Array.from(scope.querySelectorAll('input')).filter(visible).map(i => i.value || '');
            if (!data && txt.includes('SOLICITA')) {
              const dt = valores.find(v => /\d{2}\/\d{2}\/\d{4}/.test(v));
              if (dt) data = dt.match(/\d{2}\/\d{2}\/\d{4}/)[0];
            }
            if (!cidadeVal && txt === 'CIDADE') {
              const cv = valores.find(v => v.trim());
              if (cv) cidadeVal = cv.trim();
            }
          }
          return { data, cidade: cidadeVal };
        });
      }

      if (dados.data && !dataSolicitacao) {
        dataSolicitacao = dados.data;
        console.error(`[LRS041] Data inferida do ECO701: ${dataSolicitacao}`);
      }
      if (dados.cidade) {
        cidade = dados.cidade;
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
    // A tela carrega de forma assíncrona; faz polling até os campos existirem.
    let ids = { cidadeId: null, dataInicioId: null, dataFimId: null, btnId: null };
    for (let tentativa = 0; tentativa < 15 && !(ids.cidadeId && ids.btnId); tentativa++) {
      await frame.page().waitForTimeout(1500);
      ids = await buscarCamposLRS041(frame);
    }
    if (!ids.cidadeId || !ids.btnId) {
      throw new Error("Campos da tela LRS041 (Cidade/Consultar) não encontrados após aguardar o carregamento.");
    }

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

    // Aguarda o resultado renderizar (grade de lotes ou paginador) — o relatório pode
    // levar bem mais que alguns segundos para ser gerado no servidor.
    for (let tentativa = 0; tentativa < 20; tentativa++) {
      await frame.page().waitForTimeout(1500);
      const temResultado = await frame.locator('body').evaluate((_, ra) => {
        return !!document.querySelector('.z-paging-next') || document.body.innerText.includes(ra);
      }, raOrigem).catch(() => false);
      if (temResultado) break;
    }

    // 3. A consulta retorna a "Listagem dos Lotes" (agregada por lote/situação);
    // as RAs só aparecem na tabela de detalhes, que abre ao clicar na linha do lote.
    const lote = frame.locator('.z-listitem').first();
    if (await lote.isVisible().catch(() => false)) {
      console.error(`[LRS041] Abrindo detalhe do lote...`);
      await lote.click();
      for (let tentativa = 0; tentativa < 10; tentativa++) {
        await frame.page().waitForTimeout(1500);
        const temDetalhe = await frame.locator('body').evaluate((_, ra) => {
          return document.body.innerText.includes('Detalhes do relat') ||
                 document.body.innerText.includes(ra) ||
                 !!document.querySelector('.z-paging-next');
        }, raOrigem).catch(() => false);
        if (temDetalhe) break;
      }
    }

    // 4. Percorrer a tabela de detalhes procurando o RA. A grade ZK renderiza as
    // linhas sob demanda: é preciso ROLAR o contêiner para o DOM receber as linhas
    // restantes (não há botão de próxima página no detalhe). Mantém também suporte a
    // paginador (z-paging) caso alguma variação da tela o use.
    let encontrado = false;
    let passos = 0;
    let textResult = "";

    console.error(`[LRS041] Varrendo tabela de detalhes em busca do RA ${raOrigem}...`);
    while (!encontrado && passos < 60) {
      const pageText = await frame.locator('body').innerText();
      if (pageText.includes(raOrigem)) {
        encontrado = true;
        textResult = pageText;
        console.error(`[LRS041] RA ${raOrigem} encontrado após ${passos} rolagens/páginas!`);
        break;
      }

      const avancou = await frame.locator('body').evaluate(() => {
        // 1º: tenta rolar o contêiner rolável da grade (render on demand)
        const scrollables = Array.from(document.querySelectorAll('.z-grid-body, .z-listbox-body, .z-rows'))
          .map(el => el.closest('.z-grid-body, .z-listbox-body') || el)
          .filter(el => el.scrollHeight > el.clientHeight + 5);
        for (const el of scrollables) {
          if (el.scrollTop + el.clientHeight < el.scrollHeight - 5) {
            el.scrollTop += el.clientHeight;
            return 'scroll';
          }
        }
        // 2º: tenta um botão de próxima página habilitado (z-paging)
        const next = Array.from(document.querySelectorAll('button.z-paging-next, .z-paging-next'))
          .find(b => b.getBoundingClientRect().width > 0 && !b.disabled);
        if (next) { next.click(); return 'page'; }
        return null;
      });

      if (!avancou) break;
      await frame.page().waitForTimeout(1500);
      passos++;
    }

    logAudit("saneago_asfalto_da_ra", appUrl, `RA: ${raOrigem}, Data: ${dataSolicitacao}`, "SUCESSO");
    
    const text = encontrado ? textResult : `RA ${raOrigem} não encontrado no detalhe do LRS041 (após ${passos} rolagens) para a cidade ${cidade} e data ${dataSolicitacao}.`;
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
