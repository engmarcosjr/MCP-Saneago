# Progresso - MCP-Saneago

## Estado Atual
- **Etapa 1 (Sessão):** Concluída. Reuso de cookie/sessão implementado via Playwright em `src/session.js`.
- **Etapa 2 (Abertura de App):** Concluída. A função `abrirApp` em `src/portal.js` abre corretamente as aplicações (lidando com os novos iframes e listboxes de busca).
- **Etapa 3 (Inspetor de Tela):** Concluída. O script `src/inspector.js` consegue ler o DOM do ZK, extrair `inputs`, `buttons`, e `comboboxes`, inferindo os `labels` e `editavel`.
- **Etapa 4 (Executor por UI):** Concluída. As funções `preencherCampo` e `clicarBotao` em `src/executor.js` interagem com os elementos e esperam o tempo de resposta do ZK e requisições AJAX.
- **Etapa 5 (Catálogo):** Concluída. Arquivo `config/catalogo_aplicacoes.json` criado com o de/para dos apps.
- **Etapa 6 (Ferramentas MCP):** Concluída. Servidor MCP implementado em `src/index.js` utilizando `@modelcontextprotocol/sdk` conectando as funcoes implementadas aos *handlers* do MCP com protocolo Stdio.
  - Adicionado `SANEAGO_ALLOW_WRITE` para proteger operacoes de escrita e auditoria em `.auth/audit.log`.
  - Criada tool vertical `saneago_eco701_consultar_ra` validada E2E.

## Validacao E2E da Tool Vertical
Comando exato executado:
\`\`\`bash
node src/test_e2e.js 1812692026
\`\`\`

Saida resumida dos campos retornados:
\`\`\`json
{
  "inputs": [
    { "id": "s5fMq", "label": "Número da Conta/DV", "valor_atual": "", "editavel": false },
    { "id": "s5fMy5", "label": "CPFCNPJ", "valor_atual": "", "editavel": true },
    { "id": "s5fM46", "label": "CEP", "valor_atual": "", "editavel": true },
    { "id": "s5fMd8", "label": "Número", "valor_atual": "s/n", "editavel": true },
    { "id": "s5fM7e", "label": "Nome", "valor_atual": "LUIS CLAUDIO", "editavel": true },
    { "id": "s5fMne", "label": "Telefone", "valor_atual": "(62)", "editavel": true },
    { "id": "s5fMoe", "label": "Telefone", "valor_atual": "991775739", "editavel": true },
    { "id": "s5fM0f", "label": "Observação", "valor_atual": "CANCELADO POR: M158208 - 20 de janeiro de 2026 às 13:50\\n pelo RA: 437122026Prog.: 6 Serviço : 4153 Tipo Serviço: 1\\n Rua: 1 - PAVIMENTADADimensão (l x c): 1.00 x 1.00 = 1.0000 m²\\n\\nnull", "editavel": false }
  ]
}
\`\`\`
*(Alguns campos em branco/sem rotulo omitidos por brevidade)*

## Desvios de UI (Rede Social Corporativa)
Em comparacao ao \`co701_discover.js\` (antigo), o portal atual ("Rede Social Corporativa") exige os seguintes desvios:
1. **Busca:** O aplicativo nao esta em menus ou arvore tradicional; a busca requer interagir com um input genérico (placeholder "Buscar...") e digitar sequencialmente (\`pressSequentially\`).
2. **Lista e Click:** O ZK responde com um \`z-listbox\`. O clique na linha (\`z-listitem\`) apenas seleciona, sendo necessario encontrar o \`<button>\` interno com icone para disparar a acao real (\`locator('button').first().click()\`).
3. **Iframes Aninhados:** A aplicacao pode carregar primeiro dentro de um frame \`montarMenu.zul\`, que engloba um frame filho \`.zul\` final (ex: \`ECO701RegistroAtendimento.zul\`). A extracao localiza iterativamente nos \`frames()\` do playwright ignorando os conhecidos de portal. Validamos que a captura do frame filho e real e interativa.

## Próximo Passo
- O projeto `MCP-Saneago` está estruturalmente pronto para testes integrados ao Claude/Gemini. As validacoes E2E comprovaram a robustez do executor via UI.
