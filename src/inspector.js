/**
 * Mapeia os elementos interativos de um frame (ZK, HTML ou Misto), gerando um relatorio semantico.
 * 
 * @param {import('playwright').Frame} frame O frame da aplicacao ja carregado
 * @returns {Promise<Object>} JSON estruturado com a tecnologia e os elementos encontrados
 */
async function inspecionarTela(frame) {
  console.error(`[Inspector] Inspecionando frame: ${frame.url()}`);
  
  const elementos = await frame.evaluate(() => {
    const isVisible = (el) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return (r.width > 0 || r.height > 0 || el.offsetParent !== null);
    };

    const isUsefulText = (t) => (t || '').replace(/[\s:*]/g, '').length > 0;

    // Detecta a tecnologia principal da tela
    const hasZk = document.querySelector('[class*="z-"]') !== null || 
                  document.querySelector('.z-label, .z-textbox, .z-window, .z-button') !== null;
    const hasHtmlForm = document.querySelector('form, select:not([class*="z-"]), input:not([class*="z-"])') !== null;

    let tecnologia = 'html';
    if (hasZk && hasHtmlForm) {
      tecnologia = 'misto';
    } else if (hasZk) {
      tecnologia = 'zk';
    } else {
      tecnologia = 'html';
    }

    // Heuristica de rotulagem unificada
    function findLabel(el) {
      // 1. Label explicito <label for="id">
      if (el.id) {
        try {
          const escapeId = CSS.escape ? CSS.escape(el.id) : el.id.replace(/(:|\.|\[|\]|,|=|@)/g, "\\$1");
          const lbl = document.querySelector(`label[for="${escapeId}"]`);
          if (lbl && lbl.innerText && isUsefulText(lbl.innerText)) {
            return lbl.innerText.trim().replace(/[:*]$/g, '').trim();
          }
        } catch (e) {}
      }

      // 2. Elemento <label> pai
      const parentLbl = el.closest('label');
      if (parentLbl) {
        const clone = parentLbl.cloneNode(true);
        clone.querySelectorAll('input, select, textarea, button').forEach(i => i.remove());
        const txt = (clone.innerText || clone.textContent || '').trim().replace(/[:*]$/g, '').trim();
        if (isUsefulText(txt)) return txt;
      }

      // 3. Ordem de documento: .z-label, label, th, td visivel mais proximo ANTES do elemento
      const allNodes = Array.from(document.querySelectorAll('*'));
      const posMap = new Map(allNodes.map((n, i) => [n, i]));
      const pos = posMap.get(el);

      const labelCandidates = allNodes.filter(n => {
        if (!isVisible(n)) return false;
        const isZLabel = n.classList && n.classList.contains('z-label');
        const isTagLabel = n.tagName === 'LABEL';
        const isTH = n.tagName === 'TH';
        const isTdLabel = n.tagName === 'TD' && !n.querySelector('.z-label') && n.children.length === 0;
        if (isZLabel || isTagLabel || isTH || isTdLabel) {
          return isUsefulText((n.innerText || n.textContent || '').trim());
        }
        return false;
      });

      let best = null;
      for (const cand of labelCandidates) {
        const candPos = posMap.get(cand);
        if (candPos < pos && (!best || candPos > posMap.get(best))) {
          best = cand;
        }
      }

      if (best) {
        const txt = (best.innerText || best.textContent || '').trim().replace(/[:*]$/g, '').trim();
        if (txt) return txt;
      }

      // 4. Fallbacks
      const fallback = el.placeholder || el.getAttribute('aria-label') || el.title || el.name || el.id;
      if (fallback && isUsefulText(String(fallback))) {
        return String(fallback).trim().replace(/[:*]$/g, '').trim();
      }

      return 'Sem Rotulo';
    }

    // Busca Inputs (text, date, select, combobox, textarea, etc.)
    const allInputs = Array.from(document.querySelectorAll('input, select, textarea')).filter(el => {
      if (el.tagName === 'INPUT') {
        const t = (el.type || 'text').toLowerCase();
        if (['hidden', 'submit', 'button', 'reset', 'image'].includes(t)) return false;
      }
      return isVisible(el);
    });

    const inputs = allInputs.map(inp => {
      const isReadonly = inp.hasAttribute('readonly') || inp.disabled;
      const rotulo = findLabel(inp);
      let tipo = 'text';
      let opcoes = null;
      let total_opcoes = 0;
      let opcoes_truncadas = false;

      if (inp.tagName === 'SELECT') {
        tipo = 'select';
        const opts = Array.from(inp.options || []);
        total_opcoes = opts.length;
        opcoes_truncadas = total_opcoes > 50;
        opcoes = opts.slice(0, 50).map(o => ({
          valor: o.value,
          texto: (o.text || '').trim()
        }));
      } else if (inp.tagName === 'TEXTAREA') {
        tipo = 'textarea';
      } else if (inp.classList && inp.classList.contains('z-combobox-input')) {
        tipo = 'combobox';
        // Tenta capturar opcoes de combo ja renderizadas no DOM (sem clicar)
        const comboWrap = inp.closest('.z-combobox');
        const popupId = inp.getAttribute('aria-controls');
        let comboItems = [];
        if (popupId) {
          const popup = document.getElementById(popupId);
          if (popup) comboItems = Array.from(popup.querySelectorAll('.z-comboitem'));
        }
        if (!comboItems.length && comboWrap) {
          comboItems = Array.from(comboWrap.querySelectorAll('.z-comboitem'));
        }
        if (comboItems.length) {
          total_opcoes = comboItems.length;
          opcoes_truncadas = total_opcoes > 50;
          opcoes = comboItems.slice(0, 50).map(ci => ({
            valor: ci.getAttribute('label') || ci.innerText.trim(),
            texto: ci.innerText.trim() || ci.getAttribute('label') || ''
          }));
        }
      } else if (inp.classList && inp.classList.contains('z-datebox-input')) {
        tipo = 'date';
      } else {
        tipo = inp.type || 'text';
      }

      const maxLen = inp.maxLength > 0 && inp.maxLength < 500000 ? inp.maxLength : null;

      const item = {
        id: inp.id || null,
        name: inp.name || null,
        tipo,
        rotulo,
        label: rotulo, // compatibilidade
        valor_atual: inp.value || '',
        editavel: !isReadonly,
        readonly: isReadonly,
        maxlength: maxLen
      };

      if (opcoes) {
        item.opcoes = opcoes;
        item.total_opcoes = total_opcoes;
        item.opcoes_truncadas = opcoes_truncadas;
      }

      return item;
    });

    // Busca Botoes
    const allBtns = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"], input[type="reset"], a.z-button, a[role="button"], a.btn')).filter(b => {
      return isVisible(b) && !b.disabled;
    });

    const botoes = allBtns.map(btn => {
      let label = btn.innerText || btn.textContent || btn.value || btn.title || 'Sem Rotulo';
      label = label.trim();
      return {
        id: btn.id || null,
        name: btn.name || null,
        label: label || 'Sem Rotulo',
        tipo: btn.type || btn.tagName.toLowerCase()
      };
    });

    // Cabecalhos de Grid/Tabela
    const headers = Array.from(document.querySelectorAll('.z-listheader, .z-column, th'));
    const colunasSet = new Set();
    headers.forEach(h => {
      const txt = (h.innerText || h.textContent || '').trim();
      if (txt && txt.length > 0 && txt.length < 100) {
        colunasSet.add(txt);
      }
    });
    const colunas = Array.from(colunasSet);

    // Formularios (HTML)
    const forms = Array.from(document.querySelectorAll('form')).map(f => ({
      id: f.id || null,
      name: f.name || null,
      action: f.getAttribute('action') || null,
      method: (f.method || 'get').toLowerCase()
    }));

    // Titulo da tela
    let titulo_tela = '';
    const titleEl = document.querySelector('.z-window-header, .z-window-embedded-header, .z-caption-label, h1, h2, title');
    if (titleEl) {
      titulo_tela = (titleEl.innerText || titleEl.textContent || '').trim();
    }

    return {
      tecnologia,
      titulo_tela,
      inputs,
      botoes,
      buttons: botoes, // compatibilidade
      colunas,
      forms,
      lists: []
    };
  });

  return elementos;
}

