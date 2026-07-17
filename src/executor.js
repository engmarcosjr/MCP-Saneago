/**
 * Funcoes para interagir com os elementos identificados na aplicacao.
 */

/**
 * Preenche um campo e dispara os eventos necessarios para o ZK validar.
 * 
 * @param {import('playwright').Frame} frame Frame da aplicacao
 * @param {string} elementId ID do elemento a ser preenchido
 * @param {string} valor Valor a ser preenchido
 */
async function preencherCampo(frame, elementId, valor) {
  console.error(`[Executor] Preenchendo campo "${elementId}" com "${valor}"...`);
  const locator = frame.locator(`[id="${elementId}"]`);
  
  // Tenta garantir que o campo esta visivel/pronto
  await locator.waitFor({ state: "visible", timeout: 10000 });
  
  await locator.click();
  await locator.fill(""); // Limpa o campo

  // Digita sequencialmente e simula interacao real
  await locator.pressSequentially(valor, { delay: 30 });

  // O ZK mexe na tela em background (ex.: depois do autofill do CEP) e engole
  // teclas no meio da digitacao: o campo fica com um PREFIXO do valor e o ponto
  // de corte muda a cada execucao. Verifica e reescreve atomicamente ate bater.
  //
  // A comparacao ignora caracteres de mascara/placeholder: campos como Telefone
  // reformatam o que foi digitado ("62" -> "(62)", "99999999" -> "99999999_").
  // Isso e legitimo; truncamento nao e. Comparar so o conteudo distingue os dois.
  const limpar = (s) => (s || '').replace(/[\s()\-._/]/g, '');
  const bate = (atual) => limpar(atual) === limpar(valor);

  for (let i = 0; i < 3; i++) {
    const atual = await locator.inputValue();
    if (bate(atual)) break;
    console.error(`[Executor] Campo "${elementId}" ficou "${atual}" (esperado "${valor}") — reescrevendo com fill...`);
    await locator.fill("");
    await locator.fill(valor);
  }

  const final = await locator.inputValue();
  if (!bate(final)) {
    throw new Error(`Nao foi possivel preencher "${elementId}": valor final "${final}", esperado "${valor}". Preenchimento parcial nao pode virar dado gravado.`);
  }

  // Em ZK, o onChange costuma ser disparado no 'blur' ou 'Enter'
  await locator.blur();

  // Aguarda qualquer requisicao AJAX disparada pelo ZK / onChange
  await frame.page().waitForTimeout(500);
}

/**
 * Clica em um botao e aguarda o carregamento / resposta AJAX.
 * 
 * @param {import('playwright').Frame} frame Frame da aplicacao
 * @param {string} elementId ID do elemento a ser clicado
 */
async function clicarBotao(frame, elementId) {
  console.error(`[Executor] Clicando no botao "${elementId}"...`);
  const locator = frame.locator(`[id="${elementId}"]`);
  
  await locator.waitFor({ state: "visible", timeout: 10000 });
  await locator.click();
  
  // Aguarda possiveis requisicoes AJAX de resposta do clique
  await frame.page().waitForTimeout(1000);
}

function erroZk(mensagem) {
  return new Error(`${mensagem}. Use o caminho antigo (preencherCampo/clicarBotao) como fallback.`);
}

