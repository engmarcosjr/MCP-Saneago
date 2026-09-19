# Diário de Bordo — Mapeamento Lote 130

- **Data:** 2026-09-19
- **Lote:** lote-130
- **Executor:** omniclaude
- **Aplicações do Lote:** ECOV830, PGT505, PGTV505

---

## O que foi feito

Inspeção e inventário no portal corporativo Saneago via Playwright/ZK para as 3 aplicações prioritárias da fila de pendências do backlog da Fase 1, sem submissão de campos e sem cliques em botões de ação:

1. **ECOV830 (WEBCOM - Vídeo Aulas):**
   - URL real: `https://www.saneago.com.br/prt/eco/ECO830VideoAulas.zul`
   - Inputs: 0 campos interativos detectados na tela inicial.
   - Botões: 0 botões detectados na tela inicial.
   - Classe proposta: `sem_campos_confirmado` (tela informativa/player de treinamentos e vídeo aulas sem campos de entrada e sem botões de escrita).
   - Tentativas acumuladas: 3 (atinge limite de tentativas para aposentadoria do backlog).
   - Artefatos: `docs/mapeamento/evidencias/ECOV830.inspect.json`, `docs/apps/ECOV830.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

2. **PGT505 (Resumo):**
   - URL real: `https://www.saneago.com.br/prt/pgt/PGT505Resumo.zul`
   - Inputs: 1 campo de texto (`Número O.T` editável).
   - Botões: 2 botões detectados na tela inicial (`Consultar`, `Cancelar`).
   - Classe proposta: `somente_leitura` (consulta de resumo e andamento de Ordens de Tráfego por número de OT sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/PGT505.inspect.json`, `docs/apps/PGT505.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

3. **PGTV505 (Resumo):**
   - URL real: `https://www.saneago.com.br/prt/pgt/PGT505Resumo.zul`
   - Inputs: 1 campo de texto (`Número O.T` editável).
   - Botões: 2 botões detectados na tela inicial (`Consultar`, `Cancelar`).
   - Classe proposta: `somente_leitura` (consulta de resumo e andamento de Ordens de Tráfego por número de OT sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/PGTV505.inspect.json`, `docs/apps/PGTV505.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **ECOV830 (`sem_campos_confirmado`):** Tela informativa direta em tecnologia ZUL (`ECO830VideoAulas.zul`) sem formulários ou botões.
- **PGT505 (`somente_leitura`):** Consulta de resumo de Ordem de Tráfego por número de OT com botão `Consultar`.
- **PGTV505 (`somente_leitura`):** Consulta de resumo de Ordem de Tráfego por número de OT com botão `Consultar`.

## Pendências para o Gate Humano

- Homologação das propostas para safelist da Fase 2 (`PGT505` e `PGTV505` para leitura, `ECOV830` como tela informativa/sem campos).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-130
Auditadas 3 apps (lote lote-130) · 3 com entrada em roteiro.json
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
