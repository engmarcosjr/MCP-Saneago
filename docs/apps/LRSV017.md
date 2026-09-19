# LRSV017 — Situação Distrito SIP/SAP

## Informações Gerais
- **Código:** LRSV017
- **Nome:** Situação Distrito SIP/SAP
- **Módulo:** Atendimento ao Publico > Cadastro
- **Tecnologia:** misto
- **URL Real:** `https://www.saneago.com.br/prt/lrs/LRS017CadSituacaoDistritoSIPSAP.zul`
- **Status:** inventariado
- **Classe Proposta:** `somente_leitura`
- **Motivo:** Tela mista de cadastro e situação de distrito SIP/SAP com botões de consulta e cancelamento (Consultar, Cancelar).

## Entradas Identificadas
| Rótulo | Tipo | Editável | ID / Nome |
|---|---|---|---|
| Distrito | text | Sim | `m1HYs1` |
| Distrito | text | Não (readonly) | `m1HYj-real` |
| Tipo de implantação | combobox | Não (readonly) | `m1HY40-real` |
| Data de Implantação | date | Sim | `m1HYb0-real` |
| Sim | radio | Sim | `m1HYk0-real` (name: `_pgi9bh0g1`) |
| Não | radio | Sim | `m1HYl0-real` (name: `_pgi9bh0g1`) |
| Sim | radio | Sim | `m1HYu0-real` (name: `_pgseg77d1`) |
| Não | radio | Sim | `m1HYv0-real` (name: `_pgseg77d1`) |
| Funcionário Responsárvel | text | Não (readonly) | `m1HY21` |
| Data do cadastro | date | Não (readonly) | `m1HY91-real` |

## Botões e Ações
| Rótulo | Tipo | ID | Ação Prevista |
|---|---|---|---|
| Consultar | button | `m1HYd1` | Executa a consulta da situação do distrito |
| Cancelar | button | `m1HYh1` | Cancela a operação e limpa o formulário |

### Elementos Auxiliares Ignorados
- `Sem Rotulo` (id: `m1HYj-btn`, tipo: `a`) — abridor de lookup Distrito.
- `Sem Rotulo` (id: `m1HY40-btn`, tipo: `a`) — abridor de combobox Tipo de implantação.
- `Sem Rotulo` (id: `m1HYb0-btn`, tipo: `a`) — abridor de datepicker Data de Implantação.
- `Sem Rotulo` (id: `m1HY91-btn`, tipo: `a`) — abridor de datepicker Data do cadastro.

## Colunas da Grade
Nenhuma coluna tabular identificada na tela inicial.
