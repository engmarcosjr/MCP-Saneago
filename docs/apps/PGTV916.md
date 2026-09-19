# PGTV916 — Motoristas

## Informações Gerais
- **Código:** PGTV916
- **Nome:** Motoristas
- **Módulo:** Gestão Transporte > Relatórios
- **Tecnologia:** misto
- **URL Real:** `https://www.saneago.com.br/prt/pgt/PGT916RelatorioMotorista.zul`
- **Status:** inventariado
- **Classe Proposta:** `somente_leitura`
- **Motivo:** Tela de relatório de motoristas com filtros por UO, tipo de autorização e formato de saída com botão Imprimir.

## Entradas Identificadas
| Rótulo | Tipo | Editável | ID / Nome |
|---|---|---|---|
| U.O | text | Sim | `kCsWf` |
| U.O | text | Não | `kCsWh-real` |
| U.O | checkbox | Sim | `kCsW_0-real` |
| Todos os motoristas cadastrados | radio | Sim | `kCsW50-real` (`_pgn61d1d`) |
| Apenas os motoristas com autorização válida | radio | Sim | `kCsW70-real` (`_pgn61d1d`) |
| Apenas os motoristas com autorização vencida | radio | Sim | `kCsW90-real` (`_pgn61d1d`) |
| Autorizações a vencer nos próximos 2 meses | radio | Sim | `kCsWb0-real` (`_pgn61d1d`) |
| PDF | radio | Sim | `kCsWh0-real` (`_pgf7ub8i`) |
| Planilha | radio | Sim | `kCsWj0-real` (`_pgf7ub8i`) |
| Não | radio | Sim | `kCsWp0-real` (`_pgvhdhj71`) |
| Sim | radio | Sim | `kCsWr0-real` (`_pgvhdhj71`) |

## Botões e Ações
| Rótulo | Tipo | ID | Ação Prevista |
|---|---|---|---|
| Imprimir | button | `kCsWu0` | Emite/imprime o relatório de motoristas conforme filtros |
| Cancelar | button | `kCsWv0` | Cancela operação / limpa filtros |

### Botões Ignorados (Auxiliares/Navegação)
- `Sem Rotulo` (a, `kCsWh-btn`) — acionador/consulta da U.O
