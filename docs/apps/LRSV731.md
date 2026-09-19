# LRSV731 — Atendimento P/ Atendente e Período

## Informações Gerais

- **Código:** LRSV731
- **Nome:** Atendimento P/ Atendente e Período
- **Módulo:** Atendimento ao Publico > Relatório
- **Tecnologia:** JSP / HTML legado
- **URL Real:** `https://www.saneago.com.br/prt/lrs/LRS731relAtend.jsp`
- **Status:** inventariado
- **Classe Proposta:** `somente_leitura`
- **Motivo:** Tela JSP legada de relatório de serviços atendidos por atendente (matrícula) e período, sem botões de escrita identificados na carga inicial.

## Campos de Entrada (Filtros de Parâmetros)

| Rótulo / Label | ID | Name | Tipo | Editável | Readonly | Maxlength | Valor Padrão |
|---|---|---|---|---|---|---|---|
| Periodo | `dataInicio` | `dataInicio` | `text` | Sim | Não | 10 | `""` |
| Periodo | `dataFim` | `dataFim` | `text` | Sim | Não | 10 | `""` |
| Matricula | `matriculaOperador` | `matriculaOperador` | `text` | Sim | Não | 7 | `""` |
| Matricula | `nomeOperador` | `nomeOperador` | `text` | Não | Sim | 40 | `""` |

## Botões e Ações

Nenhum botão detectado no DOM inicial.

## Decisões de Mapeamento e Segurança

- **Formulário:** `frmLRS731` (POST).
- **Classificação:** `somente_leitura` para emissão de relatório gerencial de atendimento por atendente.
