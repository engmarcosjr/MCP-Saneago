# PLANO — FASES 11 a 15 (execução autônoma)

**Data:** 2026-08-21
**Base:** último commit `5240b16` (supervisório HTTP + dashboards)
**Critério de seleção:** só entram tarefas executáveis **sem gate humano** — ou seja, sem
escrita em sistema Saneago (`SANEAGO_ALLOW_*_WRITE` permanece `0`). Tudo abaixo é código,
teste offline, documentação ou leitura read-only.

---

## 0. Diagnóstico do estado atual

| Dimensão | Situação |
|---|---|
| Tools MCP registradas em `src/index.js` | 16 |
| Catálogo de aplicações | 596 apps varridas, índice + 300+ fichas em `docs/apps/` |
| Verticais maduras | ECO701, ECO709, ECO303, LRS041, LRS105 (escrita em preview), DocFlow |
| Suíte de testes | `npm test` → **26/27 verde, 1 vermelho** (`test/test_docflow_mcp_tools.js`) |
| Supervisório Web | Cliente HTTP (`src/supervisorio_http.js`) + mapeamento de API completos, **0 tools MCP expostas** |
| Zimbra / webmail | ~15 scripts exploratórios, **nenhum código em `src/`**, nada versionado |
| Higiene do repo | **110 scripts `.js` soltos na raiz não versionados** + 268 arquivos em `scratch/` |
| Cache de processos | `data_processos_2020..2026/` **vazios** (é o que quebra o teste vermelho) |

**Leitura:** o projeto passou da fase de engenharia reversa (concluída e muito bem
documentada) para uma fase de exploração ad-hoc por script solto. O valor descoberto nos
últimos commits — supervisório, GED/anexos, webmail — **ainda não virou superfície MCP**.
As fases abaixo fecham essa lacuna.

---

## FASE 11 — Higiene e reprodutibilidade (pré-requisito das demais)

**Por quê:** com 110 scripts na raiz não se distingue código de produção de rascunho, e a
suíte não é confiável (1 teste vermelho por dependência de cache inexistente).

- **T1 — Reorganização física:** mover os `test_*.js`, `query_*.js`, `check_*.js`,
  `extract_*.js`, `inspect_*.js`, `scratch_*` da raiz para `scratch/exploracao/<vertical>/`
  (docflow, zimbra, supervisorio, eco). Nada é apagado — apenas reclassificado. Raiz fica
  só com `src/`, `test/`, `docs/`, `config/`, `scripts/` e os `.md`.
- **T2 — `.gitignore`:** acrescentar `data_processos_*/`, `*.html` de captura, `scratch_*`.
- **T3 — Consertar o teste vermelho:** `test/test_docflow_mcp_tools.js` é teste de
  integração (rede + cache local) rodando dentro do `npm test` offline. Separar em
  `npm run test:integration` e criar em seu lugar um teste offline com fixture JSON de
  processo, validando o parser e a origem `cache_local`.
- **T4 — Contratos congelados:** criar `test/fixtures/` com respostas HTML/JSON reais já
  capturadas (existem de sobra em `scratch/`) para os parsers de DocFlow, ECO709 e
  supervisório — a partir daqui todo parser tem teste offline.
- **Saída:** `npm test` 100% verde e offline; raiz limpa; `RELATORIO_FASE11.md`.

---

## FASE 12 — Vertical Supervisório Web como tools MCP

**Por quê:** é o maior valor já mapeado sem superfície de uso. Hoje só existe como cliente
e como dois HTMLs de gráfico gerados à mão.

- **T1 — `src/tools/supervisorio.js`** sobre o `SupervisorioHttpClient` existente:
  - `saneago_supervisorio_telemetria` — leitura em tempo real por unidade/grupo
    (`/dashboard/monitorar-unidade`): nível %, status de bomba, vazão, pressão.
  - `saneago_supervisorio_historico` — série temporal de N componentes num período
    (`/historico/listar`), com agregação (min/máx/média) e amostragem configurável.
  - `saneago_supervisorio_minima_noturna` — mínima noturna por DMC e por GRS.
  - `saneago_supervisorio_horimetro` — horas de bomba por período.
  - `saneago_supervisorio_listar_componentes` — catálogo por unidade (descoberta).
- **T2 — Cache de catálogo:** persistir `config/supervisorio_componentes_<unidade>.json`
  para que a LLM resolva "bomba 2 do RAP Goialândia" → `id_componente` sem round-trip.
