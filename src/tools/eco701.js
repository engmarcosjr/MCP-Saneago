const { abrirApp } = require("../portal");
const {
  preencherCampo,
  setarCampoZk,
  confirmarCampoZk,
  clicarZk,
  selecionarComboZk,
} = require("../executor");
const { inspecionarTela, aguardarInputPorRotulo } = require("../inspector");
const { logAudit } = require("../audit");

// Contato padrão para RA interna: quem "solicitou" é a própria Saneago, então
// o contato honesto é a empresa. O bot deve PERGUNTAR se há contato real do
// cliente; estes valores só entram quando não há.
const CONTATO_PADRAO_NOME = "SANEAGO";
const CONTATO_PADRAO_TELEFONE = "6299999999";

async function abrirRA(
  endereco,
  servico,
  confirmar,
  formaAtendimento = "3 - INTERNO",
  nomeCliente,
  nomeContato = CONTATO_PADRAO_NOME,
  telefoneContato = CONTATO_PADRAO_TELEFONE
) {
  // O portal recusa a RA sem o nome do cliente/interessado ("É necessário
  // informar o(a) nome do cliente/interessado") — falha antes de abrir sessão.
  if (!nomeCliente || !nomeCliente.trim()) {
    throw new Error("É necessário informar o nome do cliente/interessado (quem solicitou o atendimento).");
  }

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
    // O frame aparece antes do ZK terminar de renderizar a tela — uma busca
    // única falha de forma intermitente. Polling até o botão existir.
    let btnIncluirId = null;
    for (let i = 0; i < 20; i++) {
      btnIncluirId = await frame.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button.z-button'))
          .find(b => b.innerText.trim().toUpperCase() === 'INCLUIR');
        return btn ? btn.id : null;
      });
      if (btnIncluirId) break;
      await frame.page().waitForTimeout(500);
    }

    if (!btnIncluirId) {
      throw new Error("Botão 'Incluir' não encontrado na tela inicial do ECO701 (após 10s de espera)");
    }

    console.error(`[AbrirRA] Clicando no botão Incluir (${btnIncluirId})...`);
    await clicarZk(frame, btnIncluirId);
    await frame.page().waitForTimeout(4000);

    // 2. Localizar os campos do formulário
    let relatorio = await inspecionarTela(frame);

    // Achar campo CEP
    const cepInput = relatorio.inputs.find(i => i.label === "CEP");
    if (!cepInput) {
      throw new Error("Campo 'CEP' não encontrado no formulário de inclusão");
    }

    console.error(`[AbrirRA] Preenchendo CEP (${cepInput.id}) com ${cep}...`);
    await setarCampoZk(frame, cepInput.id, cep);
    await confirmarCampoZk(frame, cepInput.id);
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
      let nomeClienteInputId = null;
      let nomeContatoInputId = null;
      let nomeContatoMax = null;
      let telContatoDddId = null;
      let telContatoNumId = null;
      let btnGerarId = null;

      for (const lb of labels) {
        const txt = norm(lb.textContent).replace(':', '').trim();
        if (txt === 'NOME') {
          // Duas linhas têm rótulo "Nome": a do cliente/interessado (que traz
          // também CPF/CNPJ e os radios F/J de tipo de pessoa) e a do contato
          // (que traz "Hora Contato"). Ambos são obrigatórios no portal.
          const scope = lb.closest('tr, .z-row, .z-hbox, .z-vbox, div') || document.body;
          const escopoTxt = norm(scope.textContent);
          const inputs = Array.from(scope.querySelectorAll('input')).filter(visible);
          const editavel = inputs.find(i =>
            !i.disabled && !i.readOnly && i.type !== 'radio' && i.className.includes('z-textbox')
          );
          if (!editavel) continue;
          if (escopoTxt.includes('CPF') && !nomeClienteInputId) {
            nomeClienteInputId = editavel.id;
          } else if (escopoTxt.includes('HORA CONTATO') && !nomeContatoInputId) {
            nomeContatoInputId = editavel.id;
            nomeContatoMax = editavel.maxLength > 0 ? editavel.maxLength : null;
            // Telefone do contato: DDD (maxlength 4) + número (maxlength 9),
            // na linha "Telefone:" logo abaixo da do nome do contato.
            const linhaTel = scope.parentElement
              ? Array.from(scope.parentElement.querySelectorAll('tr'))
                  .find(tr => norm(tr.textContent).startsWith('TELEFONE'))
              : null;
            if (linhaTel) {
              const tels = Array.from(linhaTel.querySelectorAll('input'))
                .filter(visible)
                .filter(i => !i.disabled && !i.readOnly);
              if (tels[0]) telContatoDddId = tels[0].id;
              if (tels[1]) telContatoNumId = tels[1].id;
            }
          }
        }
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

      return {
        servicoInputId, numeroInputId, obsInputId, nomeClienteInputId,
        nomeContatoInputId, nomeContatoMax, telContatoDddId, telContatoNumId,
        btnGerarId
      };
    });

    if (!ids.servicoInputId) throw new Error("Campo 'Código Serviço' não encontrado");
    if (!ids.numeroInputId) throw new Error("Campo 'Número' não encontrado");
    if (!ids.obsInputId) throw new Error("Campo 'Observação' não encontrado");
    if (!ids.nomeClienteInputId) throw new Error("Campo 'Nome' do cliente/interessado não encontrado");

    console.error(`[AbrirRA] Preenchendo Nome do cliente (${ids.nomeClienteInputId}) com "${nomeCliente}"...`);
    await setarCampoZk(frame, ids.nomeClienteInputId, nomeCliente.trim());
    await frame.page().waitForTimeout(1000);

    // Nome do contato — o portal também exige ("É necessário informar o(a) nome
    // do contato"). O campo aceita menos caracteres que o do cliente; cortar
    // aqui, senão o preencherCampo aborta por divergência.
    if (!ids.nomeContatoInputId) throw new Error("Campo 'Nome' do contato não encontrado");
    const contatoLimite = ids.nomeContatoMax || 30;
    const contatoFinal = nomeContato.trim().slice(0, contatoLimite);
    console.error(`[AbrirRA] Preenchendo Nome do contato (${ids.nomeContatoInputId}) com "${contatoFinal}"...`);
    await setarCampoZk(frame, ids.nomeContatoInputId, contatoFinal);
    await frame.page().waitForTimeout(1000);

    // Telefone do contato (DDD + número, campos separados)
    const digitos = (telefoneContato || "").replace(/\D/g, '');
    if (digitos && ids.telContatoDddId && ids.telContatoNumId) {
      const ddd = digitos.slice(0, 2);
      const numeroTel = digitos.slice(2);
      console.error(`[AbrirRA] Preenchendo Telefone do contato (${ddd}) ${numeroTel}...`);
      await setarCampoZk(frame, ids.telContatoDddId, ddd);
      await setarCampoZk(frame, ids.telContatoNumId, numeroTel);
      await frame.page().waitForTimeout(1000);
    } else {
      console.error(`[AbrirRA] Telefone do contato não preenchido (ids: ddd=${ids.telContatoDddId}, num=${ids.telContatoNumId}).`);
    }

    console.error(`[AbrirRA] Preenchendo Código Serviço (${ids.servicoInputId}) com ${servico}...`);
    await setarCampoZk(frame, ids.servicoInputId, servico);
    await frame.page().waitForTimeout(2000);

    console.error(`[AbrirRA] Preenchendo Número (${ids.numeroInputId}) com ${numero}...`);
    await setarCampoZk(frame, ids.numeroInputId, numero);
    await frame.page().waitForTimeout(1000);

    console.error(`[AbrirRA] Preenchendo Observação (${ids.obsInputId})...`);
    const obsText = `Abertura autônoma via MCP-Saneago. Endereço: ${endereco}. Serviço solicitado: ${servico}.`;
    await setarCampoZk(frame, ids.obsInputId, obsText);
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
      console.error(`[AbrirRA] Selecionando Forma de Atendimento (${comboId}) = ${formaAtendimento}...`);
      const norm = (s) => (s || '').replace(/\s+/g, ' ').trim().toUpperCase();

      const comboInfo = await frame.evaluate((id) => {
        const input = document.getElementById(id);
        const combo = input.closest('.z-combobox');
        const btn = combo ? combo.querySelector('.z-combobox-button') : null;
        return {
          readonly: input.readOnly,
          popupId: input.getAttribute('aria-controls'),
          btnId: btn ? btn.id : null,
        };
      }, comboId);

      if (!comboInfo.readonly) {
        // Combo editável: digitar dispara o onChange do ZK no blur
        await preencherCampo(frame, comboId, formaAtendimento);
        await frame.locator(`[id="${comboId}"]`).press("Tab");
      } else {
        // Combo select-only (input readonly): fluxo capturado em rede real:
        // onOpen -> onChange -> onSelect, com UUID do item resolvido no popup.
        await selecionarComboZk(frame, comboId, formaAtendimento);
      }

      // Aguarda o roundtrip do ZK refletir o valor no input (polling)
      let valorFinal = "";
      for (let i = 0; i < 10; i++) {
        valorFinal = await frame.evaluate((id) => document.getElementById(id).value, comboId);
        if (norm(valorFinal) === norm(formaAtendimento)) break;
        await frame.page().waitForTimeout(500);
      }
      if (norm(valorFinal) !== norm(formaAtendimento)) {
        throw new Error(`Não foi possível selecionar a Forma de Atendimento "${formaAtendimento}". Valor no campo ficou: "${valorFinal}"`);
      }
    } else {
      console.error(`[AbrirRA] Combobox 'Forma de Atendimento' não encontrado.`);
    }

    // Coleta o resumo dos campos preenchidos
    const resumo = await frame.evaluate(() => {
      const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };

      // Rotulo = .z-label visivel mais proximo ANTES do input em ordem de
      // documento. Andar por previousElementSibling/parentElement pulava para
      // celulas erradas da tabela ZK e rotulava "F"/"J" (tipo de pessoa) como
      // "Nome"/"CPF". O ":" vem como .z-label separado — ignorar so-pontuacao.
      const todos = Array.from(document.querySelectorAll('*'));
      const ordem = new Map(todos.map((el, i) => [el, i]));
      const util = (t) => t.replace(/[\s:*]/g, '').length > 0;
      const labels = todos
        .filter(el => el.classList && el.classList.contains('z-label') && visible(el))
        .filter(el => util((el.innerText || "").trim()));

      const getLabelOfInput = (input) => {
        const pos = ordem.get(input);
        let melhor = null;
        for (const l of labels) {
          const lp = ordem.get(l);
          if (lp < pos && (!melhor || lp > ordem.get(melhor))) melhor = l;
        }
        return melhor ? (melhor.innerText || "").trim().replace(/:$/, '') : "Sem Rotulo";
      };

      return Array.from(document.querySelectorAll('input, textarea'))
        .filter(visible)
        .map(i => ({ label: getLabelOfInput(i), valor: i.value }))
        .filter(item => item.valor && item.valor.trim() !== "");
    });

    if (!comboId) {
      resumo.push({ label: "Forma de Atendimento", valor: "NÃO ENCONTRADA NA TELA" });
    }

    const isWriteAllowed =
      process.env.SANEAGO_ALLOW_WRITE === '1' ||
      process.env.SANEAGO_ALLOW_WRITE === 'true' ||
      process.env.SANEAGO_ALLOW_RA_WRITE === '1' ||
      process.env.SANEAGO_ALLOW_RA_WRITE === 'true';

    // Linhas de validacao ja presentes ANTES do submit. A tela pode exibir
    // "É necessário informar ..." por conta do preenchimento parcial; sem essa
    // linha de base, o polling pos-submit as leria como erro do submit.
    const validacaoPreSubmit = await frame.evaluate(() => {
      return document.body.innerText
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.includes("É necessário informar"));
    });

    if (!confirmar) {
      logAudit("saneago_abrir_ra", appUrl, `Endereco: ${endereco}, Servico: ${servico} (PRE-SUBMIT)`, "PREVIEW");
      return {
        success: false,
        message: `[PREVIEW] Solicitação de abertura de RA no ECO701 preparada para submissão.\nResumo do preenchimento:\n${JSON.stringify(resumo, null, 2)}\n\nValidacoes ja presentes na tela (pre-submit): ${validacaoPreSubmit.length ? JSON.stringify(validacaoPreSubmit, null, 2) : "nenhuma"}\n\nPara efetivar a abertura real, chame com confirmar: true.`,
        resumo,
        validacaoPreSubmit
      };
    }

    if (!isWriteAllowed) {
      throw new Error("Ações de escrita reais estão bloqueadas pelo ambiente (SANEAGO_ALLOW_WRITE).");
    }

    if (!comboId) {
      throw new Error("Não é possível gerar RA: o campo obrigatório 'Forma de Atendimento' não foi encontrado na tela.");
    }

    if (!ids.btnGerarId) {
      throw new Error("Botão 'Gerar RA' não encontrado no formulário");
    }

    console.error(`[AbrirRA] Clicando no botão 'Gerar RA' (${ids.btnGerarId})...`);
    await clicarZk(frame, ids.btnGerarId);
    
    // Polling do resultado
    let numeroRA = null;
    let errorMsg = null;
    let dialogoAberto = null;
    for (let i = 0; i < 30; i++) {
      await frame.page().waitForTimeout(1000);

      // Dialogo modal do ZK (confirmacao ou aviso) que o polling antigo nao
      // enxergava: se ficar aberto sem resposta, o submit fica pendurado e o
      // resultado sai INDETERMINADO sem explicacao. Capturar texto e botoes.
      dialogoAberto = await frame.evaluate(() => {
        const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
        const caixas = Array.from(document.querySelectorAll('.z-messagebox-window, .z-window-modal, .z-window-highlighted'))
          .filter(visible);
        if (!caixas.length) return null;
        return caixas.map(c => ({
          texto: c.innerText.trim().slice(0, 500),
          botoes: Array.from(c.querySelectorAll('button')).filter(visible).map(b => b.innerText.trim()),
        }));
      });

      const raId = await aguardarInputPorRotulo(frame, 'NUMERO DO RA', { tentativas: 1, intervalo: 0 });
      if (raId) {
        const val = await frame.evaluate((id) => document.getElementById(id).value, raId);
        if (val && val.trim()) {
          numeroRA = val.trim();
          break; // Sucesso
        }
      }

      // Um dialogo modal com mensagem (ex.: "REGRA 7 — servico so para clientes
      // com numero de conta") e um desfecho DETERMINADO de falha, nao um
      // indeterminado: o portal recusou a RA por regra de negocio.
      if (dialogoAberto && dialogoAberto.length) {
        errorMsg = dialogoAberto.map(d => d.texto.replace(/\n(OK|Cancelar|Sim|Não|Nao)$/i, '').replace(/\n/g, ' — ').trim()).join(" | ");
        break;
      }

      errorMsg = await frame.evaluate((jaPresentes) => {
        const msgBoxes = Array.from(document.querySelectorAll('.z-errbox, .z-messagebox-error, .z-notification-error'));
        const visibleMsgBoxes = msgBoxes.filter(el => el.getBoundingClientRect().width > 0);
        if (visibleMsgBoxes.length > 0) {
          return visibleMsgBoxes.map(el => el.innerText.trim()).join(" | ");
        }

        // Só linhas que NAO existiam antes do submit contam como erro do submit,
        // e devolvemos o texto real (qual campo o portal reclama).
        const novas = document.body.innerText
          .split('\n')
          .map(l => l.trim())
          .filter(l => l.includes("É necessário informar"))
          .filter(l => !jaPresentes.includes(l));
        return novas.length ? novas.join(" | ") : null;
      }, validacaoPreSubmit);

      if (errorMsg) break;
    }

    if (numeroRA) {
      const popupText = await frame.locator('body').innerText();
      logAudit("saneago_abrir_ra", appUrl, `Endereco: ${endereco}, Servico: ${servico} (SUBMETIDO)`, "SUCESSO");
      return {
        success: true,
        numeroRA,
        message: `RA submetido com sucesso! Retorno do portal:\n${popupText}`,
        resumo
      };
    }

    if (errorMsg) {
      logAudit("saneago_abrir_ra", appUrl, `Endereco: ${endereco}, Servico: ${servico} (ERRO DE VALIDACAO: ${errorMsg})`, "ERRO");
      return {
        success: false,
        message: `Falha na submissão. Mensagem do portal: ${errorMsg}`,
        resumo,
        dialogoAberto
      };
    }

    // INDETERMINADO: salvar evidencias para o post-mortem (a sessao fecha logo
    // depois e o estado da tela se perde).
    const evidencias = {};
    try {
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      const path = require('path');
      const base = path.join(__dirname, '..', '..', 'scratch', `indeterminado_${ts}`);
      await frame.page().screenshot({ path: `${base}.png`, fullPage: true });
      const fs = require('fs');
      fs.writeFileSync(`${base}.txt`, await frame.locator('body').innerText());
      evidencias.screenshot = `${base}.png`;
      evidencias.textoTela = `${base}.txt`;
    } catch (e) {
      evidencias.erro = `Falha ao salvar evidencias: ${e.message}`;
    }

    logAudit("saneago_abrir_ra", appUrl, `Endereco: ${endereco}, Servico: ${servico} (INDETERMINADO)`, "ERRO");
    return {
      success: false,
      message: "Resultado INDETERMINADO: o portal não retornou um número de RA nem uma mensagem de erro em tempo hábil. VERIFIQUE MANUALMENTE no portal se o RA foi aberto antes de tentar novamente.",
      resumo,
      dialogoAberto,
      evidencias
    };

  } catch (error) {
    logAudit("saneago_abrir_ra", appUrl, `Endereco: ${endereco}, Servico: ${servico}`, `ERRO: ${error.message}`);
    throw error;
  }
}

module.exports = { abrirRA };
