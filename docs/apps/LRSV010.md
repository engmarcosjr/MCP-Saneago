# LRSV010 — Distribuição de Serviço

## Informações Gerais
- **Código:** LRSV010
- **Nome:** Distribuição de Serviço
- **Módulo:** Atendimento ao Publico > Cadastro
- **Tecnologia:** misto
- **URL Real:** `https://www.saneago.com.br/prt/lrs/LRS010DistribuicaoServico.zul`
- **Status:** inventariado
- **Classe Proposta:** `possui_escrita`
- **Motivo:** Tela mista de distribuição de serviços com botões de escrita e manipulação de registros (Adicionar, Remover, Incluir, Pesquisar RAs, Consultar, Cancelar).

## Entradas Identificadas
| Rótulo | Tipo | Editável | ID / Nome |
|---|---|---|---|
| Código da DS | text | Sim | `wC8Wp` |
| Un.Organizacional | text | Sim | `wC8Wr7` |
| Un.Organizacional | text | Não (readonly) | `wC8Wz-real` |
| Equipe | text | Sim | `wC8Wk0` |
| Equipe | text | Não (readonly) | `wC8Wl0` |
| Placa da viatura | text | Sim | `wC8W61` |
| Data | date | Sim | `wC8Wt1-real` |
| RAs/Progs | text | Sim | `wC8W_2` |
| / | text | Sim | `wC8W12` |
| Sim | radio | Sim | `wC8Wc2-real` (name: `_pgbhr10h`) |
| Não | radio | Sim | `wC8Wd2-real` (name: `_pgbhr10h`) |

## Botões e Ações
| Rótulo | Tipo | ID | Ação Prevista |
|---|---|---|---|
| Adicionar | button | `wC8W22` | Adiciona serviço ou RA à distribuição da equipe |
| Remover | button | `wC8W32` | Remove serviço ou RA selecionado da distribuição |
| Pesquisar RAs | button | `wC8W42` | Abre pesquisa e seleção de RAs disponíveis |
| Consultar | button | `wC8W93` | Executa consulta da distribuição de serviço |
| Incluir | button | `wC8Wa3` | Grava e inclui a nova distribuição de serviço |
| Cancelar | button | `wC8Wd3` | Cancela a operação e limpa o formulário |

### Elementos Auxiliares Ignorados
- `Sem Rotulo` (id: `wC8Wz-btn`, tipo: `a`) — abridor de lookup Un.Organizacional.
- `Sem Rotulo` (id: `wC8Wm0`, tipo: `button`) — botão auxiliar de seleção de equipe.
- `Sem Rotulo` (id: `wC8W71`, tipo: `button`) — botão auxiliar de seleção de viatura.
- `Sem Rotulo` (id: `wC8Wt1-btn`, tipo: `a`) — abridor de datepicker Data.

## Colunas da Grade
- Equipe
- Nome Responsável
- Tipo Equipe
- Categoria
- Código
- Placa
- Marca
- Modelo
- Prioritário
- RA/Prog
- Endereço
- Serviço
