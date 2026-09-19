# Diário de Bordo — Mapeamento Lote 168

- **Data:** 2026-09-19
- **Lote:** lote-168
- **Executor:** omniclaude
- **Aplicações do Lote:** BAP005, BAP008, BAP012

---

## O que foi feito

Inspeção e inventário no portal corporativo Saneago via Playwright/ZK para as 3 aplicações da fila do backlog da Fase 1, sem preenchimento de campos e sem cliques em botões de ação:

1. **BAP005 (Emissão de Frequência):**
   - URL real: `https://www.saneago.com.br/prt/bap/BAP005EmitirFrequencia.zul`
   - Inputs: 5 campos (`Referência`, `Impressora` editável, `Impressora` readonly, `Folha de Frequência`, `Relatório de acompanhamento`).
   - Botões: 3 botões na inspeção (1 de ação: `Imprimir`; 2 botões técnicos ZK ignorados: `Sem Rotulo`).
   - Colunas do resultado: `Código`, `Unidade Organizacional`, `Sigla`.
   - Classe proposta: `somente_leitura` (emissão e impressão de folha de frequência e relatório de acompanhamento sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/BAP005.inspect.json`, `docs/apps/BAP005.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

2. **BAP008 (Comprovante de Rendimentos):**
   - URL real: `https://www.saneago.com.br/prt/bap/BAP008ComprovanteRendimentos.zul`
   - Inputs: 3 campos (`Empregado` matrícula readonly, `Empregado` nome readonly, `Ano Calendário` editável). Dados pessoais sensíveis do usuário logado foram redigidos como `[REDIGIDO]` na evidência bruta conforme a convenção de PII.
   - Botões: 3 botões na inspeção (1 de ação: `Consultar`; 2 botões técnicos ZK ignorados: `Sem Rotulo`).
   - Colunas do resultado: Nenhuma grade de resultados visível na tela inicial.
   - Classe proposta: `somente_leitura` (consulta e emissão de comprovante de rendimentos para informe de IRPF sem botões de escrita).
   - Artefatos: `docs/mapeamento/evidencias/BAP008.inspect.json`, `docs/apps/BAP008.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

3. **BAP012 (Enviar Declaração IRPF):**
   - URL real: `https://www.saneago.com.br/prt/bap/BAP012EnviaDeclaracao.zul`
   - Inputs: 5 campos (`Empregado` matrícula readonly, `Empregado` nome readonly, `Tipo de Documento` combobox, `Competência` combobox, `Competência` input file). Dados pessoais do usuário logado redigidos na evidência bruta como `[REDIGIDO]`.
   - Botões: 5 botões na inspeção (2 de ação: `Enviar`, `Cancelar`; 3 botões técnicos ZK ignorados: `Sem Rotulo`).
   - Colunas do resultado: `Selecione`, `Sequencial`, `Data Envio`, `Tipo Documento`, `Competência`, `Status Recebimento`, `Abrir Arquivo`, `Motivo Recusa`.
   - Classe proposta: `possui_escrita` (consulta de histórico de envios e submissão/upload de arquivo de declaração anual e recibo do IRPF com botão `Enviar`).
   - Artefatos: `docs/mapeamento/evidencias/BAP012.inspect.json`, `docs/apps/BAP012.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **BAP005 (`somente_leitura`):** Aplicação de emissão de frequência (`BAP005EmitirFrequencia.zul`), contendo apenas o botão de ação `Imprimir`, sem botões de gravação ou alteração de estado na tela inicial.
- **BAP008 (`somente_leitura`):** Aplicação de comprovante de rendimentos (`BAP008ComprovanteRendimentos.zul`), contendo apenas o botão de ação `Consultar`, sem botões de escrita.
- **BAP012 (`possui_escrita`):** Aplicação transacional de envio de declarações de IRPF (`BAP012EnviaDeclaracao.zul`), contendo formulário de upload e botão de ação `Enviar` para submissão cadastral ao sistema.

## Pendências para o Gate Humano

- Homologação das classificações propostas na safelist (`BAP005` e `BAP008` como `somente_leitura`; `BAP012` como `possui_escrita`).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-168
Auditadas 3 apps (lote lote-168) · 3 com entrada em roteiro.json
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
