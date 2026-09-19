# PGTV401 — Cadastro de Motorista

## Informações Gerais
- **Código:** PGTV401
- **Nome:** Cadastro de Motorista
- **Módulo:** Gestão Transporte > Motoristas
- **Tecnologia:** zk
- **URL Real:** `https://www.saneago.com.br/prt/pgt/PGT401CadastroMotorista.zul`
- **Status:** inventariado
- **Classe Proposta:** `possui_escrita`
- **Motivo:** Tela ZK de cadastro de motoristas com campos de identificação, CNH e botão Cancelar.

## Entradas Identificadas
| Rótulo | Tipo | Editável | ID / Nome |
|---|---|---|---|
| Nome | text | Sim | `fJbV19` |
| Nome | text | Não (readonly) | `fJbVj-real` |
| Apelido | text | Sim | `fJbV10` |
| Lotação Atual | text | Não (readonly) | `fJbV29` |
| Lotação Atual | text | Não (readonly) | `fJbV90-real` |
| Tipo | combobox | Sim | `fJbVt0-real` |
| Nr. Registro | text | Não (readonly) | `fJbVm1` |
| UF | combobox | Sim | `fJbVq1-real` |
| Data 1º | date | Sim | `fJbVw1-real` |
| Expedº | date | Sim | `fJbV_2-real` |
| Validade | date | Sim | `fJbV42-real` |
| Categoria | text | Sim | `fJbV82` |

## Botões e Ações
| Rótulo | Tipo | ID | Ação Prevista |
|---|---|---|---|
| Cancelar | button | `fJbV01` | Cancela a operação e limpa a tela |

### Elementos Auxiliares Ignorados
- `Sem Rotulo` (id: `fJbVj-btn`, tipo: `a`) — botão auxiliar de lookup do campo Nome.
- `Sem Rotulo` (id: `fJbVt0-btn`, tipo: `a`) — abridor de combobox do campo Tipo.
- `Sem Rotulo` (id: `fJbVq1-btn`, tipo: `a`) — abridor de combobox do campo UF.
- `Sem Rotulo` (id: `fJbVw1-btn`, tipo: `a`) — botão auxiliar de calendário do campo Data 1º.
- `Sem Rotulo` (id: `fJbV_2-btn`, tipo: `a`) — botão auxiliar de calendário do campo Expedº.
- `Sem Rotulo` (id: `fJbV42-btn`, tipo: `a`) — botão auxiliar de calendário do campo Validade.

## Colunas da Grade
- Veiculo
- Motorista
- CPF
- CNH
- Anexo
