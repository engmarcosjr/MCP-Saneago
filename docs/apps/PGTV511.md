# PGTV511 — Empregados Ordem de Tráfego

## Informações Gerais
- **Código:** PGTV511
- **Nome:** Empregados Ordem de Tráfego
- **Módulo:** Gestão Transporte > Ordem Tráfego
- **Tecnologia:** zk
- **URL Real:** `https://www.saneago.com.br/prt/pgt/PGT511EmpregadoOrdemTrafego.zul`
- **Status:** inventariado
- **Classe Proposta:** `possui_escrita`
- **Motivo:** Tela de cadastro e associação de empregados a ordens de tráfego com botão Incluir.

## Entradas Identificadas
| Rótulo | Tipo | Editável | ID / Nome |
|---|---|---|---|
| Ordem de Tráfego | text | Não | `oT3Hc` |
| Ordem de Tráfego | text | Não | `oT3Hd` |
| Empregado | text | Sim | `oT3Hp0` |
| Empregado | text | Não | `oT3Hl-real` |

## Botões e Ações
| Rótulo | Tipo | ID | Ação Prevista |
|---|---|---|---|
| Close | submit | `oT3H0-close` | Fecha a janela modal de empregados |
| Incluir | button | `oT3Hc0` | Inclui/associa empregado na ordem de tráfego |
| Cancelar | button | `oT3He0` | Cancela operação / fecha janela |

### Botões Ignorados (Auxiliares/Navegação)
- `Sem Rotulo` (a, `oT3Hl-btn`) — acionador de busca do Empregado
- `Sem Rotulo` (submit, `oT3H20-a`) — submit auxiliar da grid/tabela