async function setarCampoZk(frame, elementId, valor) {
  const resultado = await frame.evaluate(({ id, valor }) => {
    if (typeof zk === "undefined" || !zk.Widget) {
      return { ok: false, classe: null, via: null, motivo: "API cliente zk indisponível" };
    }
    const el = document.getElementById(id);
    if (!el) return { ok: false, classe: null, via: null, motivo: `elemento não existe: ${id}` };
    const wgt = zk.Widget.$(el);
    if (!wgt) return { ok: false, classe: null, via: null, motivo: `widget não resolvido para ${id}` };
    const classe = wgt.className || wgt.widgetName || "?";
    try {
      const inp = (typeof wgt.getInputNode === "function" && wgt.getInputNode()) || el;
      if (typeof wgt.updateChange_ === "function") {
        inp.value = valor;
        wgt.updateChange_();
        return { ok: true, classe, via: "updateChange_", valorDom: inp.value };
      }
      if (typeof wgt.setValue === "function" && typeof wgt.fire === "function") {
        wgt.setValue(valor);
        wgt.fire("onChange", { value: valor, start: -1 }, { toServer: true });
        return { ok: true, classe, via: "setValue+fire", valorDom: inp.value };
      }
      return { ok: false, classe, via: null, motivo: "widget sem updateChange_/setValue" };
    } catch (e) {
      return { ok: false, classe, via: null, motivo: e.message };
    }
  }, { id: elementId, valor });
  if (!resultado.ok) throw erroZk(`Não foi possível definir o campo ZK "${elementId}": ${resultado.motivo}`);

  const verificacao = await frame.evaluate(({ id, esperado }) => {
    const limpar = (s) => (s || "").replace(/[\s()\-._/]/g, "");
    const el = document.getElementById(id);
    const atual = el ? el.value : "";
    return { ok: limpar(atual) === limpar(esperado), classe: null, via: "verificacao-pos-set", valorDom: atual };
  }, { id: elementId, esperado: String(valor) });
  if (!verificacao.ok) {
    throw new Error(`Divergência ao definir campo ZK "${elementId}": valor DOM "${verificacao.valorDom}", esperado "${valor}".`);
  }
  return { ...resultado, verificacao: verificacao.valorDom };
}

async function confirmarCampoZk(frame, elementId) {
  const resultado = await frame.evaluate((id) => {
    if (typeof zk === "undefined" || !zk.Widget) {
      return { ok: false, classe: null, via: null, motivo: "API cliente zk indisponível" };
    }
    const el = document.getElementById(id);
    if (!el) return { ok: false, classe: null, via: null, motivo: `elemento não existe: ${id}` };
    const wgt = zk.Widget.$(el);
    if (!wgt) return { ok: false, classe: null, via: null, motivo: `widget não resolvido para ${id}` };
    const classe = wgt.className || wgt.widgetName || "?";
    try {
      wgt.fire("onBlur", null, { toServer: true });
      let win = wgt;
      while (win && win.className !== "zul.wnd.Window") win = win.parent;
      if (!win) return { ok: false, classe, via: "onBlur", motivo: "Window ancestral não encontrada" };
      win.fire("onOK", { reference: wgt.uuid, keyCode: 13, charCode: 0, key: "Enter", which: 13 }, { toServer: true });
      return { ok: true, classe, via: "onBlur+Window.onOK", janela: win.uuid };
    } catch (e) {
      return { ok: false, classe, via: null, motivo: e.message };
    }
  }, elementId);
  if (!resultado.ok) throw erroZk(`Não foi possível confirmar o campo ZK "${elementId}": ${resultado.motivo}`);
  return resultado;
}

async function clicarZk(frame, elementId) {
  const resultado = await frame.evaluate((id) => {
    if (typeof zk === "undefined" || !zk.Widget) {
      return { ok: false, classe: null, via: null, motivo: "API cliente zk indisponível" };
    }
    const el = document.getElementById(id);
    if (!el) return { ok: false, classe: null, via: null, motivo: `elemento não existe: ${id}` };
    const wgt = zk.Widget.$(el);
    if (!wgt) return { ok: false, classe: null, via: null, motivo: `widget não resolvido para ${id}` };
    const classe = wgt.className || wgt.widgetName || "?";
    try {
      wgt.fire("onClick", { which: 1 }, { toServer: true });
      return { ok: true, classe, via: "onClick" };
    } catch (e) {
      return { ok: false, classe, via: null, motivo: e.message };
    }
  }, elementId);
  if (!resultado.ok) throw erroZk(`Não foi possível clicar no widget ZK "${elementId}": ${resultado.motivo}`);
  return resultado;
}

