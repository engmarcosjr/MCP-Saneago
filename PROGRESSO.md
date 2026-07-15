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

---
*Status Atual: Avançando para a Fase 3 (Verticais de Leitura).*