- **T3 — Testes offline** com os payloads já salvos (`scratch_goialandia_*.json`).
- **T4 — Registro em `src/index.js`** + ficha em `docs/apps/` e seção no README.
- **Risco:** todas as chamadas são `POST` de leitura; **nenhuma escrita** — fase 100% autônoma.
- **Saída:** 5 tools novas, `RELATORIO_FASE12.md`.

---

## FASE 13 — Vertical DocFlow/GED completa e cache reconstruído

**Por quê:** o pipeline de download de projetos existe como script de lote de uso único
(`docflow_baixar_projetos_*.js`), não como capacidade consultável.

- **T1 — Reconstruir o cache local** `data_processos_YYYY/` com o consultor em massa já
  pronto (`docflow_consulta_massa_anos.js`), read-only, em background, com log de progresso.
- **T2 — `saneago_docflow_listar_anexos`** — dado um processo, retorna a árvore de pastas
  do GED e os metadados dos anexos **sem baixar** (o download continua sendo script
  explícito, por volume).
- **T3 — Unificar os dois scripts de lote** (Anápolis/Goiânia são cópias idênticas exceto
  constantes) em um único módulo parametrizado por município.
- **T4 — `saneago_docflow_indexar_projetos`** — busca na base de projetos já baixada
  (`projetos_organizados_*`) por empreendimento, AVTO, sistema (SAA/SES) ou ART.
- **Saída:** cache populado, 2 tools novas, 1 script duplicado eliminado, `RELATORIO_FASE13.md`.

---

## FASE 14 — Vertical Webmail (Zimbra): decidir e consolidar

**Por quê:** ~15 scripts exploratórios funcionais (SOAP/REST autenticado, classificação de
e-mails, reorganização de pastas) que hoje não pertencem a lugar nenhum.

- **T1 — Consolidar** o que funciona em `src/zimbra.js` (cliente SOAP/JSON autenticado) +
  `src/tools/zimbra.js` com **apenas tools de leitura**: `saneago_webmail_buscar`,
  `saneago_webmail_ler_thread`, `saneago_webmail_listar_pastas`.
- **T2 — Explicitar o gate de escrita:** mover/etiquetar/enviar ficam **fora** desta fase
  (mesma doutrina do `SANEAGO_ALLOW_WRITE`); `move_conversations.js` e `organize_zimbra.js`
  permanecem como scripts supervisionados, nunca como tool automática.
- **T3 — Testes offline** com os dumps já existentes (`scratch_zimbra_rest.json`).
- **Saída:** 3 tools de leitura, `docs/ZIMBRA.md`, `RELATORIO_FASE14.md`.

---

## FASE 15 — Consolidação de conhecimento e regressão

- **T1 — `CLAUDE.md` do repositório:** doutrina de escrita (gates), onde fica cada camada,
  como rodar testes, o que nunca automatizar. Hoje esse conhecimento está espalhado por
  10 relatórios de fase.
- **T2 — Consolidar `PROGRESSO.md`** (50 KB, cronológico) em um `ESTADO_ATUAL.md` curto +
  histórico arquivado.
- **T3 — Reindexar a descoberta** incluindo supervisório, DocFlow e Zimbra no
  `indice_capacidades.json`, com novos casos-verdade em `test/ranking.test.js`
  ("nível do RAP", "processo por número", "e-mail sobre X").
- **T4 — Suíte de fumaça** (`npm run smoke`) cobrindo as ~26 tools registradas com
  validação de schema, sem rede.
- **Saída:** `RELATORIO_FASE15.md`, README atualizado.

---

## Sequenciamento e dependências

```
FASE 11 (higiene + fixtures)  ──┬──> FASE 12 (supervisório)  ──┐
                                ├──> FASE 13 (docflow/GED)  ───┼──> FASE 15 (consolidação)
                                └──> FASE 14 (zimbra)  ────────┘
```

FASE 11 é bloqueante (as demais dependem das fixtures e da suíte verde). 12, 13 e 14 são
independentes entre si e podem ser executadas em qualquer ordem ou em paralelo.

## Fora do escopo autônomo (permanecem com gate humano)

- Submissão real do LRS105 (`saneago_lrs105_lancar_servico --confirmar`) — gate da FASE 10.
- Abertura real de RA no ECO701 — gate da FASE 5, ainda aberto por falta de conta de teste.
- Qualquer escrita no DocFlow, movimentação/envio de e-mail e comando no supervisório.
