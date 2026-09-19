# PGTV500 — Nova Ordem de Tráfego

## Informações Gerais
- **Código:** PGTV500
- **Nome:** Nova Ordem de Tráfego
- **Módulo:** Gestão Transporte > Ordem Tráfego
- **Tecnologia:** misto
- **URL Real:** `https://www.saneago.com.br/prt/pgt/PGT500CadastroOrdemTrafego.zul`
- **Status:** inventariado
- **Classe Proposta:** `possui_escrita`
- **Motivo:** Tela de cadastro de nova Ordem de Tráfego com campos editáveis e botão Enviar.

## Entradas Identificadas
| Rótulo | Tipo | Editável | ID / Nome |
|---|---|---|---|
| Data/Hora | date | Não | `s2bMu-real` |
| Data/Hora | text | Não | `s2bMw-real` |
| Solicitante | text | Não | `s2bM46` |
| Solicitante | text | Não | `s2bM20-real` |
| Posto de Serviço | combobox | Sim | `s2bMn0-real` |
| Embarque | text | Sim | `s2bMs0` |
| Embarque | textarea | Sim | `s2bM91` |
| Embarque | textarea | Sim | `s2bMq1` |
| Data/Hora Início | date | Não | `s2bM72-real` |
| Data/Hora Início | text | Sim | `s2bM82-real` |
| Data/Hora Término | date | Não | `s2bMh2-real` |
| Data/Hora Término | text | Sim | `s2bMi2-real` |
| Matrícula | text | Não | `s2bM36` |
| Matrícula | text | Não | `s2bMz2-real` |
| Telefone | text | Sim | `s2bMm3` |
| Ramal | text | Sim | `s2bMo3` |
| Sim | radio | Sim | `s2bM34-real` (`_pgfd3hhm1`) |
| Não | radio | Sim | `s2bM44-real` (`_pgfd3hhm1`) |
| Sim | radio | Sim | `s2bM94-real` (`_pgg6s1tg1`) |
| Não | radio | Sim | `s2bMa4-real` (`_pgg6s1tg1`) |
| Sim | radio | Sim | `s2bMf4-real` (`_pgln4svq1`) |
| Não | radio | Sim | `s2bMg4-real` (`_pgln4svq1`) |

## Botões e Ações
| Rótulo | Tipo | ID | Ação Prevista |
|---|---|---|---|
| Limpar | button | `s2bMr5` | Limpa os dados do formulário |
| Enviar | button | `s2bMs5` | Grava e envia a nova ordem de tráfego |

### Botões Ignorados (Auxiliares/Navegação)
- `Sem Rotulo` (a, `s2bMn0-btn`) — acionador do combobox Posto de Serviço
- `Sem Rotulo` (a, `s2bM72-btn`) — acionador do datebox Data/Hora Início
- `Sem Rotulo` (a, `s2bMh2-btn`) — acionador do datebox Data/Hora Término

