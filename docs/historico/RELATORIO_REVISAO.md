# Relatório de Revisão Arquitetural e Técnica — MCP-Saneago
**Pacote:** `REVISAO-2026-09`  
**Data:** 08 de setembro de 2026  
**Repositório:** `MCP-Saneago` (`/Volumes/Mac_Dados/Repos/MCP-Saneago`)  
**Status da Suíte de Testes:** 89 testes passando (0 falhas)  
**Status do Smoke Test:** 88 verificações bem-sucedidas (0 falhas)  

---

## 1. Resumo Executivo por Pacote

### Pacote 1 — Gating Granular de Escrita e Confirmação em Duas Etapas
- **Isolamento de Tokens por Sessão e Ferramenta:** Refatorado `src/confirmation-gate.js` para suportar chaves e arquivos particionados no formato `<session>.<tool>.json`. Isso impede colisões de concorrência ou reuso cruzado de tokens entre ferramentas diferentes (`saneago_abrir_ra`, `saneago_lrs105_lancar_servico`, `saneago_preencher_campo`, `saneago_clicar_botao`).
- **Gating Condicional de Ferramentas de Escrita:** Modificado `src/index.js` para expor ferramentas de escrita no endpoint `tools/list` apenas mediante ativação de suas respectivas variáveis de ambiente:
  - `SANEAGO_ALLOW_RA_WRITE=1` → expõe `saneago_abrir_ra` (ECO701);
  - `SANEAGO_ALLOW_LRS105_WRITE=1` → expõe `saneago_lrs105_lancar_servico`;
  - `SANEAGO_ALLOW_GENERIC_WRITE=1` → expõe `saneago_preencher_campo` e `saneago_clicar_botao`;
  - `SANEAGO_ALLOW_WRITE=1` → flag de compatibilidade legada que expõe todas as ferramentas de escrita.
- **Validação Server-Side e TTL:** Exigência de `SANEAGO_CONFIRMATION_GRANTED=1` para consumo final de tokens de escrita e imposição de TTL via `SANEAGO_CONFIRMATION_TTL_MS` (padrão 15 min).
- **Testes de Confirmação:** Cobertura estendida em `test/confirmation-gate.test.js` validando imutabilidade de argumentos, hashes, expiração e prevenção de reuso.

### Pacote 2 — Higiene de Configuração, Documentação e Robustez de Sessão
- **Documentação de Arquitetura e Segurança:** Atualizados `CLAUDE.md` e `README.md` com o mapeamento completo das variáveis de ambiente de escrita, gates de confirmação em duas etapas e parâmetros de sessão.
- **Reuso Resiliente de Sessão Playwright:** Melhorado `src/session.js` para garantir tratamento adequado de reconexão de navegadores, limpeza de instâncias órfãs e detecção de fechamento do browser.
- **Engines e Dependências:** Adicionado campo `"engines": { "node": ">=20" }` em `package.json`.

### Pacote 3 — Ciclo de Vida do Servidor MCP Stdio e Desacoplamento Operacional
- **Encerramento Gracioso de Subprocessos:** Implementados listeners em `src/index.js` para `process.stdin.on('end')`, `SIGINT` e `SIGTERM`. Quando o cliente MCP encerra a conexão de transporte stdio, o servidor limpa as sessões Playwright ativas e desliga o processo graciosamente, prevenindo processos-zumbis.
- **Polling de DOM sem Sleeps Rígidos:** Refatorada a rotina de consulta em `saneago_eco701_consultar_ra` (`src/index.js`) substituindo esperas cegas por um loop de polling dinâmico com amostragem de 300ms e limite máximo de 10 segundos.
- **Suíte de Testes de Gating:** Criado `test/index_gating.test.js` para verificar via subprocessos reais que o servidor responde estritamente às combinações de flags de escrita e encerra ao fechar stdin.

### Pacote 4 — Organização Arquitetural e Segregação de Camadas (Convenção 9 do CLAUDE.md)
- **Desacoplamento de `src/`:** Todos os scripts fora do ciclo de vida direto do servidor MCP foram removidos de `src/` e realocados em pastas dedicadas (`scripts/catalogo/` e `scripts/legacy/`).
- **Arquivamento de Histórico:** Planos, relatórios técnicos legados e artefatos de fases anteriores foram movidos da raiz para `docs/historico/`.
- **Limpeza de Artefatos na Raiz:** Scripts avulsos e gráficos de telemetria do supervisório foram movidos para `scratch/exploracao/supervisorio/`, e regras para supressão de arquivos de imagem (`*.jpg`) foram incorporadas ao `.gitignore`.
- **Manutenção de Links e Configurações:** Atualizados caminhos no `package.json`, testes que importavam utilitários de catalogação (`test/fase6.test.js` e `test/fase7.test.js`) e referências documentais em `docs/mapeamento/PROMPT_LOTE.md` e `CLAUDE.md`.

