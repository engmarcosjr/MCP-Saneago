# LRSV019 — Índices do SIPSAP

## Informações Gerais
- **Código:** LRSV019
- **Nome:** Índices do SIPSAP
- **Módulo:** Atendimento ao Publico > Relatório
- **Tecnologia:** misto
- **URL Real:** `https://www.saneago.com.br/prt/lrs/LRS019IndiceSIPSAP.zul`
- **Status:** inventariado
- **Classe Proposta:** `somente_leitura`
- **Motivo:** Tela mista de geração e emissão de relatório de índices do SIPSAP por tipo e mês/ano de referência com botão Gerar Relatório.

## Entradas Identificadas
| Rótulo | Tipo | Editável | ID / Nome |
|---|---|---|---|
| Tipo de Relatório | combobox | Sim | `eK6Yb-real` |
| Mês/Ano referência | date | Sim | `eK6Yi-real` |
| Completo | radio | Sim | `eK6Yo-real` (name: `_pgje2dv9`) |
| Desagregado | radio | Sim | `eK6Yp-real` (name: `_pgje2dv9`) |

## Botões e Ações
| Rótulo | Tipo | ID | Ação Prevista |
|---|---|---|---|
| Gerar Relatório | button | `eK6Ys` | Gera e emite o relatório de índices do SIPSAP |

### Elementos Auxiliares Ignorados
- `Sem Rotulo` (id: `eK6Yb-btn`, tipo: `a`) — abridor de combobox Tipo de Relatório.
- `Sem Rotulo` (id: `eK6Yi-btn`, tipo: `a`) — abridor de datepicker Mês/Ano referência.

## Colunas da Grade
Nenhuma coluna tabular identificada na tela inicial.
