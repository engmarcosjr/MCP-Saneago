# HVWV050 - Prestar Contas Cartão Corporativo

## Categoria
Prestação de Contas e Viagens

## Tipo
Leitura e Consulta (zk)

## O que faz
Permite consultar e acompanhar as prestações de contas de despesas e viagens realizadas com cartão corporativo por número de solicitação ou empregado.

## URL Real / Atalho Direto
- `https://www.saneago.com.br/prt/hvw/HVW050PrestarContasCartao.zul`

## Campos e Filtros da Tela
- **Nº Solicitação** (`text` / editável): Número identificador da solicitação de viagem.
- **Tipo Empregado** (`text` / readonly): Tipo de vínculo do empregado.
- **Empregado** (`text` / editável): Matrícula do empregado.
- **Empregado** (`text` / readonly): Nome do empregado.
- **U.O. Lotação** (`text` / readonly): Código da unidade organizacional de lotação.
- **U.O. Lotação** (`text` / readonly): Descrição da unidade organizacional de lotação.
- **Data prevista de saída** (`date` / readonly): Data prevista para o início da viagem.
- **Data prevista de chegada** (`date` / readonly): Data prevista para o retorno da viagem.
- **Motivo Viagem** (`text` / readonly): Justificativa/motivo informado para a viagem.
- **Viagem via** (`text` / readonly): Meio de transporte/via utilizado na viagem.
- **Tipo** (`text` / readonly): Tipo da viagem.
- **Valor Total Previsto** (`text` / readonly): Valor orçado/previsto total para a viagem.
- **Atividades realizadas** (`textarea` / editável): Descrição das atividades executadas durante a viagem.
- **Status da viagem** (`text` / readonly): Situação atual da viagem.
- **Data da prestação** (`date` / readonly): Data em que a prestação de contas foi registrada.
- **Matrícula da prestação** (`text` / readonly): Matrícula do responsável pelo registro da prestação.
- **Situação da prestação** (`text` / readonly): Status da prestação de contas.

## Botões Disponíveis
- **Consultar**: Executa a consulta das informações de prestação de contas da solicitação informada.
- **Cancelar**: Limpa os campos e filtros da tela.

### Botões Ignorados
- `Sem Rotulo` (a): Botão técnico de busca rápida e seleção de empregado.
- `Sem Rotulo` (submit): Botões técnicos de abas e navegação interna do formulário ZK.

## Colunas do Resultado
- Calculado
- Realizado Cartão
- Realizado Dinheiro
- Limite Ultrapassado
- Cartão
- Dinheiro
- Total / Análise

## Perguntas que Responde
- "consultar prestação de contas de cartão corporativo no HVWV050"
- "verificar despesas e valores realizados no cartão corporativo por solicitação"
- "acompanhar situação de prestação de contas de viagem com cartão"

## Status de Acesso
- **Acesso Confirmado**: Sim (perfil atual possui acesso e visualização da tela via menu do portal).

---
*Documento inventariado com evidência de tela em 19/09/2026 (Status: inventariado).*