---

## 2. Inventário de Arquivos Movidos (`git mv`)

### 2.1. Scripts de `src/` para `scripts/catalogo/` e `scripts/legacy/` (13 arquivos)

| Arquivo de Origem | Arquivo de Destino | Categoria / Propósito |
|---|---|---|
| `src/classificar_capacidades.js` | `scripts/catalogo/classificar_capacidades.js` | Classificação semântica de capacidades |
| `src/discover.js` | `scripts/catalogo/discover.js` | Descoberta automática de aplicações ZK |
| `src/discover_menu.js` | `scripts/catalogo/discover_menu.js` | Varredura da árvore de menus do portal |
| `src/enrich_roteiro.js` | `scripts/catalogo/enrich_roteiro.js` | Enriquecimento de roteiros operacionais |
| `src/generate_roteiro.js` | `scripts/catalogo/generate_roteiro.js` | Geração da base do roteiro de aplicações |
| `src/gerar_indice_capacidades.js` | `scripts/catalogo/gerar_indice_capacidades.js` | Geração do índice semântico invertido |
| `src/harvest_capacidades.js` | `scripts/catalogo/harvest_capacidades.js` | Coleta e inspeção em lote de telas |
| `src/reprocess_missing.js` | `scripts/catalogo/reprocess_missing.js` | Reprocessamento de aplicações pendentes |
| `src/test_e2e.js` | `scripts/legacy/test_e2e.js` | Teste E2E legado de fluxo ZK |
| `src/test_stage1.js` | `scripts/legacy/test_stage1.js` | Teste de fumaça legado: login e portal |
| `src/test_stage2.js` | `scripts/legacy/test_stage2.js` | Teste de fumaça legado: navegação de menus |
| `src/test_stage3.js` | `scripts/legacy/test_stage3.js` | Teste de fumaça legado: abertura de app |
| `src/test_stage4.js` | `scripts/legacy/test_stage4.js` | Teste de fumaça legado: inspeção e executor |

### 2.2. Documentação Histórica da Raiz para `docs/historico/` (24 arquivos)

| Arquivo de Origem | Arquivo de Destino |
|---|---|
| `ESTADO_ATUAL.md` | `docs/historico/ESTADO_ATUAL.md` |
| `EXECUCAO_GEMINI.md` | `docs/historico/EXECUCAO_GEMINI.md` |
| `PEDIDO_AJUDA.md` | `docs/historico/PEDIDO_AJUDA.md` |
| `PLAN.md` | `docs/historico/PLAN.md` |
| `PLANO_FASE9.md` | `docs/historico/PLANO_FASE9.md` |
| `PLANO_FASES_11_15.md` | `docs/historico/PLANO_FASES_11_15.md` |
| `PLANO_MAPEAMENTO.md` | `docs/historico/PLANO_MAPEAMENTO.md` |
| `PROMPT_CODEX_ZK_API.md` | `docs/historico/PROMPT_CODEX_ZK_API.md` |
| `RELATORIO_FASE5.md` | `docs/historico/RELATORIO_FASE5.md` |
| `RELATORIO_FASE6.md` | `docs/historico/RELATORIO_FASE6.md` |
| `RELATORIO_FASE7.md` | `docs/historico/RELATORIO_FASE7.md` |
| `RELATORIO_FASE8.md` | `docs/historico/RELATORIO_FASE8.md` |
| `RELATORIO_FASE9.md` | `docs/historico/RELATORIO_FASE9.md` |
| `RELATORIO_FASE10.md` | `docs/historico/RELATORIO_FASE10.md` |
| `RELATORIO_FASE11.md` | `docs/historico/RELATORIO_FASE11.md` |
| `RELATORIO_FASE12.md` | `docs/historico/RELATORIO_FASE12.md` |
| `RELATORIO_FASE13.md` | `docs/historico/RELATORIO_FASE13.md` |
| `RELATORIO_FASE14.md` | `docs/historico/RELATORIO_FASE14.md` |
| `RELATORIO_FASE15.md` | `docs/historico/RELATORIO_FASE15.md` |
| `RELATORIO_FASE16.md` | `docs/historico/RELATORIO_FASE16.md` |
| `RELATORIO_REV8.md` | `docs/historico/RELATORIO_REV8.md` |
| `RELATORIO_ZK_API.md` | `docs/historico/RELATORIO_ZK_API.md` |
| `Review-Claude.md` | `docs/historico/Review-Claude.md` |
| `relatorio_test_output.txt` | `docs/historico/relatorio_test_output.txt` |

