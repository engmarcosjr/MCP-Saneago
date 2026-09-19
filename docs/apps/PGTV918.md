# PGTV918 — Ordem de tráfego por motorista

## Informações Gerais
- **Código:** PGTV918
- **Nome:** Ordem de tráfego por motorista
- **Módulo:** Gestão Transporte > Relatórios
- **Tecnologia:** zk
- **URL Real:** `https://www.saneago.com.br/prt/pgt/PGT918OrdemTrafegoMotorista.zul`
- **Status:** inventariado
- **Classe Proposta:** `somente_leitura`
- **Motivo:** Tela de relatório de ordem de tráfego por motorista com filtros por matrícula, período e situação com botão Emitir.

## Entradas Identificadas
| Rótulo | Tipo | Editável | ID / Nome |
|---|---|---|---|
| Matricula | text | Sim | `wDJJl0` |
| Matricula | text | Não | `wDJJg-real` |
| Período | date | Sim | `wDJJ_0-real` |
| a | date | Sim | `wDJJ10-real` |
| Filtro Situação | combobox | Sim | `wDJJ60-real` |

## Botões e Ações
| Rótulo | Tipo | ID | Ação Prevista |
|---|---|---|---|
| Emitir | button | `wDJJ90` | Emite relatório de ordem de tráfego por motorista |
| Cancelar | button | `wDJJa0` | Cancela operação / limpa filtros |

### Botões Ignorados (Auxiliares/Navegação)
- `Sem Rotulo` (a, `wDJJg-btn`) — acionador/consulta da Matrícula
- `Sem Rotulo` (a, `wDJJ_0-btn`) — acionador do datebox Período
- `Sem Rotulo` (a, `wDJJ10-btn`) — acionador do datebox a
- `Sem Rotulo` (a, `wDJJ60-btn`) — acionador do combobox Filtro Situação
