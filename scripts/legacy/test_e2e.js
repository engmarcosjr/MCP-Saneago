const { abrirApp } = require("./portal");
const { preencherCampo, clicarBotao } = require("./executor");
const { inspecionarTela } = require("./inspector");
const { closeSession } = require("./session");

const RA = process.argv[2] || "1812692026";

async function main() {
  console.error("=== INICIANDO VALIDACAO E2E ECO701 ===");
  try {
    const activeFrame = await abrirApp("ECO701");
    
    // localiza o campo "Numero do RA" usando a heuristica padrao
    const ids = await activeFrame.locator('body').evaluate(() => {
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
    
    if (!ids.raInputId) throw new Error('Campo Numero do RA nao encontrado na tela inicial');
    
    console.error(`Campo RA encontrado: ${ids.raInputId}. Preenchendo com ${RA}...`);
    await preencherCampo(activeFrame, ids.raInputId, RA);
    
    const btn = activeFrame.getByRole('button', { name: /consultar/i }).first();
    if (await btn.isVisible().catch(() => false)) {
      console.error(`Botao Consultar encontrado. Clicando...`);
      await btn.click();
    } else {
      console.error(`Botao Consultar nao encontrado. Pressionando Enter...`);
      await activeFrame.locator(`#${ids.raInputId}`).press('Enter');
    }
    
    await activeFrame.page().waitForTimeout(3000); // Aguarda consulta carregar
    
    // Retorna os dados da tela
    const text = await activeFrame.locator('body').innerText();
    const relatorioPos = await inspecionarTela(activeFrame);
    
    console.log(`RA ${RA} consultado.\nTexto visivel na tela:\n${text}\n\nCampos da tela:\n${JSON.stringify(relatorioPos, null, 2)}`);
    console.error("=== E2E PASSOU COM SUCESSO ===");
  } catch (error) {
    console.error("ERRO E2E:", error);
    process.exitCode = 1;
  } finally {
    await closeSession();
  }
}

main();
