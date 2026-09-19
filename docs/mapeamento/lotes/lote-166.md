# Diário de Bordo — Mapeamento Lote 166

- **Data:** 2026-09-19
- **Lote:** lote-166
- **Executor:** omniclaude
- **Aplicações do Lote:** A0009, A0074, A3000

---

## O que foi feito

Inspeção e inventário no portal corporativo Saneago via Playwright/ZK para as 3 aplicações da fila do backlog da Fase 1, sem preenchimento de campos e sem cliques em botões de ação:

1. **A0009 (CAESAN):**
   - URL real: `https://www.saneago.com.br/prt/msi/MSI003Organograma.zul`
   - Inputs: 0 campos.
   - Botões: 2 botões na inspeção (1 de ação: `Ver localização no Mapa`; 1 botão técnico ZK ignorado: `Sem Rotulo`).
   - Classe proposta: `somente_leitura` (consulta e visualização de organograma e localização no mapa da unidade CAESAN sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/A0009.inspect.json`, `docs/apps/A0009.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

2. **A0074 (EMP.LIC.INTER.PARTICULAR-SUREH):**
   - URL real: `https://www.saneago.com.br/prt/msi/MSI003Organograma.zul`
   - Inputs: 0 campos.
   - Botões: 2 botões na inspeção (1 de ação: `Ver localização no Mapa`; 1 botão técnico ZK ignorado: `Sem Rotulo`).
   - Classe proposta: `somente_leitura` (consulta e visualização de organograma e localização no mapa da unidade SUREH sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/A0074.inspect.json`, `docs/apps/A0074.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

3. **A3000 (CHEFE DE GABINETE):**
   - URL real: `https://www.saneago.com.br/prt/msi/MSI003Organograma.zul`
   - Inputs: 0 campos.
   - Botões: 2 botões na inspeção (1 de ação: `Ver localização no Mapa`; 1 botão técnico ZK ignorado: `Sem Rotulo`).
   - Classe proposta: `somente_leitura` (consulta e visualização de organograma e localização no mapa da unidade Chefia de Gabinete sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/A3000.inspect.json`, `docs/apps/A3000.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **A0009 (`somente_leitura`):** Aplicação de exibição de organograma e mapa da unidade CAESAN (`MSI003Organograma.zul`), contendo apenas o botão de consulta e visualização `Ver localização no Mapa` e botão técnico ZK de submissão sem escrita.
- **A0074 (`somente_leitura`):** Aplicação de exibição de organograma e mapa da unidade SUREH (`MSI003Organograma.zul`), contendo apenas o botão de consulta e visualização `Ver localização no Mapa` sem botões de escrita.
- **A3000 (`somente_leitura`):** Aplicação de exibição de organograma e mapa da Chefia de Gabinete (`MSI003Organograma.zul`), contendo apenas o botão de consulta e visualização `Ver localização no Mapa` sem botões de escrita.

## Pendências para o Gate Humano

- Homologação das classificações propostas na safelist (`A0009`, `A0074` e `A3000` como `somente_leitura`).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-166
Auditadas 3 apps (lote lote-166) · 3 com entrada em roteiro.json
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
