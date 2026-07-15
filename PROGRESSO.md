# Progresso - MCP-Saneago

## Estado Atual
- **Etapa 1 (Sessão):** Concluída. Reuso de cookie/sessão implementado via Playwright em `src/session.js`.
- **Etapa 2 (Abertura de App):** Concluída. A função `abrirApp` em `src/portal.js` abre corretamente as aplicações (lidando com os novos iframes e listboxes de busca).
- **Etapa 3 (Inspetor de Tela):** Concluída. O script `src/inspector.js` consegue ler o DOM do ZK, extrair `inputs`, `buttons`, e `comboboxes`, inferindo os `labels` e `editavel`.
- **Etapa 4 (Executor por UI):** Concluída. As funções `preencherCampo` e `clicarBotao` em `src/executor.js` interagem com os elementos e esperam o tempo de resposta do ZK e requisições AJAX.

## Próximo Passo
- Iniciar a **Etapa 5 — Catálogo de aplicações (`config/catalogo_aplicacoes.json`)**: criar um JSON simples mapeando o nome amigável da aplicação (ex: "Registro de Atendimento") para a string de busca na Intranet (ex: "ECO701").
