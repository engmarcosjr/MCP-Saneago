# PGTV301 — Cadastro de Veículo

## Informações Gerais
- **Código:** PGTV301
- **Nome:** Cadastro de Veículo
- **Módulo:** Gestão Transporte > Veículos
- **Tecnologia:** zk
- **URL Real:** `https://www.saneago.com.br/prt/pgt/PGT301Veiculo.zul`
- **Status:** inventariado
- **Classe Proposta:** `possui_escrita`
- **Motivo:** Tela ZK de cadastro e gestão de veículos com múltiplos campos cadastrais, botões Ver, Consultar e Cancelar.

## Entradas Identificadas
| Rótulo | Tipo | Editável | ID / Nome |
|---|---|---|---|
| Nº Contrato | text | Sim | `aIiRp` |
| Ano | text | Sim | `aIiRr` |
| Descrição Contrato | textarea | Não (readonly) | `aIiRx` |
| Data Cadastro | date | Sim | `aIiR10-real` |
| Categoria | combobox | Não (readonly) | `aIiR60-real` |
| Detalhe Categoria | combobox | Não (readonly) | `aIiRb0-real` |
| Marca | combobox | Não (readonly) | `aIiRg0-real` |
| Modelo | combobox | Não (readonly) | `aIiRl0-real` |
| Combustivel | combobox | Não (readonly) | `aIiRq0-real` |
| Cor | combobox | Não (readonly) | `aIiRv0-real` |
| Numero Chassi | text | Sim | `aIiR_1` |
| Ano Fabricação | text | Sim | `aIiR41` |
| Ano Modelo | text | Sim | `aIiR91` |
| RENAVAN | text | Sim | `aIiRe1` |
| Número Motor | text | Sim | `aIiRo1` |
| Capacidade | text | Sim | `aIiRt1` |
| Unidade Capacidade | combobox | Não (readonly) | `aIiRy1-real` |
| Consumo min. | text | Sim | `aIiR32` |
| Consumo Max. | text | Sim | `aIiR52` |
| Placa | text | Sim | `aIiRa2` |
| Data Emplacamento | date | Sim | `aIiRf2-real` |
| Lotação Atual | text | Sim | `aIiRrh` |
| Lotação Atual | text | Não (readonly) | `aIiRn2-real` |
| Lotação Origem | text | Sim | `aIiRsh` |
| Lotação Origem | text | Não (readonly) | `aIiR93-real` |
| Posto de Serviço | text | Sim | `aIiRth` |
| Posto de Serviço | text | Não (readonly) | `aIiRw3-real` |
| Nome Proprietário | text | Sim | `aIiRf4` |
| Licença | text | Sim | `aIiRk4` |
| Situação | combobox | Não (readonly) | `aIiRp4-real` |
| Status | combobox | Não (readonly) | `aIiRu4-real` |
| Código Patrimônio | text | Sim | `aIiRuh` |
| Código Patrimônio | text | Não (readonly) | `aIiR15-real` |
| Código Patrimônio SAP | text | Sim | `aIiRl5` |
| Modelo | text | Sim | `aIiR56` |
| Modelo | text | Não (readonly) | `aIiR76-real` |
| Quantidade | text | Sim | `aIiRe7` |
| Modelo | text | Sim | `aIiRy7` |
| Modelo | text | Não (readonly) | `aIiR_8-real` |
| Quantidade | text | Sim | `aIiR69` |

## Botões e Ações
| Rótulo | Tipo | ID | Ação Prevista |
|---|---|---|---|
| Ver | button | `aIiRs` | Visualiza detalhes do contrato do veículo |
| Consultar | button | `aIiRdh` | Consulta os veículos cadastrados |
| Cancelar | button | `aIiRhh` | Cancela a operação e limpa a tela |

### Elementos Auxiliares Ignorados
- `Sem Rotulo` (id: `aIiR10-btn`, tipo: `a`) — botão auxiliar de calendário do campo Data Cadastro.
- `Sem Rotulo` (id: `aIiR60-btn`, tipo: `a`) — abridor de combobox do campo Categoria.
- `Sem Rotulo` (id: `aIiRb0-btn`, tipo: `a`) — abridor de combobox do campo Detalhe Categoria.
- `Sem Rotulo` (id: `aIiRg0-btn`, tipo: `a`) — abridor de combobox do campo Marca.
- `Sem Rotulo` (id: `aIiRl0-btn`, tipo: `a`) — abridor de combobox do campo Modelo.
- `Sem Rotulo` (id: `aIiRq0-btn`, tipo: `a`) — abridor de combobox do campo Combustivel.
- `Sem Rotulo` (id: `aIiRv0-btn`, tipo: `a`) — abridor de combobox do campo Cor.
- `Sem Rotulo` (id: `aIiRy1-btn`, tipo: `a`) — abridor de combobox do campo Unidade Capacidade.
- `Sem Rotulo` (id: `aIiRf2-btn`, tipo: `a`) — botão auxiliar de calendário do campo Data Emplacamento.
- `Sem Rotulo` (id: `aIiRn2-btn`, tipo: `a`) — botão auxiliar de lookup do campo Lotação Atual.
- `Sem Rotulo` (id: `aIiR93-btn`, tipo: `a`) — botão auxiliar de lookup do campo Lotação Origem.
- `Sem Rotulo` (id: `aIiRw3-btn`, tipo: `a`) — botão auxiliar de lookup do campo Posto de Serviço.
- `Sem Rotulo` (id: `aIiRp4-btn`, tipo: `a`) — abridor de combobox do campo Situação.
- `Sem Rotulo` (id: `aIiRu4-btn`, tipo: `a`) — abridor de combobox do campo Status.
- `Sem Rotulo` (id: `aIiR15-btn`, tipo: `a`) — botão auxiliar de lookup do campo Código Patrimônio.
- `Sem Rotulo` (id: `aIiR76-btn`, tipo: `a`) — botão auxiliar de lookup do campo Modelo.
- `Sem Rotulo` (id: `aIiR_8-btn`, tipo: `a`) — botão auxiliar de lookup do campo Modelo.

## Colunas da Grade
- Nenhuma coluna tabular identificada na tela inicial.
