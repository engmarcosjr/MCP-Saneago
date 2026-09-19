# Diário de Bordo — Mapeamento Lote 140

- **Data:** 2026-09-19
- **Lote:** lote-140
- **Executor:** omniclaude
- **Aplicações do Lote:** JAJV028, JAJV033, JAJV042

---

## O que foi feito

Inspeção e inventário no portal corporativo Saneago via Playwright/ZK para as 3 aplicações prioritárias da fila de pendências do backlog da Fase 1, sem submissão de campos e sem cliques em botões de ação:

1. **JAJV028 (Consulta Judicial):**
   - URL real: `https://www.saneago.com.br/prt/jaj/JAJ028ConJudicial.jsp`
   - Inputs: 11 inputs (`Código do Escritório`, `Nº Processo (novo)`, `Nº Processo (novo)`, `Nº Processo (novo)`, `Nº Processo (novo)`, `Nº Processo (novo)`, `Nº Processo (novo)`, `ou`, `Número Conta`, `Número Conta`, `Situação`).
   - Botões: 0 botões na tela inicial.
   - Classe proposta: `somente_leitura` (tela JSP de consulta de processos judiciais por escritório, número ou conta sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/JAJV028.inspect.json`, `docs/apps/JAJV028.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

2. **JAJV033 (Agenda Audiência):**
   - URL real: `https://www.saneago.com.br/prt/jaj/JAJ033agendaAudi.jsp`
   - Inputs: 9 inputs (`Período`, `Período`, `Código do Escritório`, `Comarca`, `Comarca`, `Comarca`, `Comarca`, `Preposto`, `Preposto`).
   - Botões: 0 botões na tela inicial.
   - Classe proposta: `somente_leitura` (tela JSP de consulta de agenda de audiências judiciais por período e comarca sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/JAJV033.inspect.json`, `docs/apps/JAJV033.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

3. **JAJV042 (Consulta Cobrança):**
   - URL real: `https://www.saneago.com.br/prt/jaj/JAJ042conCobranca.zul`
   - Inputs: 3 inputs (`Conta` radio, `CPF/CNPJ` radio, `Conta` text).
   - Botões: 2 botões na tela (`Consultar`, `Cancelar`).
   - Classe proposta: `somente_leitura` (tela de consulta de débitos e cobranças por conta ou CPF/CNPJ com botões Consultar e Cancelar, sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/JAJV042.inspect.json`, `docs/apps/JAJV042.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **JAJV028 (`somente_leitura`):** Aplicação abre via menu Apoio Jurídico -> Judicial -> Consulta Judicial apontando para `JAJ028ConJudicial.jsp`. Permite consulta a processos judiciais contenciosos sem botões de gravação/escrita.
- **JAJV033 (`somente_leitura`):** Aplicação abre via menu Apoio Jurídico -> Judicial -> Agenda Audiência apontando para `JAJ033agendaAudi.jsp`. Destinada à consulta e acompanhamento de agenda de audiências por período.
- **JAJV042 (`somente_leitura`):** Aplicação abre via menu Apoio Jurídico -> Consulta -> Consulta Cobrança apontando para `JAJ042conCobranca.zul`. Trata-se de consulta a débitos em cobrança jurídica com botões Consultar e Cancelar.

## Pendências para o Gate Humano

- Homologação da classificação para safelist (`JAJV028`, `JAJV033` e `JAJV042` para somente-leitura).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-140
Auditadas 3 apps (lote lote-140) · 3 com entrada em roteiro.json
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
