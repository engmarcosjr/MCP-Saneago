# PGTV912 — Ordens de Tráfego p/ Período e Situação

## Informações Gerais
- **Código:** PGTV912
- **Nome:** Ordens de Tráfego p/ Período e Situação
- **Módulo:** Gestão Transporte > Relatórios
- **Tecnologia:** misto
- **URL Real:** `https://www.saneago.com.br/prt/pgt/PGT912RelatorioOrdemTrafego.zul`
- **Status:** inventariado
- **Classe Proposta:** `somente_leitura`
- **Motivo:** Tela de relatório de ordens de tráfego por período e situação com botão Consultar.

## Entradas Identificadas
| Rótulo | Tipo | Editável | ID / Nome |
|---|---|---|---|
| Período | date | Sim | `hS8Ud-real` |
| a | date | Sim | `hS8Uf-real` |
| Situações | checkbox | Sim | `hS8Ul-real` |
| Aberta | checkbox | Sim | `hS8Um-real` |
| Reservada | checkbox | Sim | `hS8Un-real` |
| Empenhada | checkbox | Sim | `hS8Uo-real` |
| Encerrada | checkbox | Sim | `hS8Up-real` |

## Botões e Ações
| Rótulo | Tipo | ID | Ação Prevista |
|---|---|---|---|
| Consultar | button | `hS8Ut` | Consulta ordens de tráfego conforme período e situações selecionadas |
| Cancelar | button | `hS8Uv` | Cancela operação / limpa filtros |

### Botões Ignorados (Auxiliares/Navegação)
- `Sem Rotulo` (a, `hS8Ud-btn`) — acionador do datebox Período
- `Sem Rotulo` (a, `hS8Uf-btn`) — acionador do datebox a
