# Diário de Bordo — Mapeamento Lote 163

- **Data:** 2026-09-19
- **Lote:** lote-163
- **Executor:** omniclaude
- **Aplicações do Lote:** MGOV050, MSI001, MSI070

---

## O que foi feito

Inspeção e inventário no portal corporativo Saneago via Playwright/ZK para as 3 aplicações da fila do backlog da Fase 1, sem preenchimento de campos e sem cliques em botões de ação:

1. **MGOV050 (Painel Estatístico Ouvidoria):**
   - URL real: Inacessível (frame não encontrado após busca e navegação via menu no portal).
   - Inputs: 0 campos.
   - Botões: 0 botões.
   - Classe proposta: `bloqueada` (aplicação não carregou frame no portal corporativo para o perfil atual).
   - Artefatos: `docs/mapeamento/evidencias/MGOV050.inspect.json`, `docs/apps/MGOV050.md`, safelist em `docs/SAFELIST_LEITURA.md`.

2. **MSI001 (Exportar Contatos):**
   - URL real: `https://www.saneago.com.br/prt/msi/MSI003Organograma.zul`
   - Inputs: 0 campos na tela inicial.
   - Botões: 2 botões na inspeção (1 de ação: `Ver localização no Mapa`; 1 botão técnico ZK ignorado: `Sem Rotulo`).
   - Classe proposta: `somente_leitura` (visualização de organograma corporativo e localização no mapa em Exportar Contatos sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/MSI001.inspect.json`, `docs/apps/MSI001.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

3. **MSI070 (Registrar Voto):**
   - URL real: `https://www.saneago.com.br/prt/msi/MSI070RegistrarVoto.zul?idEleicao=9`
   - Inputs: 0 campos.
   - Botões: 0 botões.
   - Classe proposta: `sem_campos_confirmado` (tela de registro de voto de eleições corporativas aberta sem campos interativos de formulário ou botões de ação na tela inicial).
   - Artefatos: `docs/mapeamento/evidencias/MSI070.inspect.json`, `docs/apps/MSI070.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **MGOV050 (`bloqueada`):** Painel estatístico da Ouvidoria cujo frame não pôde ser instanciado no portal para o perfil de acesso atual.
- **MSI001 (`somente_leitura`):** Aplicação de consulta ao organograma e localização no mapa (`MSI003Organograma.zul`), contendo apenas o botão `Ver localização no Mapa` e sem botões de gravação ou escrita.
- **MSI070 (`sem_campos_confirmado`):** Tela ZUL de eleição corporativa (`MSI070RegistrarVoto.zul?idEleicao=9`) carregada sem campos interativos de formulário nem botões acionáveis na tela inicial. Retorna à fila de backlog até acumular 3 tentativas reais antes de aposentadoria.

## Pendências para o Gate Humano

- Homologação das classificações propostas na safelist (`MGOV050` como `bloqueada`; `MSI001` como `somente_leitura`; `MSI070` como `sem_campos_confirmado`).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-163
Auditadas 3 apps (lote lote-163) · 2 com entrada em roteiro.json
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
