# Progresso - MCP-Saneago

## Estado Atual
- **Etapa 1 (Sessão):** Concluída. Reuso de cookie/sessão implementado via Playwright em `src/session.js`.
- **Etapa 2 (Abertura de App):** Concluída. A função `abrirApp` em `src/portal.js` abre corretamente as aplicações (lidando com os novos iframes e listboxes de busca).
- **Etapa 3 (Inspetor de Tela):** Concluída. O script `src/inspector.js` consegue ler o DOM do ZK, extrair `inputs`, `buttons`, e `comboboxes`, inferindo os `labels` corretamente a partir da estrutura DOM.

## Próximo Passo
- Iniciar a **Etapa 4 — Executor por UI viva (`executor.js`)**: criar as funções para interagir com os elementos identificados na etapa 3. `preencherCampo(frame, elementId, valor)` e `clicarBotao(frame, elementId)`. As funções devem enviar eventos ou usar Playwright para preencher e interagir.
