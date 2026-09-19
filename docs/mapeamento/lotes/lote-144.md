# Diário de Bordo — Mapeamento Lote 144

- **Data:** 2026-09-19
- **Lote:** lote-144
- **Executor:** omniclaude
- **Aplicações do Lote:** BAPV005, BAPV025, BAPV032

---

## O que foi feito

Inspeção e inventário no portal corporativo Saneago via Playwright/ZK para as 3 aplicações prioritárias da fila do backlog da Fase 1, sem submissão de campos e sem cliques em botões de ação:

1. **BAPV005 (Emissão de Frequência):**
   - URL real: `https://www.saneago.com.br/prt/bap/BAP005EmitirFrequencia.zul`
   - Inputs: 5 campos identificados (`Referência` readonly date, `Impressora` text editável, `Impressora` readonly text, `Folha de Frequência` radio editável, `Relatório de acompanhamento` radio editável).
   - Botões: 1 botão de ação (`Imprimir`) e 2 botões técnicos ignorados (`Sem Rotulo` de busca de impressora e submit ZK).
   - Colunas: `Código`, `Unidade Organizacional`, `Sigla`.
   - Classe proposta: `somente_leitura` (emissão e impressão de folha de frequência e relatório de acompanhamento por UO e referência sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/BAPV005.inspect.json`, `docs/apps/BAPV005.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

2. **BAPV025 (Agendamento/Alteração de Férias):**
   - URL real: `https://www.saneago.com.br/prt/bap/BAP025SolicitaFerias.zul`
   - Inputs: 22 campos identificados (`Empregado` text editável, `Empregado` readonly text, `Período Aquisitivo` combobox readonly, `Período Aquisitivo` date readonly, `A` date readonly, `Data de Admissão` date readonly, `Período Concessivo` date readonly, `A` date readonly, `Qtd. dias de direito` text readonly, `Qtd. dias falta` text readonly, `Qtd. dias Lic. Médica` text readonly, `Qtd. dias Lic. Remunerada` text readonly, `Qtd. meses Lic. Não Remunerada` text readonly, `Inconsistência` textarea readonly, `Dt. Últ. Atualização` date readonly, `Dt. Últ. Atualização` checkbox readonly, `Saldo de Férias` text readonly, `Saldo de Férias` checkbox readonly, `Parcela única` date readonly, `A` date readonly, `Quantidade de dias` text readonly, `Observações` textarea readonly).
   - Botões: Nenhum botão de ação nomeado na tela inicial e 5 botões ignorados (`Sem Rotulo` de busca de empregado, combobox e datas, além de botão técnico sem rótulo).
   - Colunas: Nenhuma grade de resultados na tela inicial.
   - Classe proposta: `possui_escrita` (aplicação de agendamento e solicitação de alteração de férias de empregados, formulário com campos de fruição e parcelamento de férias).
   - Artefatos: `docs/mapeamento/evidencias/BAPV025.inspect.json`, `docs/apps/BAPV025.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

3. **BAPV032 (Definir Adiantamento de 13° Salário):**
   - URL real: `https://www.saneago.com.br/prt/bap/BAP032AdiantamentoDecimoTerceiro.zul`
   - Inputs: 3 campos identificados (`Empregado` readonly matrícula [REDIGIDO], `Empregado` readonly nome [REDIGIDO], `Referência` date editável).
   - Botões: 2 botões de ação (`Incluir`, `Cancelar`) e 1 botão técnico ignorado (`Sem Rotulo` de calendário ZK).
   - Colunas: Nenhuma grade de resultados.
   - Classe proposta: `possui_escrita` (cadastro e definição de solicitação de adiantamento de 13º salário com botão de escrita `Incluir`).
   - Artefatos: `docs/mapeamento/evidencias/BAPV032.inspect.json`, `docs/apps/BAPV032.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **BAPV005 (`somente_leitura`):** Aplicação de emissão/impressão de folha e relatório de frequência de empregados por UO, apontando para `BAP005EmitirFrequencia.zul` sem escrita de estado.
- **BAPV025 (`possui_escrita`):** Aplicação cadastral de solicitação/alteração de férias apontando para `BAP025SolicitaFerias.zul`. Embora não mostre botão de salvar antes de escolher empregado, sua finalidade é gravação e alteração de agendamento de férias.
- **BAPV032 (`possui_escrita`):** Aplicação de solicitação de adiantamento de 13º salário apontando para `BAP032AdiantamentoDecimoTerceiro.zul` com botão explícito de escrita `Incluir`. PII redigida nas evidências.

## Pendências para o Gate Humano

- Homologação da classificação para safelist (`BAPV005` como somente-leitura; `BAPV025` e `BAPV032` como possui_escrita).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-144
Auditadas 3 apps (lote lote-144) · 3 com entrada em roteiro.json
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