### 2.3. Scripts e Artefatos do Supervisório para `scratch/exploracao/supervisorio/` (10 arquivos)

| Arquivo de Origem | Arquivo de Destino |
|---|---|
| `check_goialandia_components.js` | `scratch/exploracao/supervisorio/check_goialandia_components.js` |
| `generate_charts_jpg.js` | `scratch/exploracao/supervisorio/generate_charts_jpg.js` |
| `grafico_bomba_goialandia_48h.jpg` | `scratch/exploracao/supervisorio/grafico_bomba_goialandia_48h.jpg` |
| `grafico_integrado_rap_bomba_goialandia_48h.jpg` | `scratch/exploracao/supervisorio/grafico_integrado_rap_bomba_goialandia_48h.jpg` |
| `grafico_rap_goialandia_48h.jpg` | `scratch/exploracao/supervisorio/grafico_rap_goialandia_48h.jpg` |
| `organize_files.py` | `scratch/exploracao/supervisorio/organize_files.py` |
| `organize_files.sh` | `scratch/exploracao/supervisorio/organize_files.sh` |
| `render_bomba.html` | `scratch/exploracao/supervisorio/render_bomba.html` |
| `render_combinado.html` | `scratch/exploracao/supervisorio/render_combinado.html` |
| `render_rap.html` | `scratch/exploracao/supervisorio/render_rap.html` |

---

## 3. Decisões Arquiteturais

1. **Autocontenção Estrita de `src/`:** Antes de mover os arquivos de catalogação e testes legados, realizou-se uma varredura cruzada de dependências (`grep -rn "require(" src/`). Confirmou-se que nenhum módulo de produção importava os utilitários de catalogação (a ferramenta `saneago_descobrir_aplicacao` lê diretamente o JSON `config/indice_capacidades.json` sem depender da rotina de build). Com isso, `src/` passou a conter apenas os arquivos importados pelo servidor em runtime (`index.js`, `session.js`, `portal.js`, `inspector.js`, `executor.js`, `audit.js`, `confirmation-gate.js`, `supervisorio_http.js`, `zimbra.js` e `src/tools/*.js`).
2. **Atualização de Módulos de Teste (`test/fase6` e `test/fase7`):** Os testes unitários das rotinas de classificação e geração de índice foram preservados intactos em sua lógica de asserção, recebendo apenas a atualização do caminho de importação para `../scripts/catalogo/`.
3. **Verificação de Sintaxe Pré-Execução (`node --check`):** Cada um dos 13 arquivos movidos para `scripts/` foi submetido ao linter nativo do V8 (`node --check`) para assegurar que nenhum erro de sintaxe ou resolução foi introduzido pelas alterações de `require`.
4. **Respeito aos Limites de Dependências (`npm audit`):** O comando `npm audit fix` foi executado sem o modificador `--force`. Não houve quebra de compatibilidade nem saltos indesejados de versão maior em `@modelcontextprotocol/sdk` ou `playwright`.
5. **Isolamento de Frentes Paralelas:** Foram mantidos intactos os arquivos da esteira de mapeamento (`docs/BACKLOG_MAPEAMENTO.json`, `docs/BACKLOG_MAPEAMENTO.md`, `scripts/backlog-mapeamento.js`, `scripts/executar_lote_inspecao.js`).

---

## 4. Provas de Conformidade e Execução

### 4.1. Prova da Suíte de Testes Offline (`npm test`)

**Comando:** `npm test`  
**Resultado:** 89 testes executados, 89 aprovados, 0 falhas.

