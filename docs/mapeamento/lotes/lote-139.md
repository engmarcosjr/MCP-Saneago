# Diário de Bordo — Mapeamento Lote 139

- **Data:** 2026-09-19
- **Lote:** lote-139
- **Executor:** omniclaude
- **Aplicações do Lote:** HVWV019, JAJ028, JAJ033

---

## O que foi feito

Inspeção e inventário no portal corporativo Saneago via Playwright/ZK para as 3 aplicações prioritárias da fila de pendências do backlog da Fase 1, sem submissão de campos e sem cliques em botões de ação:

1. **HVWV019 (Manutenção):**
   - URL real: `https://www.saneago.com.br/prt/hvw/HVW019ManutencaoCartaoViagem.zul`
   - Inputs: 15 inputs (`Empregado`, `Empregado`, `U.O. Lotação`, `U.O. Lotação`, `Nº Remessa`, `Nº Cartão`, `Via`, `Data de Emissão`, `Data validade`, `Data entrega`, `Entregue por`, `Entregue por`, `Cancelado por`, `Cancelado por`, `Data cancelamento`).
   - Botões: 9 botões na tela (`Consultar`, `Cancelar`, além de 7 botões técnicos `Sem Rotulo`).
   - Classe proposta: `somente_leitura` (tela de consulta do histórico e manutenção de cartões corporativos de viagem sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/HVWV019.inspect.json`, `docs/apps/HVWV019.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

2. **JAJ028 (Consulta Judicial):**
   - URL real: `https://www.saneago.com.br/prt/jaj/JAJ028ConJudicial.jsp`
   - Inputs: 11 inputs (`Código do Escritório`, `Nº Processo (novo)`, `Nº Processo (novo)`, `Nº Processo (novo)`, `Nº Processo (novo)`, `Nº Processo (novo)`, `Nº Processo (novo)`, `ou`, `Número Conta`, `Número Conta`, `Situação`).
   - Botões: 0 botões na tela inicial.
   - Classe proposta: `somente_leitura` (tela JSP de consulta de processos judiciais por escritório, número ou conta sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/JAJ028.inspect.json`, `docs/apps/JAJ028.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

3. **JAJ033 (Agenda Audiência):**
   - URL real: `https://www.saneago.com.br/prt/jaj/JAJ033agendaAudi.jsp`
   - Inputs: 9 inputs (`Período`, `Período`, `Código do Escritório`, `Comarca`, `Comarca`, `Comarca`, `Comarca`, `Preposto`, `Preposto`).
   - Botões: 0 botões na tela inicial.
   - Classe proposta: `somente_leitura` (tela JSP de consulta de agenda de audiências judiciais por período e comarca sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/JAJ033.inspect.json`, `docs/apps/JAJ033.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **HVWV019 (`somente_leitura`):** Aplicação abre via menu Controle de Viagens -> Cartão -> Manutenção apontando para `HVW019ManutencaoCartaoViagem.zul`. Apresenta filtros e histórico de cartões com botões Consultar e Cancelar.
- **JAJ028 (`somente_leitura`):** Aplicação abre via busca direta no portal apontando para `JAJ028ConJudicial.jsp`. Trata-se de consulta a processos judiciais contenciosos sem botões de gravação/escrita.
- **JAJ033 (`somente_leitura`):** Aplicação abre via busca direta no portal apontando para `JAJ033agendaAudi.jsp`. Destinada à consulta e acompanhamento de agenda de audiências por período.

## Pendências para o Gate Humano

- Homologação da classificação para safelist (`HVWV019`, `JAJ028` e `JAJ033` para somente-leitura).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-139
Auditadas 3 apps (lote lote-139) · 3 com entrada em roteiro.json
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
