# Diário de Bordo — Mapeamento Lote 126

- **Data:** 2026-09-19
- **Lote:** lote-126
- **Executor:** omniclaude
- **Aplicações do Lote:** ECO120, ECO121, ECO122

---

## O que foi feito

Inventário e inspeção direta no portal corporativo ZK via Playwright para as 3 aplicações prioritárias da fila de pendências do backlog da Fase 1, sem clicar nem submeter campos:

1. **ECO120 (Logradouros por Nome/Bairro):**
   - URL real: `https://www.saneago.com.br/prt/eco/ECO120ConsultaLogradouro.zul`
   - Inputs: 5 campos (Cidade código editável, Cidade nome readonly, Bairro código readonly, Bairro nome readonly, Nome do Logradouro editável).
   - Botões: 4 detectados no DOM ZK (`Consultar`, `Cancelar`, e 2 botões ignorados `Sem Rotulo` de combobox).
   - Colunas do Resultado: Cód. Bairro, Bairro, Cód. Logradouro, Tipo, Logradouro, CEP, Superintendência, Regional, Distrito, ECO154.
   - Classe proposta: `somente_leitura` (tela de consulta de logradouros por filtros sem botões de escrita/persistência).
   - Artefatos gerados/atualizados: `docs/mapeamento/evidencias/ECO120.inspect.json`, `docs/apps/ECO120.md`, entrada em `config/roteiro.json` e registro em `docs/SAFELIST_LEITURA.md`.

2. **ECO121 (Reordenação Codificação de Massa):**
   - URL real: `https://www.saneago.com.br/prt/eco/ECO121ReordenarRota.zul`
   - Inputs: 4 campos (Cidade código editável, Cidade nome readonly, Grupo de Faturamento editável, Rota editável).
   - Botões: 3 detectados no DOM ZK (`Reordenar`, `Cancelar`, e 1 botão ignorado `Sem Rotulo` de combobox).
   - Classe proposta: `possui_escrita` (botão de ação `Reordenar` altera a ordenação de rota/codificação de massa).
   - Artefatos gerados/atualizados: `docs/mapeamento/evidencias/ECO121.inspect.json`, `docs/apps/ECO121.md`, entrada em `config/roteiro.json` e registro em `docs/SAFELIST_LEITURA.md`.

3. **ECO122 (Manutenção de Bairros):**
   - URL real: `https://www.saneago.com.br/prt/eco/ECO122ManutencaoBairro.zul`
   - Inputs: 17 campos (Cidade, Bairro, Informar % para contas S/N, Nome, Distrito, Cidade Emissão, Coleta Esgoto, Tratamento Esgoto, % Coleta, % Tratamento, Consumo Mínimo, Sintético, Analítico).
   - Botões: 7 detectados no DOM ZK (`Consultar`, `Cancelar`, e 5 botões ignorados `Sem Rotulo` de combobox).
   - Classe proposta: `somente_leitura` (consulta e visualização de parâmetros tributários e cadastrais de bairros sem botões de escrita na tela inicial).
   - Artefatos gerados/atualizados: `docs/mapeamento/evidencias/ECO122.inspect.json`, `docs/apps/ECO122.md`, entrada em `config/roteiro.json` e registro em `docs/SAFELIST_LEITURA.md`.

## Decisões Tomadas e Classes Propostas

- **ECO120 (`somente_leitura`):** Consulta cadastral de logradouros por filtros sem botões de escrita.
- **ECO121 (`possui_escrita`):** Botão `Reordenar` executa ação operacional de reordenação de rotas.
- **ECO122 (`somente_leitura`):** Consulta de parâmetros de manutenção e tributação de bairros com botões Consultar e Cancelar.

## Pendências para o Gate Humano

- Homologação das propostas para safelist da Fase 2 (`ECO120` e `ECO122` para leitura, `ECO121` classificada com escrita).

## Verificação e Auditoria

```bash
$ node -e "require('./config/roteiro.json')"
# JSON válido sem erros de sintaxe

$ node scripts/auditar-mapeamento.js --lote lote-126
Auditadas 3 apps (lote lote-126) · 3 com entrada em roteiro.json
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
