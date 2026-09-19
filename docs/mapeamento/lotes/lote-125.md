# Diário de Bordo — Mapeamento Lote 125

- **Data:** 2026-09-19
- **Lote:** lote-125
- **Executor:** omniclaude
- **Aplicações do Lote:** ECO104, ECO106, ECO108

---

## O que foi feito

Inventário e inspeção direta no portal corporativo ZK via Playwright para as 3 aplicações prioritárias do backlog da Fase 1, sem clicar nem submeter campos:

1. **ECO104 (Contas com Prazo por Período):**
   - URL real: `https://www.saneago.com.br/prt/eco/ECO104ContaPrazoPeriodo.zul`
   - Inputs: 10 campos (Superintendência, Gerência, Cidade, T, Período e data final 'a').
   - Botões: 8 detectados no DOM ZK (`Executar Job`, `Cancelar`, e 6 botões ignorados `Sem Rotulo` de combobox).
   - Classe proposta: `possui_escrita` (devido à presença do botão de ação `Executar Job` para disparo de processamento/job em lote no servidor).
   - Artefatos gerados/atualizados: `docs/mapeamento/evidencias/ECO104.inspect.json`, `docs/apps/ECO104.md`, entrada em `config/roteiro.json` e registro em `docs/SAFELIST_LEITURA.md`.

2. **ECO106 (Quantidade de Contas em Débito Automático):**
   - URL real: `https://www.saneago.com.br/prt/eco/ECO106DebitoAutomatico.zul`
   - Inputs: 5 campos (3 totais consolidados em modo readonly e 2 radio buttons Sim/Não para filtros).
   - Botões: Nenhum botão de ação na tela inicial.
   - Colunas de Grade: Banco, Quantidade de Contas, Código, Nome, Total, Saneago, Subdelegada.
   - Classe proposta: `somente_leitura` (painel estatístico consolidado e de visualização, sem botões de gravação ou escrita).
   - Artefatos gerados/atualizados: `docs/mapeamento/evidencias/ECO106.inspect.json`, `docs/apps/ECO106.md`, entrada em `config/roteiro.json` e registro em `docs/SAFELIST_LEITURA.md`.

3. **ECO108 (Relação de contas potencial faturamento):**
   - URL real: `https://www.saneago.com.br/prt/eco/ECO108ListarContasPotenFaturamento.zul`
   - Inputs: 14 campos (filtros geográficos e de faturamento: Cidade, Bairro, Distrito, Logradouro, Grupo de Faturamento, Rota, e opções de radio buttons).
   - Botões: 6 detectados no DOM ZK (`Consultar`, `Cancelar`, e 4 botões ignorados `Sem Rotulo` de combobox).
   - Classe proposta: `somente_leitura` (tela de consulta com filtros parametrizados e botão Consultar, sem botões de persistência/escrita).
   - Artefatos gerados/atualizados: `docs/mapeamento/evidencias/ECO108.inspect.json`, `docs/apps/ECO108.md`, entrada em `config/roteiro.json` e registro em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **ECO104 (`possui_escrita`):** Disparo de rotina/job em lote no servidor através do botão `Executar Job`.
- **ECO106 (`somente_leitura`):** Painel estatístico/consulta de débito automático sem botões de escrita.
- **ECO108 (`somente_leitura`):** Consulta operacional de faturamento potencial sem botões de alteração de estado.

## Pendências para o Gate Humano

- Homologação das propostas para safelist da Fase 2 (`ECO106` e `ECO108` para leitura, `ECO104` retida com escrita/processamento).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-125
Auditadas 3 apps (lote lote-125) · 3 com entrada em roteiro.json
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
