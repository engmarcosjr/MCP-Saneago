# Diário de Bordo — Mapeamento Lote 159

- **Data:** 2026-09-19
- **Lote:** lote-159
- **Executor:** omniclaude
- **Aplicações do Lote:** KRT037, KRTV037, LENV145

---

## O que foi feito

Inspeção e inventário no portal corporativo Saneago via Playwright/ZK para as 3 aplicações da fila do backlog da Fase 1, sem preenchimento de campos e sem cliques em botões de ação:

1. **KRT037 (Relatórios Gerenciais):**
   - URL real: `https://www.saneago.com.br/prt/krt/KRT037RelatoriosGerenciais.zul`
   - Inputs: 1 campo identificado (`Opção` combobox readonly).
   - Botões: 1 botão técnico na inspeção (`Sem Rotulo`).
   - Classe proposta: `somente_leitura` (emissão e consulta de relatórios gerenciais de AVTO por opção de relatório sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/KRT037.inspect.json`, `docs/apps/KRT037.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

2. **KRTV037 (Relatórios Gerenciais):**
   - URL real: `https://www.saneago.com.br/prt/krt/KRT037RelatoriosGerenciais.zul`
   - Inputs: 1 campo identificado (`Opção` combobox readonly).
   - Botões: 1 botão técnico na inspeção (`Sem Rotulo`).
   - Classe proposta: `somente_leitura` (emissão e consulta de relatórios gerenciais de AVTO por opção de relatório sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/KRTV037.inspect.json`, `docs/apps/KRTV037.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

3. **LENV145 (Interrupção de Energia):**
   - URL real: `https://www.saneago.com.br/prt/len/LEN145CadastroInterrupcaoEnergia.zul`
   - Inputs: 16 campos identificados (`Cidade`, `Conta de Energia`, `Protocolo CELG/CHESP`, `Unidade Operacional`, `Data / Hora Inicial`, `Data / Hora Final`, `Tipo de Impacto`, `Vazão da UO (l/s)`, `Observação`, `Matrícula`, `Data Inclusão`).
   - Botões: 9 botões na inspeção (`Consultar`, `Cancelar` e botões auxiliares `Sem Rotulo`).
   - Classe proposta: `somente_leitura` (consulta de registros e interrupções de energia elétrica por cidade, conta ou protocolo sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/LENV145.inspect.json`, `docs/apps/LENV145.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **KRT037 (`somente_leitura`):** Aplicação ZK de emissão de relatórios gerenciais de AVTO (`KRT037RelatoriosGerenciais.zul`), contendo apenas combobox de seleção de opção sem botões de escrita.
- **KRTV037 (`somente_leitura`):** Aplicação ZK correspondente ao menu Controle de AVTOs -> Relatórios -> Relatórios Gerenciais (`KRT037RelatoriosGerenciais.zul`), apresentando a mesma tela inicial do KRT037 sem botões de escrita.
- **LENV145 (`somente_leitura`):** Aplicação ZK de cadastro e acompanhamento de interrupções de energia elétrica (`LEN145CadastroInterrupcaoEnergia.zul`), com botões iniciais de consulta e cancelamento (`Consultar`, `Cancelar`).

## Pendências para o Gate Humano

- Homologação das classificações propostas na safelist (`KRT037`, `KRTV037` e `LENV145` como `somente_leitura`).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-159
Auditadas 3 apps (lote lote-159) · 3 com entrada em roteiro.json
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
