/**
 * Mapeia os elementos interativos de um frame ZK, gerando um relatorio semantico para a LLM.
 * Busca por Textboxes, Dateboxes, Botoes, Comboboxes e outros componentes ZK.
 * 
 * @param {import('playwright').Frame} frame O frame da aplicacao ja carregado
 * @returns {Promise<Object>} JSON estruturado com os elementos encontrados
 */
async function inspecionarTela(frame) {
  console.log(`[Inspector] Inspecionando frame: ${frame.url()}`);
  
  // Extrai informacoes executando um script no contexto do frame
  const elementos = await frame.evaluate(() => {
    const results = {
      inputs: [],
      buttons: [],
      lists: []
    };
    
    // Funcao auxiliar para tentar encontrar o label de um elemento
    function findLabel(el) {
      // Tenta achar um elemento irmao anterior que seja um label da estrutura ZK (.z-label)
      let prev = el.previousElementSibling;
      while (prev) {
        if (prev.classList && prev.classList.contains('z-label')) {
          return prev.innerText.trim();
        }
        prev = prev.previousElementSibling;
      }
      
      // Tenta subindo alguns niveis e olhando os irmaos da div container
      let parent = el.parentElement;
      for (let i = 0; i < 3 && parent; i++) {
        let parentPrev = parent.previousElementSibling;
        while (parentPrev) {
          const labelEl = parentPrev.querySelector('.z-label') || parentPrev;
          if (labelEl && labelEl.innerText) {
            return labelEl.innerText.trim();
          }
          parentPrev = parentPrev.previousElementSibling;
        }
        parent = parent.parentElement;
      }
      return null;
    }

    // Busca Inputs de texto e data
    const inputs = document.querySelectorAll('input.z-textbox, input.z-datebox-input, input.z-decimalbox, input.z-intbox, textarea.z-textbox');
    inputs.forEach(inp => {
      const isReadonly = inp.hasAttribute('readonly') || inp.disabled;
      if (!isReadonly) {
        results.inputs.push({
          id: inp.id,
          tipo: inp.className.includes('datebox') ? 'date' : 'text',
          label: findLabel(inp) || inp.placeholder || 'Sem Rotulo',
          valor_atual: inp.value
        });
      }
    });

    // Busca Botoes
    const buttons = document.querySelectorAll('button.z-button');
    buttons.forEach(btn => {
      if (!btn.disabled && btn.offsetParent !== null) { // ignora invisiveis
        results.buttons.push({
          id: btn.id,
          label: btn.innerText.trim() || btn.title || 'Sem Rotulo'
        });
      }
    });

    // Busca Comboboxes (selects visuais do ZK)
    const combos = document.querySelectorAll('input.z-combobox-input');
    combos.forEach(combo => {
      if (!combo.disabled && !combo.hasAttribute('readonly')) {
        results.inputs.push({
          id: combo.id,
          tipo: 'combobox',
          label: findLabel(combo) || combo.placeholder || 'Sem Rotulo',
          valor_atual: combo.value
        });
      }
    });

    return results;
  });

  return elementos;
}

module.exports = { inspecionarTela };
