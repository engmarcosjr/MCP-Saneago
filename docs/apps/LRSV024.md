# LRSV024 — Indicadores do SIPSAP por Período

## Informações Gerais
- **Código:** LRSV024
- **Nome:** Indicadores do SIPSAP por Período
- **Módulo:** Atendimento ao Publico > Relatório
- **Tecnologia:** zk
- **URL Real:** `https://www.saneago.com.br/prt/lrs/LRS024IndiceSIPSAPPeriodo.zul`
- **Status:** inventariado
- **Classe Proposta:** `somente_leitura`
- **Motivo:** Tela ZK de emissão de relatório de indicadores do SIPSAP por período e distrito opcional com botão Gerar Relatório.

## Entradas Identificadas
| Rótulo | Tipo | Editável | ID / Nome |
|---|---|---|---|
| Período de referência | date | Sim | `aYOGd-real` |
| a | date | Sim | `aYOGh-real` |
| Distrito (opcional) | text | Sim | `aYOGj0` |
| Distrito (opcional) | text | Não (readonly) | `aYOGp-real` |

## Botões e Ações
| Rótulo | Tipo | ID | Ação Prevista |
|---|---|---|---|
| Gerar Relatório | button | `aYOG60` | Emite o relatório de indicadores por período |

### Elementos Auxiliares Ignorados
- `Sem Rotulo` (id: `aYOGd-btn`, tipo: `a`) — abridor de datepicker Período de referência.
- `Sem Rotulo` (id: `aYOGh-btn`, tipo: `a`) — abridor de datepicker a.
- `Sem Rotulo` (id: `aYOGp-btn`, tipo: `a`) — abridor/pesquisador de Distrito (opcional).

## Colunas da Grade
Nenhuma coluna tabular identificada na tela inicial.