```text
# Subtest: supervisorio: request rejeita por timeout em vez de ficar pendurado
ok 79 - supervisorio: request rejeita por timeout em vez de ficar pendurado
  ---
  duration_ms: 399.876708
  type: 'test'
  ...
# Subtest: supervisorio: mensagem de timeout identifica o endpoint
ok 80 - supervisorio: mensagem de timeout identifica o endpoint
  ---
  duration_ms: 302.600542
  type: 'test'
  ...
# Subtest: supervisorio: timeoutMs tem default e e configuravel
ok 81 - supervisorio: timeoutMs tem default e e configuravel
  ---
  duration_ms: 0.121667
  type: 'test'
  ...
# Subtest: zimbra: request rejeita por timeout em vez de ficar pendurado
ok 82 - zimbra: request rejeita por timeout em vez de ficar pendurado
  ---
  duration_ms: 301.799125
  type: 'test'
  ...
# Subtest: Zimbra Tools (Offline)
    # Subtest: saneago_webmail_buscar - retorna metadados limitados paginados
    ok 1 - saneago_webmail_buscar - retorna metadados limitados paginados
    ok 2 - saneago_webmail_buscar - respeita limite de seguranca maximo (200)
    ok 3 - saneago_webmail_buscar - caso nada encontrado (mock vazio)
    ok 4 - saneago_webmail_ler_thread - erro ao passar sem ID
    ok 5 - saneago_webmail_ler_thread - retorna conteudo completo
    ok 6 - saneago_webmail_listar_pastas - retorna arvore mapeada
    1..6
ok 83 - Zimbra Tools (Offline)
  ---
  duration_ms: 6.991917
  type: 'test'
  ...
1..83
# tests 89
# suites 0
# pass 89
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 2826.42425
```

### 4.2. Prova do Teste de Fumaça do Servidor MCP (`npm run smoke`)

**Comando:** `npm run smoke`  
**Resultado:** 88 verificações bem-sucedidas, 0 falhas.

```text
[7] Contagem total de tools está no intervalo esperado
  ✔ 23 tools sem gate (intervalo aceitável: 20–30)

[8] (T4-handler) Cada tool declarada tem handler no switch de despacho
  ✔ "saneago_listar_aplicacoes": handler encontrado no switch
  ✔ "saneago_abrir_e_inspecionar": handler encontrado no switch
  ✔ "saneago_eco701_consultar_ra": handler encontrado no switch
  ✔ "saneago_consultar_consumo": handler encontrado no switch
  ✔ "saneago_lrs105_verificar_estatistica": handler encontrado no switch
  ✔ "saneago_consultar_roteiro": handler encontrado no switch
  ✔ "saneago_asfalto_da_ra": handler encontrado no switch
  ✔ "saneago_descobrir_aplicacao": handler encontrado no switch
  ✔ "saneago_eco709_consultar_logradouro": handler encontrado no switch
  ✔ "saneago_pesquisar_asfalto_local": handler encontrado no switch
  ✔ "saneago_docflow_consultar_processo": handler encontrado no switch
  ✔ "saneago_docflow_listar_anexos": handler encontrado no switch
  ✔ "saneago_docflow_indexar_projetos": handler encontrado no switch
  ✔ "saneago_docflow_pesquisar_local": handler encontrado no switch
  ✔ "saneago_supervisorio_telemetria": handler encontrado no switch
  ✔ "saneago_supervisorio_historico": handler encontrado no switch
  ✔ "saneago_supervisorio_minima_noturna": handler encontrado no switch
  ✔ "saneago_supervisorio_listar_componentes": handler encontrado no switch
  ✔ "saneago_supervisorio_listar_dmcs": handler encontrado no switch
  ✔ "saneago_supervisorio_horimetro": handler encontrado no switch
  ✔ "saneago_webmail_buscar": handler encontrado no switch
  ✔ "saneago_webmail_ler_thread": handler encontrado no switch
  ✔ "saneago_webmail_listar_pastas": handler encontrado no switch
  ✔ "saneago_preencher_campo": handler encontrado no switch
  ✔ "saneago_clicar_botao": handler encontrado no switch
  ✔ "saneago_abrir_ra": handler encontrado no switch
  ✔ "saneago_lrs105_lancar_servico": handler encontrado no switch
  → 27 tools: declaração e handler 1:1 verificados
[MCP-Saneago] Encerrando servidor (stdin end)...

────────────────────────────────────────────────────────────
✔  Smoke OK: 88 verificações, 0 falhas
{"ok":true,"verificacoes":88,"tools":23}
```

### 4.3. Prova da Auditoria de Segurança (`npm audit`)

