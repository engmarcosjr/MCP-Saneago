# Progresso - MCP-Saneago

## Estado Atual
- **Etapa 1 (Sessão):** Concluída. Reuso de cookie/sessão implementado via Playwright em `src/session.js`.
- **Etapa 2 (Abertura de App):** Concluída. A função `abrirApp` em `src/portal.js` abre corretamente as aplicações (lidando com os novos iframes e listboxes de busca).
- **Etapa 3 (Inspetor de Tela):** Concluída. O script `src/inspector.js` consegue ler o DOM do ZK, extrair `inputs`, `buttons`, e `comboboxes`, inferindo os `labels` e `editavel`.
- **Etapa 4 (Executor por UI):** Concluída. As funções `preencherCampo` e `clicarBotao` em `src/executor.js` interagem com os elementos e esperam o tempo de resposta do ZK e requisições AJAX.
- **Etapa 5 (Catálogo):** Concluída. Arquivo `config/catalogo_aplicacoes.json` criado com o de/para dos apps.
- **Etapa 6 (Ferramentas MCP):** Concluída. Servidor MCP implementado em `src/index.js` utilizando `@modelcontextprotocol/sdk` conectando as funcoes implementadas aos *handlers* do MCP com protocolo Stdio.

## Próximo Passo
- O projeto `MCP-Saneago` está estruturalmente pronto para testes end-to-end integrados ao Claude/Gemini (usando o app desktop Claude ou um cliente MCP de desenvolvimento). Pode-se configurar o `claude_desktop_config.json` para testar as ferramentas.
