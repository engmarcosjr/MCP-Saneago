# PGTV507 — Ordem de Tráfego em Reserva

## Informações Gerais
- **Código:** PGTV507
- **Nome:** Ordem de Tráfego em Reserva
- **Módulo:** Gestão Transporte > Ordem Tráfego
- **Tecnologia:** misto
- **URL Real:** `https://www.saneago.com.br/prt/pgt/PGT510AtendimentoOrdemTrafego.zul?in=1`
- **Status:** inventariado
- **Classe Proposta:** `somente_leitura`
- **Motivo:** Tela de consulta e listagem de ordens de tráfego em reserva com botão Atualizar.

## Entradas Identificadas
| Rótulo | Tipo | Editável | ID / Nome |
|---|---|---|---|
| Posto de Serviço | text | Sim | `mXGMb1` |
| Posto de Serviço | text | Não | `mXGMi-real` |
| Posto de Serviço | checkbox | Não | `mXGM00-real` |
| Número. O.T | text | Sim | `mXGMv0` |

## Botões e Ações
| Rótulo | Tipo | ID | Ação Prevista |
|---|---|---|---|
| Atualizar | button | `mXGM30` | Atualiza listagem de ordens de tráfego em reserva |

### Botões Ignorados (Auxiliares/Navegação)
- `Sem Rotulo` (a, `mXGMi-btn`) — acionador de consulta do Posto de Serviço
- `Sem Rotulo` (submit, `mXGM60-a`) — submit auxiliar da grid/tabela