/**
 * Aguarda e localiza um input visivel pelo rotulo usando polling.
 * 
 * @param {import('playwright').Frame} frame O frame da aplicacao
 * @param {string} rotulo O texto do rotulo a ser buscado
 * @param {Object} options Opcoes de polling (tentativas e intervalo)
 * @returns {Promise<string|null>} O ID do input encontrado ou null
 */
async function aguardarInputPorRotulo(frame, rotulo, { tentativas = 20, intervalo = 500 } = {}) {
  const rotuloBusca = rotulo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim().toUpperCase();
  for (let i = 0; i < tentativas; i++) {
    const inputId = await frame.evaluate((textoBusca) => {
      const norm = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim().toUpperCase();
      const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
      const labels = Array.from(document.querySelectorAll('label, span, div, td'));
      for (const lb of labels) {
        if (!norm(lb.textContent).includes(textoBusca)) continue;
        const scope = lb.closest('tr, .z-row, .z-hbox, .z-vbox, div') || document.body;
        const inputs = Array.from(scope.querySelectorAll('input, select, textarea')).filter(visible);
        if (inputs.length) return inputs[0].id;
      }
      return null;
    }, rotuloBusca);
    
    if (inputId) return inputId;
    await frame.page().waitForTimeout(intervalo);
  }
  return null;
}

module.exports = { inspecionarTela, aguardarInputPorRotulo };