async function selecionarComboZk(frame, elementId, textoOpcao) {
  const inicio = await frame.evaluate((id) => {
    if (typeof zk === "undefined" || !zk.Widget) {
      return { ok: false, classe: null, via: null, motivo: "API cliente zk indisponível" };
    }
    const el = document.getElementById(id);
    const wgt = el && zk.Widget.$(el);
    if (!el) return { ok: false, classe: null, via: null, motivo: `elemento não existe: ${id}` };
    if (!wgt) return { ok: false, classe: null, via: null, motivo: `widget não resolvido para ${id}` };
    const classe = wgt.className || wgt.widgetName || "?";
    try {
      // Disparar so o onOpen ao servidor NAO renderiza os .z-comboitem: quem
      // cria o popup no DOM e a abertura CLIENTE do widget (na captura real,
      // o clique no botao fazia isso). wgt.open() e o caminho oficial e ele
      // mesmo envia o onOpen ao servidor.
      if (typeof wgt.open === "function") {
        wgt.open({ sendOnOpen: true });
        return { ok: true, classe, via: "wgt.open" };
      }
      wgt.fire("onOpen", { open: true, value: el.value || "" }, { toServer: true });
      return { ok: true, classe, via: "onOpen" };
    } catch (e) {
      return { ok: false, classe, via: null, motivo: e.message };
    }
  }, elementId);
  if (!inicio.ok) throw erroZk(`Não foi possível abrir a combo ZK "${elementId}": ${inicio.motivo}`);

  const alvo = String(textoOpcao).trim().replace(/\s+/g, " ").toUpperCase();
  let selecao = null;
  for (let i = 0; i < 20; i++) {
    selecao = await frame.evaluate(({ id, alvo }) => {
      const input = document.getElementById(id);
      const wgt = input && zk.Widget.$(input);
      const popupId = input && input.getAttribute("aria-controls");
      const popup = popupId && document.getElementById(popupId);
      const norm = (s) => (s || "").replace(/\s+/g, " ").trim().toUpperCase();
      const item = popup && Array.from(popup.querySelectorAll(".z-comboitem"))
        .find((el) => norm(el.textContent) === alvo);
      if (!input || !wgt) return { ok: false, classe: null, via: null, motivo: "combo/widget não resolvido" };
      if (!item) return { ok: false, classe: wgt.className || "?", via: "onOpen", motivo: "opção ainda não renderizada" };
      const itemWgt = zk.Widget.$(item);
      const itemId = itemWgt ? itemWgt.uuid : item.id;
      if (!itemId) return { ok: false, classe: wgt.className || "?", via: "onOpen", motivo: "widget da opção sem uuid" };
      try {
        // No clique real e o CLIENTE que escreve o texto no input (o servidor
        // nao ecoa o valor de volta) — sem o setValue o campo fica vazio.
        const texto = item.textContent.trim();
        if (typeof wgt.setValue === "function") wgt.setValue(texto);
        wgt.fire("onChange", { value: texto, start: 0 }, { toServer: true });
        wgt.fire("onSelect", { items: [itemId], reference: itemId }, { toServer: true });
        if (typeof wgt.close === "function") wgt.close();
        return { ok: true, classe: wgt.className || "?", via: "wgt.open+onChange+onSelect", itemId };
      } catch (e) {
        return { ok: false, classe: wgt.className || "?", via: "onChange", motivo: e.message };
      }
    }, { id: elementId, alvo });
    if (selecao.ok) return selecao;
    await frame.page().waitForTimeout(500);
  }
  throw new Error(`Opção "${textoOpcao}" não encontrada na combo ZK "${elementId}" após 10s. ${selecao && selecao.motivo}`);
}

module.exports = {
  preencherCampo, clicarBotao, setarCampoZk, confirmarCampoZk, clicarZk, selecionarComboZk,
};
