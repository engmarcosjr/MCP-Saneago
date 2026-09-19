# Diário de Bordo — Mapeamento Lote 134

- **Data:** 2026-09-19
- **Lote:** lote-134
- **Executor:** omniclaude
- **Aplicações do Lote:** BPAV006, BPAV373, GCAV003

---

## O que foi feito

Inspeção e inventário no portal corporativo Saneago via Playwright/ZK para as 3 aplicações prioritárias da fila de pendências do backlog da Fase 1, sem submissão de campos e sem cliques em botões de ação:

1. **BPAV006 (Painel de Empregados em Teletrabalho):**
   - URL real: `null` (inacessível/não carregou frame).
   - Inputs: 0 campos acessíveis.
   - Botões: 0 botões acessíveis.
   - Classe proposta: `bloqueada` (aplicação não localizada na busca direta e timeout ao buscar item correspondente no menu de navegação do portal; completou 3 tentativas reais de inspeção).
   - Artefatos: `docs/mapeamento/evidencias/BPAV006.inspect.json`, `docs/apps/BPAV006.md`, safelist em `docs/SAFELIST_LEITURA.md`.

2. **BPAV373 (Ranking PDV):**
   - URL real: `https://www.saneago.com.br/prt/bpa/BPA373RankingPDV.zul`
   - Inputs: 0 campos interativos detectados na tela inicial.
   - Botões: 4 botões na tela (`Simular valor do PDV`, `OK`, além de botões técnicos ignorados: `Close`, `Sem Rotulo`).
   - Classe proposta: `somente_leitura` (tela de consulta e simulação de ranking/valores de PDV sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/BPAV373.inspect.json`, `docs/apps/BPAV373.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

3. **GCAV003 (Melhorias Previstas):**
   - URL real: `https://www.saneago.com.br/prt/gca/GCA003SolicitacaoMelhoria.zul`
   - Inputs: 9 campos (`Regional`, `Distrito`, `Pendentes`, `Aprovadas`, `Todas`, `Período Solicitação`, `a`, etc.).
   - Botões: 7 botões na tela (`Consultar`, `Nova Solicitação`, `Limpar`, além de 4 botões técnicos `Sem Rotulo` em combos/datepickers).
   - Classe proposta: `possui_escrita` (tela com botão de ação `Nova Solicitação` para criação/inclusão de melhorias previstas).
   - Artefatos: `docs/mapeamento/evidencias/GCAV003.inspect.json`, `docs/apps/GCAV003.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **BPAV006 (`bloqueada`):** Aplicação não localizada na busca e inacessível via menu de navegação no perfil atual. Completou 3 tentativas reais de inspeção no portal e atinge condição de aposentadoria da fila.
- **BPAV373 (`somente_leitura`):** Aplicação abre perfeitamente via menu Planejamento Rec Humanos -> PDV. Apresenta botões de consulta e simulação sem escrita no banco.
- **GCAV003 (`possui_escrita`):** Aplicação abre via menu Controle Atividades -> Cadastro -> Melhorias Previstas. Possui filtros de pesquisa e o botão `Nova Solicitação` que abre fluxo de cadastro/inclusão.

## Pendências para o Gate Humano

- Homologação da classificação para safelist (`BPAV373` para somente-leitura; `GCAV003` para possui escrita; `BPAV006` mantida como bloqueada no perfil atual).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-134
Auditadas 3 apps (lote lote-134) · 2 com entrada em roteiro.json
0 divergências.

$ npm test
# tests 89
# suites 0
# pass 89
# fail 0
# cancelled 0
# skipped 0
# todo 0
```
