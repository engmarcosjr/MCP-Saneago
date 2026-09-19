# HVWV009 - Conta

## Categoria
Prestação de Contas e Viagens

## Tipo
Leitura e Consulta (zk)

## O que faz
Permite consultar e conferir a prestação de contas de viagens a serviço, detalhando informações da solicitação, empregado, despesas calculadas e realizadas com hospedagem, refeição, diárias, adiantamento, cartões e glosas.

## URL Real / Atalho Direto
- `https://www.saneago.com.br/prt/hvw/HVW009PrestarContas.zul`

## Campos e Filtros da Tela
- **Nº Solicitação** (`text` / editável): Número da solicitação de viagem para consulta.
- **Tipo Empregado** (`text` / readonly): Tipo de vínculo do empregado.
- **Empregado** (`text` / editável): Matrícula do empregado.
- **Empregado** (`text` / readonly): Nome do empregado.
- **U.O. Lotação** (`text` / readonly): Código da unidade de lotação do empregado.
- **U.O. Lotação** (`text` / readonly): Nome da unidade de lotação do empregado.
- **Motivo Viagem** (`text` / readonly): Motivo ou finalidade da viagem realizada.
- **Nº Programação** (`text` / readonly): Número da programação de viagem vinculada.
- **Data prevista de saída** (`date` / readonly): Data prevista para início da viagem.
- **Data prevista de chegada** (`date` / readonly): Data prevista para retorno da viagem.
- **Valor Total Despesas** (`text` / readonly): Somatório total de despesas da viagem.
- **Tipo** (`text` / readonly): Tipo de prestação de contas.
- **Valor Outras Despesas** (`text` / readonly): Valor apurado de outras despesas da viagem.
- **Valor Total Desp. Hospedagem** (`text` / readonly): Total gasto com hospedagem.
- **Valor Total Desp. Refeição** (`text` / readonly): Total gasto com alimentação e refeições.
- **Data de saída** (`date` / readonly): Data efetiva de saída da viagem.
- **Data de chegada** (`date` / readonly): Data efetiva de chegada da viagem.
- **Valor de diárias calculadas** (`text` / readonly): Valor total calculado para diárias.
- **Valor de diárias realizadas** (`text` / readonly): Valor total de diárias efetivamente realizadas.
- **Valor diárias cartão** (`text` / readonly): Valor de diárias pagas com cartão corporativo.
- **Valor de Hospedagem calculado** (`text` / readonly): Valor previsto/calculado para hospedagem.
- **Valor de Hospedagem realizado** (`text` / readonly): Valor efetivamente gasto com hospedagem.
- **Valor de Refeição calculado** (`text` / readonly): Valor previsto/calculado para refeição.
- **Valor de Refeição realizado** (`text` / readonly): Valor efetivamente gasto com refeição.
- **Valor outras despesas cartão** (`text` / readonly): Outras despesas lançadas no cartão corporativo.
- **Valor Saque** (`text` / readonly): Valor total sacado para despesas de viagem.
- **Valor diárias reembolso** (`text` / readonly): Valor de diárias a reembolsar ao empregado.
- **Valor outras despesas reembolso** (`text` / readonly): Valor de outras despesas a reembolsar.
- **Valor glosado no cartão** (`text` / readonly): Valor glosado nas despesas com cartão corporativo.
- **Valor glosado no reembolso** (`text` / readonly): Valor glosado nos itens de reembolso.
- **Valor outras despesas adiantamento** (`text` / readonly): Outras despesas deduzidas do adiantamento.
- **Valor Diarias no Adiantamento** (`text` / readonly): Diárias pagas antecipadamente por adiantamento.
- **Valor glosado no Adiantamento** (`text` / readonly): Valor glosado sobre o adiantamento recebido.
- **Valor a receber** (`text` / readonly): Saldo final líquido a receber pelo empregado.
- **Valor a recolher** (`text` / readonly): Saldo final líquido a recolher/devolver à Saneago.
- **Acerto final** (`text` / readonly): Status ou valor do acerto de contas final.
- **Atividades realizadas** (`textarea` / editável): Relatório descritivo das atividades desempenhadas durante a viagem.
- **Status da viagem** (`text` / readonly): Situação atual da viagem.
- **Data da prestação** (`date` / readonly): Data de registro da prestação de contas.
- **Matrícula da prestação** (`text` / readonly): Matrícula do responsável pelo registro da prestação.
- **Situação da prestação** (`text` / readonly): Situação atual do processo de prestação de contas.

## Botões Disponíveis
- **Consultar**: Executa a busca da prestação de contas pelo número da solicitação ou empregado.
- **Cancelar**: Cancela a operação e limpa os campos da tela.

## Colunas do Resultado
Nenhuma coluna em grade detectada na tela inicial.

## Perguntas que Responde
- "consultar prestação de contas de viagem no HVWV009"
- "verificar valores de diárias, adiantamento e reembolso de viagem"
- "consultar saldo a receber ou a recolher de viagem a serviço"

## Status de Acesso
- **Acesso Confirmado**: Sim (perfil atual possui acesso e visualização da tela via menu Controle de Viagens -> Prestação -> Conta).

---
*Documento inventariado com evidência de tela em 19/09/2026 (Status: inventariado).*
