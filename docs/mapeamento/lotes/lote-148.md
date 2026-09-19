# Diário de Bordo — Mapeamento Lote 148

- **Data:** 2026-09-19
- **Lote:** lote-148
- **Executor:** omniclaude
- **Aplicações do Lote:** EAC799, EGWV004, EGWV006

---

## O que foi feito

Inspeção e inventário no portal corporativo Saneago via Playwright/ZK para as 3 aplicações prioritárias da fila do backlog da Fase 1, sem submissão de campos e sem cliques em botões de ação:

1. **EAC799 (Atendimento):**
   - URL real: `null` (aplicação não encontrada na busca direta nem no menu de navegação do portal para o perfil atual).
   - Inputs: Nenhum campo acessível.
   - Botões: Nenhum botão acessível.
   - Colunas: Nenhuma grade de resultados acessível.
   - Classe proposta: `bloqueada` (aplicação inacessível no portal para o perfil atual — 3ª tentativa real acumulada, com reinspeção confirmada).
   - Artefatos: `docs/mapeamento/evidencias/EAC799.inspect.json`, `docs/apps/EAC799.md`, safelist em `docs/SAFELIST_LEITURA.md`.

2. **EGWV004 (Compara Consumos Medidos):**
   - URL real: `https://www.saneago.com.br/prt/egw/EGW004FatPCidade.jsp`
   - Inputs: 2 campos identificados (`Cidade` select editável, `Mês/Ano de Referência` text editável).
   - Botões: Nenhum botão detectado na tela inicial (JSP com form `frmEGC004`).
   - Colunas: Nenhuma grade de resultados detectada na tela inicial.
   - Classe proposta: `somente_leitura` (consulta e comparação de consumo das contas masters por cidade e referência sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/EGWV004.inspect.json`, `docs/apps/EGWV004.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

3. **EGWV006 (Controle do Envio do Resumo):**
   - URL real: `https://www.saneago.com.br/prt/egw/EGW006ConsultaEnvioIndividualizado.zul`
   - Inputs: 1 campo identificado (`Conta Macro/Condomínio` text editável).
   - Botões: 2 botões de ação (`Consultar`, `Cancelar`).
   - Colunas: Nenhuma grade de resultados detectada na tela inicial.
   - Classe proposta: `somente_leitura` (consulta do controle de envio individualizado do resumo de faturamento por conta macro ou condomínio sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/EGWV006.inspect.json`, `docs/apps/EGWV006.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **EAC799 (`bloqueada`):** Aplicação de atendimento comercial não localizada na busca rápida nem no menu do perfil atual. 3ª tentativa real concluída com sucesso (atinge critério de aposentadoria no backlog).
- **EGWV004 (`somente_leitura`):** Aplicação JSP de comparação e consulta de consumo master por cidade apontando para `EGW004FatPCidade.jsp`, sem botões de escrita.
- **EGWV006 (`somente_leitura`):** Aplicação ZK de controle de envio individualizado do resumo apontando para `EGW006ConsultaEnvioIndividualizado.zul`, contendo apenas botões de consulta e cancelamento.

## Pendências para o Gate Humano

- Homologação da classificação para safelist (`EGWV004` e `EGWV006` como somente-leitura; `EAC799` como bloqueada/aposentada).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-148
Auditadas 3 apps (lote lote-148) · 2 com entrada em roteiro.json
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
