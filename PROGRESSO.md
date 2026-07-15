# Progresso - MCP-Saneago

## Estado Atual
- **Etapa 1 (Sessão):** Concluída. Reuso de cookie/sessão implementado via Playwright em `src/session.js`.
- **Etapa 2 (Abertura de App):** Concluída. A função `abrirApp` em `src/portal.js` consegue navegar na intranet ("Rede Social Corporativa"), buscar o aplicativo na barra superior pesquisando apenas pelo código da aplicação, clicar no botão "abrir aplicação" correspondente no grid de resultados, lidar com atrasos do ZK, ignorar frames wrapper como `montarMenu.zul` e extrair o Frame final (ex: `ECO701RegistroAtendimento.zul`).

## Próximo Passo
- Iniciar a **Etapa 3 — Inspetor de tela (`inspector.js`)**: criar ferramenta que lê os componentes ZK (`textbox`, `datebox`, `button`, grids, tabelas) do Frame da aplicação recém-aberta e retorna um JSON estruturado com IDs e rótulos para a LLM entender a tela.
