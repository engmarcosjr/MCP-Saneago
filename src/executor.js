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
  console.log(`[Executor] Preenchendo campo "${elementId}" com "${valor}"...`);
  const locator = frame.locator(`[id="${elementId}"]`);
  
  // Tenta garantir que o campo esta visivel/pronto
  await locator.waitFor({ state: "visible", timeout: 10000 });
  
  await locator.click();
  await locator.fill(""); // Limpa o campo
  
  // Digita sequencialmente e simula interacao real
  await locator.pressSequentially(valor, { delay: 30 });
  
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
  console.log(`[Executor] Clicando no botao "${elementId}"...`);
  const locator = frame.locator(`[id="${elementId}"]`);
  
  await locator.waitFor({ state: "visible", timeout: 10000 });
  await locator.click();
  
  // Aguarda possiveis requisicoes AJAX de resposta do clique
  await frame.page().waitForTimeout(1000);
}

module.exports = { preencherCampo, clicarBotao };
