# Progresso - MCP-Saneago

## Estado Anterior (Infraestrutura MCP)
- **Etapas 1-6:** Concluídas. Reuso de sessão viva (`src/session.js`), navegação em iframes ZK e listboxes de busca (`src/portal.js`), inspeção via DOM vivo (`src/inspector.js`), execução de UI com espera de resposta (`src/executor.js`), integração com MCP Stdio SDK (`src/index.js`), flag `SANEAGO_ALLOW_WRITE` para proteção. E2E estrutural de UI comprovado.

## Execução Autônoma Gemini - Correção de Rumo

### FASE 1 — Descoberta de todas as aplicações
Criado o script `src/discover.js` que se autenticou via Playwright e varreu a busca (`Buscar...`) iterando sobre prefixos `ECO`, `SAN`, `MTG`, `PSS` e de `A` a `Z`. A extração analisou cada `.z-listcell` das `.z-listitem` renderizadas.
- Comando: `node src/discover.js`
- Contagem de apps: **54 aplicações mapeadas**
- Amostra: `CAESAN` (A0009), `Contracheque` (BAP002), `Abertura de Financiamento` (ECO411), `Consulta Contrato Saneago x SAP` (FGC068), `Capturar Remessa` (MTG001), `CHEFIA DE GABINETE` (S0087).
- Fonte usada: Busca via interface, parseando o `z-listcell` (`origem: "busca_listcell"`).
- Artefato: `config/catalogo_aplicacoes.json` atualizado.

### FASE 2 — Mapa de intenções
Identificamos os aplicativos alvo no catálogo para as intenções fornecidas, validados através do script de apoio `test_apps.js` (que usou `saneago_abrir_e_inspecionar` para extrair botões e campos visíveis de ECO303, LRS041 e ECO701).

| Intenção (Exemplo) | App/Código | Tela `.zul` | Leitura/Escrita | Campos-chave |
|---|---|---|---|---|
| "abre uma RA na rua tal" | ECO701 (Registro de Atendimento) | ECO701RegistroAtendimento.zul | Escrita | Número da Conta, Botões "Incluir" / "Consultar" |
| "qual o volume consumido pela conta X" | ECO303 (Acerta Leitura/Consumo) | ECO303AcertaLeituraConsumo.zul | Leitura | Conta, Botão "Consultar" |
| "verifique o asfalto lançado da RA da rua tal, dia tal" | LRS041 (Relatório de recomposição asfáltica) | LRS041RelatorioRecomposicaoAsfaltica.zul | Leitura | Inputs de Data (`tipo: date`), Botão "Consultar" |

### FASE 3 — Verticais de LEITURA
Implementado `src/tools/eco303.js` e `src/tools/lrs041.js`. As rotinas acessam os iframes nativos e procuram os labels 'CONTA', campos de 'Data' e botões 'CONSULTAR' organicamente sem hardcode de ID de UI.
**Bloqueio E2E:** Faltam parâmetros reais (ex: Conta ativa para consulta, RA+Data ativo para LRS041) que eu possa injetar nos testes com segurança e sem chutar. Ver `PEDIDO_AJUDA.md`.

### FASE 4 — Verticais de ESCRITA
Implementado `src/tools/eco701.js` e adicionado suporte a `confirmar` via boolean `true/false`.
A tool navega organicamente na UI, e quando `confirmar = false`, apenas recupera os UUIDs ZK vivos (E2E pre-submit).
**Bloqueio E2E:** Para executar o submit de forma completa requer supervisão. Ver `PEDIDO_AJUDA.md`.

## PARA REVISAO CLAUDE
- **Tool `saneago_listar_aplicacoes`:** Atualizada dinamicamente com as 54 aplicacoes. Prova E2E na extração local listada em `config/catalogo_aplicacoes.json`.
- **Tool `saneago_consultar_consumo` (ECO303):** Código estrutural concluído em `src/tools/eco303.js`. Prova E2E dependente de dados pendentes no `PEDIDO_AJUDA.md`.
- **Tool `saneago_asfalto_da_ra` (LRS041):** Código estrutural concluído em `src/tools/lrs041.js`. Prova E2E dependente de dados pendentes no `PEDIDO_AJUDA.md`.
- **Tool `saneago_abrir_ra` (ECO701):** Código estrutural concluído em `src/tools/eco701.js`. Prova E2E travada no pre-submit para validação do usuário.

---
*A execução autônoma do LLM parou seguindo as instruções de VÁLVULA DE SEGURANÇA (faltaram valores reais do usuário para leitura, e exige supervisão para a escrita final).*
