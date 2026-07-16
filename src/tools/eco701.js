const { abrirApp } = require("../portal");
const { preencherCampo } = require("../executor");
const { inspecionarTela } = require("../inspector");
const { logAudit } = require("../audit");

async function abrirRA(endereco, servico, confirmar, formaAtendimento = "3 - INTERNO") {
  // Valida o endereço ANTES de abrir o portal (falha rápida, sem gastar sessão)
  const cepMatch = endereco.match(/\d{5}-?\d{3}/);
  if (!cepMatch) {
    throw new Error("Não foi possível extrair o CEP do endereço informado. Por favor, forneça o CEP (ex: 75040-050).");
  }
  const cep = cepMatch[0].replace("-", "");

  // Número do imóvel: remove o CEP do texto antes de procurar dígitos,
  // senão um endereço com CEP antes do número capturaria parte do CEP.
  const enderecoSemCep = endereco.replace(cepMatch[0], " ");
  const numMatch = enderecoSemCep.match(/(?:nº|num\.?|numero|n\.?)\s*(\d+)/i);
  let numero;
  if (numMatch) {
    numero = numMatch[1];
  } else {
    const parts = enderecoSemCep.split(/,|\s+/);
    const possibleNum = parts.find(p => /^\d+$/.test(p));
    if (possibleNum) {
      numero = possibleNum;
    }
  }

  if (!numero) {
    throw new Error("Não foi possível extrair o número do endereço. Por favor, informe o número do local.");
  }

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

    // Selecionar Forma de Atendimento
    console.error(`[AbrirRA] Localizando e preenchendo Forma de Atendimento...`);
    const comboId = await frame.evaluate(() => {
      const norm = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim().toUpperCase();
      const labels = Array.from(document.querySelectorAll('label, span, div, td'));
      for (const lb of labels) {
        const txt = norm(lb.textContent).replace(':', '').trim();
        if (txt === 'FORMA DE ATENDIMENTO') {
          const scope = lb.closest('tr, .z-row, .z-hbox, .z-vbox, div') || document.body;
          const combo = scope.querySelector('.z-combobox input, input.z-combobox-input');
          if (combo) return combo.id;
        }
      }
      return null;
    });

    if (comboId) {
      // Abre o combobox
      await frame.evaluate((id) => {
        const input = document.getElementById(id);
        const combo = input.closest('.z-combobox');
        const btn = combo.querySelector('.z-combobox-button, a, i');
        if (btn) btn.click(); else input.click();
      }, comboId);
      await frame.page().waitForTimeout(1500);

      // Clica na opção correspondente
      const clicked = await frame.evaluate((formaStr) => {
        const itens = Array.from(document.querySelectorAll('.z-combobox-popup .z-comboitem, .z-comboitem'));
        const item = itens.find(i => i.innerText.trim().toUpperCase() === formaStr.toUpperCase());
        if (item) {
          item.click();
          return true;
        }
        return false;
      }, formaAtendimento);

      if (!clicked) {
        throw new Error(`Não foi possível encontrar a opção "${formaAtendimento}" na lista de Forma de Atendimento.`);
      }
      await frame.page().waitForTimeout(1000);
    } else {
      console.error(`[AbrirRA] Combobox 'Forma de Atendimento' não encontrado.`);
    }

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

    // Verifica mensagens de validação (erro)
    const errorMsg = await frame.evaluate(() => {
      // Procura por caixas de erro/mensagem ativas
      const msgBoxes = Array.from(document.querySelectorAll('.z-messagebox, .z-errbox, .z-notification'));
      const visibleMsgBoxes = msgBoxes.filter(el => el.getBoundingClientRect().width > 0);
      if (visibleMsgBoxes.length > 0) {
        return visibleMsgBoxes.map(el => el.innerText.trim()).join(" | ");
      }
      
      // Procura no texto da página por alertas conhecidos
      const text = document.body.innerText;
      if (text.includes("É necessário informar") || text.includes("Erro")) {
        return "Detectada mensagem de erro ou validação no texto da página.";
      }
      return null;
    });

    if (errorMsg) {
      logAudit("saneago_abrir_ra", appUrl, `Endereco: ${endereco}, Servico: ${servico} (ERRO DE VALIDACAO)`, "ERRO");
      return {
        success: false,
        message: `Falha na submissão. Mensagem do portal: ${errorMsg}`,
        resumo
      };
    }

    // Extrair Número do RA da tela
    const numeroRA = await frame.evaluate(() => {
      const norm = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim().toUpperCase();
      const labels = Array.from(document.querySelectorAll('label, span, div, td'));
      for (const lb of labels) {
        if (!norm(lb.textContent).includes('NUMERO DO RA')) continue;
        const scope = lb.closest('tr, .z-row, .z-hbox, .z-vbox, div') || document.body;
        const inputs = Array.from(scope.querySelectorAll('input')).filter(el => el.getBoundingClientRect().width > 0);
        if (inputs.length && inputs[0].value) return inputs[0].value;
      }
      return null;
    });

    // Captura o texto do popup de confirmação do ZK
    const popupText = await frame.locator('body').innerText();
    logAudit("saneago_abrir_ra", appUrl, `Endereco: ${endereco}, Servico: ${servico} (SUBMETIDO)`, "SUCESSO");

    return {
      success: true,
      numeroRA,
      message: `RA submetido com sucesso! Retorno do portal:\n${popupText}`,
      resumo
    };

  } catch (error) {
    logAudit("saneago_abrir_ra", appUrl, `Endereco: ${endereco}, Servico: ${servico}`, `ERRO: ${error.message}`);
    throw error;
  }
}

module.exports = { abrirRA };
