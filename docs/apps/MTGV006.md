# MTGV006 - Andamento Geral

## Categoria
Financeiro, Tesouraria e Remessas

## Tipo
Leitura e Consulta (zk)

## O que faz
Permite consultar e emitir relatórios sobre o andamento geral da transmissão e processamento de arquivos de leitura, faturamento, contas retidas e entregas alternativas por referência, grupo e distrito.

## URL Real / Atalho Direto
- `https://www.saneago.com.br/prt/mtg/MTG006AndamentoGeral.zul`

## Campos e Filtros da Tela
- **Leitura** (`radio` / editável): Tipo de processamento Leitura.
- **Retidas** (`radio` / editável): Tipo de processamento Contas Retidas.
- **Entrega Alternativa** (`radio` / editável): Tipo de processamento Entrega Alternativa.
- **Referência** (`date` / editável): Mês e ano de referência no formato MM/AAAA.
- **Grupo** (`text` / editável): Código do grupo de faturamento/leitura.
- **Distrito** (`text` / editável): Código do distrito.
- **Distrito** (`text` / readonly): Descrição do distrito selecionado.
- **Todos** (`radio` / editável): Filtro de situação Todos.
- **Abertos** (`radio` / editável): Filtro de situação Abertos.
- **Fechado** (`radio` / editável): Filtro de situação Fechado.
- **Processando** (`radio` / editável): Filtro de situação Processando.
- **Processado** (`radio` / editável): Filtro de situação Processado.
- **Atrasados** (`radio` / editável): Filtro de situação Atrasados.

## Botões Disponíveis
- **Consultar**: Executa a consulta do andamento com os filtros informados.
- **Imprimir**: Emite relatório impresso do andamento geral.
- **Cancelar**: Limpa os campos da consulta.

### Botões Ignorados
- **Sem Rotulo** (`a` / id `-btn`): Acionadores de abertura de calendário e pesquisa auxiliar.
- **Sem Rotulo** (`submit` / id `-a`): Acionador interno de submissão do formulário ZK.

## Colunas do Resultado
- Código
- Cidade
- Grupo
- Situação
- Data e Hora
- Sequencial
- Contas Retornadas
- Contas Pendentes

## Perguntas que Responde
- "consultar andamento geral de arquivos de leitura no MTGV006"
- "verificar processamento de arquivos por grupo e referência"
- "emitir relatório de contas retidas e andamento de transmissão"

## Status de Acesso
- **Acesso Confirmado**: Sim (perfil atual possui acesso e visualização da tela via menu Transmissao Rec.Arquivos -> Relatório -> Andamento Geral).

---
*Documento inventariado com evidência de tela em 19/09/2026 (Status: inventariado).*
