# Diário de Bordo — Mapeamento Lote 155

- **Data:** 2026-09-19
- **Lote:** lote-155
- **Executor:** omniclaude
- **Aplicações do Lote:** HFI033, HFIV031, HFIV032

---

## O que foi feito

Inspeção e inventário no portal corporativo Saneago via Playwright/ZK para as 3 aplicações prioritárias da fila do backlog da Fase 1, sem submissão de campos e sem cliques em botões de ação:

1. **HFI033 (Registrar Parecer Transferências de Bens):**
   - URL real: `https://www.saneago.com.br/prt/hfi/HFI033RegistrarParecerTransfBensPatr.zul`
   - Inputs: 11 campos identificados (`Transferência` x2 readonly, `Data da Solicitação` readonly, `Responsável - Origem` x2 readonly, `Responsável - Destino` x2 readonly, `Data da Efetivação` readonly, `Parecer` editável, `U.O. - Destino` editável, `Observação` editável).
   - Botões: 13 botões na inspeção (`Salvar`, `Salvar e Finalizar`, `Cancelar`, `Adicionar`, `Excluir`, `Close`, `OK` e botões técnicos `Sem Rotulo`).
   - Classe proposta: `possui_escrita` (registro de parecer e tramitação de transferências de bens patrimoniais com botões de escrita Salvar, Salvar e Finalizar, Adicionar e Excluir).
   - Artefatos: `docs/mapeamento/evidencias/HFI033.inspect.json`, `docs/apps/HFI033.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

2. **HFIV031 (Solicitar Transferência Bem Patrimonial):**
   - URL real: `https://www.saneago.com.br/prt/hfi/HFI031SolicitarTransfBemPatrimonial.zul`
   - Inputs: 2 campos identificados (`Transferência` editável x2).
   - Botões: 3 botões na inspeção (`Consultar`, `Novo`, `Cancelar`).
   - Classe proposta: `possui_escrita` (solicitação de transferência de bem patrimonial com botão de ação Novo e consulta por número de transferência).
   - Artefatos: `docs/mapeamento/evidencias/HFIV031.inspect.json`, `docs/apps/HFIV031.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

3. **HFIV032 (Acompanhar Transf. de Bens Patrimoniais):**
   - URL real: `https://www.saneago.com.br/prt/hfi/HFI032AcompanharTransfBemPatr.zul`
   - Inputs: 8 campos identificados (`Transferência` x2 editável, `Status` editável, `Data da Solicitaçõo` editável, `à` editável, `Data da Conclusão` editável, `à` editável, `Nº inventário` editável).
   - Botões: 8 botões na inspeção (`Consultar`, `Novo`, `Cancelar` e 5 botões técnicos `Sem Rotulo`).
   - Classe proposta: `possui_escrita` (acompanhamento e consulta de transferência de bens patrimoniais com botão Novo para criação de solicitação e ações na listagem).
   - Artefatos: `docs/mapeamento/evidencias/HFIV032.inspect.json`, `docs/apps/HFIV032.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **HFI033 (`possui_escrita`):** Aplicação ZK para registro de parecer e decisão de transferência de bens patrimoniais (`HFI033RegistrarParecerTransfBensPatr.zul`), contendo botões explícitos de escrita (`Salvar`, `Salvar e Finalizar`, `Adicionar`, `Excluir`).
- **HFIV031 (`possui_escrita`):** Aplicação ZK de solicitação de transferência (`HFI031SolicitarTransfBemPatrimonial.zul`), contendo botão `Novo` para abertura de novas transferências.
- **HFIV032 (`possui_escrita`):** Aplicação ZK de acompanhamento de transferências (`HFI032AcompanharTransfBemPatr.zul`), contendo botão `Novo` e ações operacionais na tabela.

## Pendências para o Gate Humano

- Homologação das classificações propostas na safelist (`HFI033`, `HFIV031` e `HFIV032` como `possui_escrita`).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-155
Auditadas 3 apps (lote lote-155) · 3 com entrada em roteiro.json
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
