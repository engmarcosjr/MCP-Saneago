# PGTV504 — Registro Offline

## Informações Gerais
- **Código:** PGTV504
- **Nome:** Registro Offline
- **Módulo:** Gestão Transporte > Ordem Tráfego
- **Tecnologia:** zk
- **URL Real:** `https://www.saneago.com.br/prt/pgt/PGT504OrdemTrafegoOff.zul`
- **Status:** inventariado
- **Classe Proposta:** `possui_escrita`
- **Motivo:** Tela de registro offline de ordem de tráfego com campos de formulário e botões Validar.

## Entradas Identificadas
| Rótulo | Tipo | Editável | ID / Nome |
|---|---|---|---|
| Posto Serviço | combobox | Sim | `eKBCe-real` |
| Solicitante | text | Não | `eKBCo` |
| Solicitante | combobox | Sim | `eKBCq-real` |
| Motorista | text | Sim | `eKBCi2` |
| Motorista | text | Não | `eKBC_0-real` |
| Licença | text | Sim | `eKBCm0` |
| Cód. Veículo | text | Sim | `eKBCu0` |
| Placa Veículo | text | Sim | `eKBC11` |

## Botões e Ações
| Rótulo | Tipo | ID | Ação Prevista |
|---|---|---|---|
| Validar | button | `eKBCo0` | Valida dados de solicitante/motorista |
| Validar | button | `eKBCw0` | Valida dados do veículo |
| Validar | button | `eKBC31` | Valida dados da ordem offline |

### Botões Ignorados (Auxiliares/Navegação)
- `Sem Rotulo` (a, `eKBCe-btn`) — acionador do combobox Posto Serviço
- `Sem Rotulo` (a, `eKBCq-btn`) — acionador do combobox Solicitante
- `Sem Rotulo` (a, `eKBC_0-btn`) — acionador de busca do Motorista
