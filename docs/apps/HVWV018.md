# HVWV018 - Manter Empregados com Cartão Viagem

## Categoria
Prestação de Contas e Viagens

## Tipo
Consulta e Gestão (zk)

## O que faz
Permite consultar e manter dados de cartões de viagem de empregados, incluindo limites, bancos, justificativas e cancelamentos.

## URL Real / Atalho Direto
- `https://www.saneago.com.br/prt/hvw/HVW018CartaoViagemEmpregado.zul`

## Campos e Filtros da Tela
- **Empregado** (`text` / editável): Matrícula e nome do empregado.
- **Banco** (`combobox` / readonly): Instituição bancária do cartão de viagem.
- **Nº Cartão** (`text` / editável): Número do cartão de viagem do empregado.
- **limite do cartão** (`text` / editável): Valor do limite de crédito do cartão.
- **Justificativa do Cancelamento** (`textarea` / editável): Justificativa para cancelamento do cartão.
- **Data de vencimento** (`date` / editável): Data de vencimento do cartão de viagem.
- **Data cancelamento** (`date` / editável): Data de cancelamento do cartão de viagem.

## Botões Disponíveis
- **Consultar**: Executa a consulta de cartões de viagem do empregado pelos filtros informados.
- **Cancelar**: Cancela a operação e limpa os campos da tela.

### Botões Ignorados
- `Sem Rotulo` (a/submit): Componentes técnicos de seleção de datas, combobox e busca de empregados.

## Colunas do Resultado
- Via
- Cartão
- Justificativa do Cancelamento
- Limite do Cartão
- Data Validade
- Banco
- Bloqueado
- Data Cancelamento
- Responsável

## Perguntas que Responde
- "consultar cartões de viagem do empregado no HVWV018"
- "verificar limites e cancelamento de cartão viagem"

## Status de Acesso
- **Acesso Confirmado**: Sim (perfil atual possui acesso e visualização da tela via menu corporativo).

---
*Documento inventariado com evidência de tela em 19/09/2026 (Status: inventariado).*
