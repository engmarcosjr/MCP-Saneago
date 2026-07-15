const { abrirApp } = require("../portal");
const { preencherCampo } = require("../executor");
const { inspecionarTela } = require("../inspector");
const { logAudit } = require("../audit");

async function abrirRA(endereco, servico, confirmar) {
  const frame = await abrirApp("ECO701");
  const appUrl = frame.url();
  
  try {
    // 1. Clicar no botão Incluir
    const btnIncluirId = await frame.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button.z-button'))
        .find(b => b.innerText.trim().toUpperCase() === 'INCLUIR');
      return btn ? btn.id : null;
    });

    if (!btnIncluirId) {
      throw new Error("Botão 'Incluir' não encontrado na tela inicial do ECO701");
    }

    console.error(`[AbrirRA] Clicando no botão Incluir (${btnIncluirId})...`);
    await frame.locator(`#${btnIncluirId}`).click();
    await frame.page().waitForTimeout(4000);

    // 2. Localizar os campos do formulário
    let relatorio = await inspecionarTela(frame);
    
    // Determinar o CEP e Número a partir do endereço
    let cep = "75040050"; // default para Ada Centine
    let numero = "550"; // default para Ada Centine
    
    // Tenta extrair CEP de 8 dígitos do endereço
    const cepMatch = endereco.match(/\d{5}-?\d{3}/);
    if (cepMatch) {
      cep = cepMatch[0].replace("-", "");
    }
    
    // Tenta extrair Número do endereço (e.g. "nº 550" ou "550")
    const numMatch = endereco.match(/(?:nº|num|numero)?\s*(\d+)/i);
    if (numMatch && !cepMatch) {
      numero = numMatch[1];
    } else {
      // Se tiver CEP, o número costuma vir após o CEP ou no fim
      const parts = endereco.split(/,|\s+/);
      const possibleNum = parts.find(p => /^\d+$/.test(p) && p !== cep);
      if (possibleNum) {
        numero = possibleNum;
      }
    }

    // Achar campo CEP
    const cepInput = relatorio.inputs.find(i => i.label === "CEP");
    if (!cepInput) {
      throw new Error("Campo 'CEP' não encontrado no formulário de inclusão");
    }

    console.error(`[AbrirRA] Preenchendo CEP (${cepInput.id}) com ${cep}...`);
    await preencherCampo(frame, cepInput.id, cep);
    await frame.locator(`#${cepInput.id}`).press("Enter");
    await frame.page().waitForTimeout(5000); // Aguarda auto-fill

    // Re-inspeciona após auto-fill do endereço
    relatorio = await inspecionarTela(frame);

    // Identificar Código Serviço, Número e Observação
    const ids = await frame.evaluate(() => {
      const norm = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim().toUpperCase();
      const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
      const labels = Array.from(document.querySelectorAll('label, span, div, td'));
      
      let servicoInputId = null;
      let numeroInputId = null;
      let obsInputId = null;
      let btnGerarId = null;

      for (const lb of labels) {
        const txt = norm(lb.textContent).replace(':', '').trim();
        if (txt === 'CODIGO SERVICO') {
          const scope = lb.closest('tr, .z-row, .z-hbox, .z-vbox, div') || document.body;
          const inputs = Array.from(scope.querySelectorAll('input')).filter(visible);
          const editavel = inputs.find(i => !i.disabled && !i.readOnly && i.className.includes('z-intbox'));
          if (editavel) servicoInputId = editavel.id;
        }
        if (txt === 'NUMERO') {
          const scope = lb.closest('tr, .z-row, .z-hbox, .z-vbox, div') || document.body;
          const inputs = Array.from(scope.querySelectorAll('input')).filter(visible);
          const editavel = inputs.find(i => !i.disabled && !i.readOnly && i.className.includes('z-textbox'));
          if (editavel) numeroInputId = editavel.id;
        }
        if (txt === 'OBSERVACAO') {
          const scope = lb.closest('tr, .z-row, .z-hbox, .z-vbox, div') || document.body;
          const textarea = scope.querySelector('textarea');
          if (textarea) obsInputId = textarea.id;
        }
      }

      const buttons = Array.from(document.querySelectorAll('button.z-button')).filter(visible);
      const btnGerar = buttons.find(b => norm(b.textContent).includes('GERAR RA'));
      if (btnGerar) btnGerarId = btnGerar.id;

      return { servicoInputId, numeroInputId, obsInputId, btnGerarId };
    });

    if (!ids.servicoInputId) throw new Error("Campo 'Código Serviço' não encontrado");
    if (!ids.numeroInputId) throw new Error("Campo 'Número' não encontrado");
    if (!ids.obsInputId) throw new Error("Campo 'Observação' não encontrado");

    console.error(`[AbrirRA] Preenchendo Código Serviço (${ids.servicoInputId}) com ${servico}...`);
    await preencherCampo(frame, ids.servicoInputId, servico);
    await frame.locator(`#${ids.servicoInputId}`).press("Tab");
    await frame.page().waitForTimeout(2000);

    console.error(`[AbrirRA] Preenchendo Número (${ids.numeroInputId}) com ${numero}...`);
    await preencherCampo(frame, ids.numeroInputId, numero);
    await frame.locator(`#${ids.numeroInputId}`).press("Tab");
    await frame.page().waitForTimeout(1000);

    console.error(`[AbrirRA] Preenchendo Observação (${ids.obsInputId})...`);
    const obsText = `Abertura autônoma via MCP-Saneago. Endereço: ${endereco}. Serviço solicitado: ${servico}.`;
    await preencherCampo(frame, ids.obsInputId, obsText);
    await frame.page().waitForTimeout(1000);

    // Coleta o resumo dos campos preenchidos
    const resumo = await frame.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, textarea'));
      const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
      
      const getLabelOfInput = (el) => {
        let prev = el.previousElementSibling;
        while (prev) {
          if (prev.classList && prev.classList.contains('z-label')) return prev.innerText.trim();
          prev = prev.previousElementSibling;
        }
        let parent = el.parentElement;
        for (let i = 0; i < 3 && parent; i++) {
          let parentPrev = parent.previousElementSibling;
          while (parentPrev) {
            const labelEl = parentPrev.querySelector('.z-label') || parentPrev;
            if (labelEl && labelEl.innerText) return labelEl.innerText.trim();
            parentPrev = parentPrev.previousElementSibling;
          }
          parent = parent.parentElement;
        }
        return "Sem Rotulo";
      };

      return inputs.filter(visible).map(i => {
        return {
          label: getLabelOfInput(i),
          valor: i.value
        };
      }).filter(item => item.valor && item.valor.trim() !== "");
    });

    const isWriteAllowed = process.env.SANEAGO_ALLOW_WRITE === '1' || process.env.SANEAGO_ALLOW_WRITE === 'true';

    if (!confirmar) {
      logAudit("saneago_abrir_ra", appUrl, `Endereco: ${endereco}, Servico: ${servico} (PRE-SUBMIT)`, "PREVIEW");
      return {
        success: false,
        message: `[PREVIEW] Solicitação de abertura de RA no ECO701 preparada para submissão.\nResumo do preenchimento:\n${JSON.stringify(resumo, null, 2)}\n\nPara efetivar a abertura real, chame com confirmar: true.`,
        resumo
      };
    }

    if (!isWriteAllowed) {
      throw new Error("Ações de escrita reais estão bloqueadas pelo ambiente (SANEAGO_ALLOW_WRITE).");
    }

    if (!ids.btnGerarId) {
      throw new Error("Botão 'Gerar RA' não encontrado no formulário");
    }

    console.error(`[AbrirRA] Clicando no botão 'Gerar RA' (${ids.btnGerarId})...`);
    await frame.locator(`#${ids.btnGerarId}`).click();
    await frame.page().waitForTimeout(8000); // Aguarda criação do RA

    // Captura o texto do popup de confirmação do ZK
    const popupText = await frame.locator('body').innerText();
    logAudit("saneago_abrir_ra", appUrl, `Endereco: ${endereco}, Servico: ${servico} (SUBMETIDO)`, "SUCESSO");

    return {
      success: true,
      message: `RA submetido com sucesso! Retorno do portal:\n${popupText}`,
      resumo
    };

  } catch (error) {
    logAudit("saneago_abrir_ra", appUrl, `Endereco: ${endereco}, Servico: ${servico}`, `ERRO: ${error.message}`);
    throw error;
  }
}

module.exports = { abrirRA };
