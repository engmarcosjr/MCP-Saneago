# LRSV034 — Validar Corte de Asfalto

## Informações Gerais
- **Código:** LRSV034
- **Nome:** Validar Corte de Asfalto
- **Módulo:** Atendimento ao Publico > Corte de Asfalto
- **Tecnologia:** misto
- **URL Real:** `https://www.saneago.com.br/prt/lrs/LRS034ValidaRaCorteAsfalto.zul`
- **Status:** inventariado
- **Classe Proposta:** `somente_leitura`
- **Motivo:** Tela mista de consulta e validação de corte de asfalto por distrito com botões Consultar e Cancelar.

## Entradas Identificadas
| Rótulo | Tipo | Editável | ID / Nome |
|---|---|---|---|
| Distrito | text | Sim | `iYkLo` |
| Distrito | text | Não (readonly) | `iYkLq-real` |
| Distrito | checkbox | Não (readonly) | `iYkLo0-real` |

## Botões e Ações
| Rótulo | Tipo | ID | Ação Prevista |
|---|---|---|---|
| Consultar | button | `iYkLc0` | Consulta registros de corte de asfalto para o distrito informado |
| Cancelar | button | `iYkLe0` | Cancela e limpa a tela de consulta |

### Elementos Auxiliares Ignorados
- `Sem Rotulo` (id: `iYkLq-btn`, tipo: `a`) — botão auxiliar de lookup do campo Distrito.
- `Sem Rotulo` (id: `iYkLk0-a`, tipo: `submit`) — elemento de submit oculto/estrutural do formulário misto.

## Colunas da Grade
- Distrito
- Dt. Exec
- RA Corte Asf.
- RA Orig.
- Larg.
- Compr.
- Area
- Bairro
- Logr.
- Qd.
- Lote
- Numero
- E-mail
