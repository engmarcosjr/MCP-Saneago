# Diário de Bordo — Mapeamento Lote 157

- **Data:** 2026-09-19
- **Lote:** lote-157
- **Executor:** omniclaude
- **Aplicações do Lote:** HVWV031, HVWV050, JAJ042

---

## O que foi feito

Inspeção e inventário no portal corporativo Saneago via Playwright/ZK para as 3 aplicações prioritárias da fila do backlog da Fase 1, sem submissão de campos e sem cliques em botões de ação:

1. **HVWV031 (Impressão Termo):**
   - URL real: `https://www.saneago.com.br/prt/hvw/HVW031ReimpressaoTermo.zul`
   - Inputs: 2 campos identificados (`Empregado` editável, `Empregado` readonly).
   - Botões: 3 botões na inspeção (`Relatório`, `Cancelar` e botão técnico `Sem Rotulo`).
   - Classe proposta: `somente_leitura` (reimpressão e emissão de termo de compromisso de viagem com botões Relatório e Cancelar).
   - Artefatos: `docs/mapeamento/evidencias/HVWV031.inspect.json`, `docs/apps/HVWV031.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

2. **HVWV050 (Prestar Contas Cartão Corporativo):**
   - URL real: `https://www.saneago.com.br/prt/hvw/HVW050PrestarContasCartao.zul`
   - Inputs: 17 campos identificados (`Nº Solicitação` editável, `Tipo Empregado` readonly, `Empregado` editável, `Empregado` readonly, `U.O. Lotação` readonly x2, `Data prevista de saída` readonly, `Data prevista de chegada` readonly, `Motivo Viagem` readonly, `Viagem via` readonly, `Tipo` readonly, `Valor Total Previsto` readonly, `Atividades realizadas` editável, `Status da viagem` readonly, `Data da prestação` readonly, `Matrícula da prestação` readonly, `Situação da prestação` readonly).
   - Botões: 8 botões na inspeção (`Consultar`, `Cancelar` e botões técnicos `Sem Rotulo`).
   - Classe proposta: `somente_leitura` (consulta e prestação de contas de viagens com cartão corporativo com botões Consultar e Cancelar).
   - Artefatos: `docs/mapeamento/evidencias/HVWV050.inspect.json`, `docs/apps/HVWV050.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

3. **JAJ042 (Consulta Cobrança):**
   - URL real: `https://www.saneago.com.br/prt/jaj/JAJ042conCobranca.zul`
   - Inputs: 3 campos identificados (`Conta` radio editável, `CPF/CNPJ` radio editável, `Conta` text editável).
   - Botões: 2 botões na inspeção (`Consultar`, `Cancelar`).
   - Classe proposta: `somente_leitura` (consulta de cobranças judiciais e extrajudiciais por conta ou CPF/CNPJ com botões Consultar e Cancelar).
   - Artefatos: `docs/mapeamento/evidencias/JAJ042.inspect.json`, `docs/apps/JAJ042.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **HVWV031 (`somente_leitura`):** Aplicação ZK de reimpressão de termo de compromisso de viagem (`HVW031ReimpressaoTermo.zul`), contendo apenas botões de relatório e cancelamento (`Relatório`, `Cancelar`).
- **HVWV050 (`somente_leitura`):** Aplicação ZK de consulta/prestação de contas de cartão corporativo (`HVW050PrestarContasCartao.zul`), contendo botões de consulta e cancelamento (`Consultar`, `Cancelar`).
- **JAJ042 (`somente_leitura`):** Aplicação ZK de consulta de cobrança judicial (`JAJ042conCobranca.zul`), contendo filtros por conta ou documento e botões de consulta e cancelamento (`Consultar`, `Cancelar`).

## Pendências para o Gate Humano

- Homologação das classificações propostas na safelist (`HVWV031`, `HVWV050` e `JAJ042` como `somente_leitura`).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-157
Auditadas 3 apps (lote lote-157) · 3 com entrada em roteiro.json
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
