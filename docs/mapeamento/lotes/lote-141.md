# Diário de Bordo — Mapeamento Lote 141

- **Data:** 2026-09-19
- **Lote:** lote-141
- **Executor:** omniclaude
- **Aplicações do Lote:** KRT028, KRTV028, MSIV070

---

## O que foi feito

Inspeção e inventário no portal corporativo Saneago via Playwright/ZK para as 3 aplicações prioritárias da fila de pendências do backlog da Fase 1, sem submissão de campos e sem cliques em botões de ação:

1. **KRT028 (Lista para Análise):**
   - URL real: `https://www.saneago.com.br/prt/krt/KRT028ListaAnalise.zul`
   - Inputs: 1 combobox readonly (`Selecione a etapa desejada`).
   - Botões: 0 botões de ação (1 botão ignorado de abertura da combobox: `Sem Rotulo`).
   - Colunas: 12 colunas de listagem (`Dias na Unidade`, `Número AVTO`, `Ano AVTO`, `Cidade`, `Parecer de Água`, `Parecer de Esgoto`, `U.O.`, `Prazo Final`, `Empreendedor`, `Qtd de Unidades Comerciais`, `Qtd de Unidades Residenciais`, `Nome Empreendimento`).
   - Classe proposta: `somente_leitura` (tela de consulta e listagem de AVTOs por etapa de análise sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/KRT028.inspect.json`, `docs/apps/KRT028.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

2. **KRTV028 (Lista para Análise):**
   - URL real: `https://www.saneago.com.br/prt/krt/KRT028ListaAnalise.zul`
   - Inputs: 1 combobox readonly (`Selecione a etapa desejada`).
   - Botões: 0 botões de ação (1 botão ignorado de abertura da combobox: `Sem Rotulo`).
   - Colunas: 12 colunas de listagem idênticas ao KRT028.
   - Classe proposta: `somente_leitura` (mesma tela ZK acessada via menu Controle de AVTOs -> AVTO -> Lista para Análise sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/KRTV028.inspect.json`, `docs/apps/KRTV028.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

3. **MSIV070 (Registrar Voto):**
   - URL real: `https://www.saneago.com.br/prt/msi/MSI070RegistrarVoto.zul?idEleicao=9`
   - Inputs: 0 inputs interativos detectados na tela inicial.
   - Botões: 0 botões na tela inicial.
   - Colunas: 0 colunas.
   - Classe proposta: `sem_campos_confirmado` (tela de registro de voto de eleições internas da intranet, aberta sem campos ou botões ativos para o perfil no momento da inspeção).
   - Artefatos: `docs/mapeamento/evidencias/MSIV070.inspect.json`, `docs/apps/MSIV070.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **KRT028 (`somente_leitura`):** Aplicação ZK de controle de processos de AVTO. Apresenta combobox de seleção de etapa e tabela de resultados para acompanhamento de prazos e pareceres de água/esgoto, sem botões de mutação de estado.
- **KRTV028 (`somente_leitura`):** Variante de menu para a mesma aplicação `KRT028ListaAnalise.zul`.
- **MSIV070 (`sem_campos_confirmado`):** Aplicação aberta via menu Serviços Intranet -> Voto -> Registrar Voto. A tela não apresentou campos de entrada nem botões de votação ativos no perfil/momento, provavelmente por ausência de eleição aberta com votação pendente para o usuário logado. Classificada como `sem_campos_confirmado` conforme protocolo da Fase 1.

## Pendências para o Gate Humano

- Homologação da classificação para safelist (`KRT028` e `KRTV028` para somente-leitura; `MSIV070` como sem_campos_confirmado).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-141
Auditadas 3 apps (lote lote-141) · 3 com entrada em roteiro.json
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