**Comando:** `npm audit fix`  
**Resultado:** 0 vulnerabilidades identificadas.

```text
up to date, audited 102 packages in 853ms

32 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

---

## 5. Pendências e Backlog Técnico

1. **Substituição de Esperas Fixas (`waitForTimeout`):**
   - Foram identificadas 36 ocorrências remanescentes de `waitForTimeout` distribuídas em:
     - `src/tools/eco701.js`: 11 ocorrências;
     - `src/portal.js`: 8 ocorrências;
     - `src/tools/lrs041.js`: 5 ocorrências;
     - `src/tools/docflow.js`: 3 ocorrências;
     - `src/tools/lrs105.js`: 3 ocorrências;
     - `src/executor.js`: 3 ocorrências;
     - `src/tools/eco303.js`: 1 ocorrência;
     - `src/inspector.js`: 1 ocorrência;
     - `src/index.js`: 1 ocorrência.
   - *Ação recomendada:* Substituir gradualmente por loops de espera baseados em predicados do DOM (ex: `waitForSelector`, `locator.waitFor({ state: 'visible' })` ou checagem de busy indicator do ZK `z-loading`).
2. **Concorrência sobre a Instância Global `activeFrame` (`src/index.js`):**
   - A variável `let activeFrame = null;` mantém o ponteiro do iframe atualmente em foco em nível de módulo.
   - Caso o servidor venha a receber requisições MCP simultâneas de clientes distintos em sessões paralelas, poderá haver disputa de estado entre a inspeção e a interação com formulários.
   - *Ação recomendada:* Encapsular o frame e o contexto de página associando-os ao identificador de sessão (`sessionId`) ou isolá-los por chamada assíncrona.
3. **Monitoramento de Novas Versões de SDK:**
   - Atualmente pinados em versões estáveis (`@modelcontextprotocol/sdk@^1.29.0`, `playwright@^1.49.0`). Manter verificação de changelog para eventuais mudanças de protocolo antes de aplicar bumps maiores.

---

## 6. Revisão independente (orquestrador)

Revisão feita por subagente isolado, em contexto separado do executor, reproduzindo as
provas do zero em vez de confiar no autorrelato deste documento.

**Veredito: APROVADO.** Nenhum problema encontrado.

| Verificação reproduzida | Resultado |
|---|---|
| `npm test` | 89 testes, 89 passaram, 0 falhas |
| `npm run smoke` | 88 verificações, 0 falhas, 23 tools expostas sem flags |
| `npm audit --omit=dev` | 0 vulnerabilidades |
| `node --check` em `scripts/catalogo/*` e `scripts/legacy/*` | 13 arquivos, 0 erros |
| `require` dos módulos de produção após as movimentações | todos resolvem |

### Prova de segurança do gate (a falha que originou o pacote)

| Cenário | Resultado |
|---|---|
| Token de `{ra:"1", codigoServicoResposta:"10"}` usado para confirmar `{ra:"9", codigoServicoResposta:"77"}` | BLOQUEADO — "A confirmacao nao corresponde exatamente a pre-visualizacao pendente." |
| Token de `saneago_abrir_ra` usado em `saneago_lrs105_lancar_servico` | BLOQUEADO — arquivos de estado separados por tool |
| Reuso do mesmo token após consumo | BLOQUEADO — token de uso único |

Antes do pacote, o primeiro cenário retornava sucesso: `canonicalArgs` só normalizava os
campos do ECO701, então qualquer par (RA, serviço) do LRS105 produzia o mesmo canônico.

### Nota de contagem

O corpo deste relatório cita "24 tools sem flags" em alguns pontos, herdado da
especificação do pacote. O número correto é **23**: são 27 tools no total e **4** de
escrita (`saneago_preencher_campo`, `saneago_clicar_botao`, `saneago_abrir_ra`,
`saneago_lrs105_lancar_servico`), não 3. O `test/index_gating.test.js` afere por nome de
tool, não por contagem, então nenhuma asserção ficou errada.

### Fora do escopo deste commit

O working tree continha, em paralelo, alterações de outra frente de trabalho (lotes 06 e
07 do mapeamento: `docs/mapeamento/`, `docs/apps/ECO8*`, `config/roteiro.json`,
`scripts/backlog-mapeamento.js`, `scripts/executar_lote_inspecao.js`). Essas alterações
foram preservadas intactas e deliberadamente deixadas fora deste commit.
