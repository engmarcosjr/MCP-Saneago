# LRSV735 — RA-RI por Cidade e Bairro

## Informações Gerais
- **Código:** LRSV735
- **Nome:** RA-RI por Cidade e Bairro
- **Módulo:** Atendimento ao Publico > Relatório
- **Tecnologia:** JSP / HTML legado
- **URL Real:** `https://www.saneago.com.br/prt/lrs/LRS735relRACidBai.jsp`
- **Status:** inventariado
- **Classe Proposta:** `somente_leitura`
- **Motivo:** Tela JSP legada de relatório de RA/RI por cidade, bairro e período, sem botões de escrita identificados na carga inicial.

## Campos Mapeados
| Rótulo | ID / Name | Tipo | Editável | Observação |
|---|---|---|---|---|
| Periodo | dataInicio | text | Sim | Período inicial (maxlength 10) |
| Periodo | dataFim | text | Sim | Período final (maxlength 10) |
| Cidade | codigoCidade | text | Sim | Código da cidade (maxlength 7) |
| Cidade | nomeCidade | text | Não | Nome da cidade (maxlength 40) |
| Serviço | codigoServico | text | Sim | Código do serviço (maxlength 7) |
| Serviço | descricaoServico | text | Não | Descrição do serviço (maxlength 40) |
| Tipo | tipo | text | Não | Tipo (maxlength 7) |

## Botões Mapeados
Nenhum botão de ação identificado na carga inicial.

## Botões Ignorados
Nenhum.
