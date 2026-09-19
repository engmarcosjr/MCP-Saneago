# LRSV130 — Equipes

## Informações Gerais
- **Código:** LRSV130
- **Nome:** Equipes
- **Módulo:** Atendimento ao Publico > Cadastro
- **Tecnologia:** misto
- **URL Real:** `https://www.saneago.com.br/prt/lrs/LRS130ManterEquipe.zul`
- **Status:** inventariado
- **Classe Proposta:** `somente_leitura`
- **Motivo:** Tela mista de consulta e listagem de equipes por distrito, situação e tipo com botões Consultar e Cancelar.

## Entradas Identificadas
| Rótulo | Tipo | Editável | ID / Nome |
|---|---|---|---|
| Distrito | text | Sim | `g1DVp` |
| Distrito | text | Não (readonly) | `g1DVr-real` |
| Situação | checkbox | Sim | `g1DVb0-real` |
| Ativa | checkbox | Sim | `g1DVc0-real` |
| Saneago | radio | Sim | `g1DVi0-real` |
| Subdelegada | radio | Sim | `g1DVj0-real` |
| Terceirizada | radio | Sim | `g1DVk0-real` |
| Todos | radio | Sim | `g1DVl0-real` |
| Código da Equipe | text | Sim | `g1DVr0` |
| Tipo de equipe | combobox | Não (readonly) | `g1DVb2-real` |

## Botões e Ações
| Rótulo | Tipo | ID | Ação Prevista |
|---|---|---|---|
| Consultar | button | `g1DVg2` | Consulta e lista as equipes conforme filtros informados |
| Cancelar | button | `g1DVk2` | Cancela e limpa os campos de pesquisa |

### Elementos Auxiliares Ignorados
- `Sem Rotulo` (id: `g1DVr-btn`, tipo: `a`) — botão auxiliar de lookup do campo Distrito.
- `Sem Rotulo` (id: `g1DVb2-btn`, tipo: `a`) — abridor de combobox do campo Tipo de equipe.

## Colunas da Grade
- Código da Equipe
- Nome do Responsável
- Tipo de Equipe
- Equipe
