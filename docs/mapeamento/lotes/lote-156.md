# Diário de Bordo — Mapeamento Lote 156

- **Data:** 2026-09-19
- **Lote:** lote-156
- **Executor:** omniclaude
- **Aplicações do Lote:** HFIV033, HVW031, HVWV018

---

## O que foi feito

Inspeção e inventário no portal corporativo Saneago via Playwright/ZK para as 3 aplicações prioritárias da fila do backlog da Fase 1, sem submissão de campos e sem cliques em botões de ação:

1. **HFIV033 (Registrar Parecer Transferências de Bens):**
   - URL real: `https://www.saneago.com.br/prt/hfi/HFI033RegistrarParecerTransfBensPatr.zul`
   - Inputs: 11 campos identificados (`Transferência` x2 readonly, `Data da Solicitação` readonly, `Responsável - Origem` x2 readonly, `Responsável - Destino` x2 readonly, `Data da Efetivação` readonly, `Parecer` editável, `U.O. - Destino` editável, `Observação` editável).
   - Botões: 13 botões na inspeção (`Salvar`, `Salvar e Finalizar`, `Cancelar`, `Adicionar`, `Excluir`, `Close`, `OK` e botões técnicos `Sem Rotulo`).
   - Classe proposta: `possui_escrita` (registro de parecer e tramitação de transferências de bens patrimoniais com botões de escrita Salvar, Salvar e Finalizar, Adicionar e Excluir).
   - Artefatos: `docs/mapeamento/evidencias/HFIV033.inspect.json`, `docs/apps/HFIV033.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

2. **HVW031 (Impressão Termo):**
   - URL real: `https://www.saneago.com.br/prt/hvw/HVW031ReimpressaoTermo.zul`
   - Inputs: 2 campos identificados (`Empregado` editável, `Empregado` readonly).
   - Botões: 3 botões na inspeção (`Relatório`, `Cancelar` e botão técnico `Sem Rotulo`).
   - Classe proposta: `somente_leitura` (reimpressão e emissão de termo de compromisso de viagem com botões Relatório e Cancelar).
   - Artefatos: `docs/mapeamento/evidencias/HVW031.inspect.json`, `docs/apps/HVW031.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

3. **HVWV018 (Manter Empregados com Cartão Viagem):**
   - URL real: `https://www.saneago.com.br/prt/hvw/HVW018CartaoViagemEmpregado.zul`
   - Inputs: 9 campos identificados (`Empregado` editável, `Empregado` readonly, `Banco` readonly, `Nº Cartão` editável, `limite do cartão` editável, `Justificativa do Cancelamento` editável, `Data de vencimento` editável, `Data cancelamento` editável x2).
   - Botões: 7 botões na inspeção (`Consultar`, `Cancelar` e botões técnicos `Sem Rotulo`).
   - Classe proposta: `somente_leitura` (consulta e acompanhamento de cartões de viagem de empregados com botões Consultar e Cancelar).
   - Artefatos: `docs/mapeamento/evidencias/HVWV018.inspect.json`, `docs/apps/HVWV018.md`, entrada em `config/roteiro.json`, safelist em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **HFIV033 (`possui_escrita`):** Aplicação ZK para registro de parecer e decisão de transferência de bens patrimoniais (`HFI033RegistrarParecerTransfBensPatr.zul`), contendo botões explícitos de escrita (`Salvar`, `Salvar e Finalizar`, `Adicionar`, `Excluir`).
- **HVW031 (`somente_leitura`):** Aplicação ZK de reimpressão de termo de responsabilidade de viagem (`HVW031ReimpressaoTermo.zul`), contendo apenas botões de emissão de relatório e cancelamento (`Relatório`, `Cancelar`).
- **HVWV018 (`somente_leitura`):** Aplicação ZK de consulta/gestão de cartões de viagem (`HVW018CartaoViagemEmpregado.zul`), apresentando na interface botões de consulta e cancelamento (`Consultar`, `Cancelar`), sem botões diretos de persistência de escrita na tela inicial.

## Pendências para o Gate Humano

- Homologação das classificações propostas na safelist (`HFIV033` como `possui_escrita`; `HVW031` e `HVWV018` como `somente_leitura`).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-156
Auditadas 3 apps (lote lote-156) · 3 com entrada em roteiro.json
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
