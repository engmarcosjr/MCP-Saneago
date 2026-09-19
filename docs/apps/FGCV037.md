# FGCV037 - Contratos por UO, Cidade, Forn. e Gestor

## Categoria
Gestão de Contratos e Suprimentos

## Tipo
Leitura e Consulta (zk)

## O que faz
Permite consultar a relação de contratos por Unidade Organizacional, cidade, fornecedor, gestor, categoria, modalidade, natureza de despesa, período e situação no sistema de Gestão de Contratos.

## URL Real / Atalho Direto
- `https://www.saneago.com.br/prt/fgc/FGC037RelacaoContratos.zul`

## Campos e Filtros da Tela
- **Unidade Organizacional** (`text` / readonly): Código da Unidade Organizacional.
- **Unidade Organizacional** (`text` / readonly): Descrição da Unidade Organizacional.
- **Cidade** (`text` / editável): Código da cidade.
- **Cidade** (`text` / readonly): Nome da cidade.
- **Fornecedor** (`text` / editável): Código do fornecedor.
- **Fornecedor** (`text` / readonly): Razão social ou nome do fornecedor.
- **Gestor** (`text` / editável): Matrícula ou código do gestor do contrato.
- **Gestor** (`text` / readonly): Nome do gestor do contrato.
- **Categoria de contrato** (`combobox` / readonly): Seleção de categoria do contrato.
- **Modalidade da Licitação** (`combobox` / readonly): Seleção da modalidade de licitação.
- **Natureza de despesa** (`combobox` / readonly): Seleção da natureza de despesa.
- **Período de assinatura** (`date` / editável): Data inicial do período de assinatura do contrato.
- **a** (`date` / editável): Data final do período de assinatura do contrato.
- **Período de Registro** (`date` / editável): Data inicial do período de registro do contrato.
- **a** (`date` / editável): Data final do período de registro do contrato.
- **Situação Contrato** (`checkbox` / editável): Filtro por situação do contrato.
- **Execução** (`checkbox` / editável): Filtro por contratos em execução.
- **Paralisados** (`checkbox` / editável): Filtro por contratos paralisados.
- **Contingenciados** (`checkbox` / editável): Filtro por contratos contingenciados.
- **Rescindidos** (`checkbox` / editável): Filtro por contratos rescindidos.
- **Ordenar contratos por** (`combobox` / readonly): Primeiro critério de ordenação de contratos.
- **e** (`combobox` / readonly): Segundo critério de ordenação.
- **e** (`combobox` / readonly): Terceiro critério de ordenação.

## Botões Disponíveis
- **Consultar**: Executa a consulta e gera a relação de contratos com os filtros selecionados.
- **Cancelar**: Limpa os campos e filtros da consulta.

### Botões Ignorados
- **Sem Rotulo**: Botões seletores de combobox, datepicker e buscas auxiliares (não acionáveis diretamente).

## Colunas do Resultado
- Ordem
- U.O.
- Contrato
- Processo
- Fornecedores
- Descrição Objeto
- Assinatura
- Encerramento
- Modalidade
- Nat. Desp.
- Situação
- Gestor
- Valor Atualizado
- Valor Faturado
- Valor Acréscimo
- Valor Glosa
- Saldo Contrato

## Perguntas que Responde
- "consultar contratos por unidade organizacional no FGCV037"
- "pesquisar relação de contratos por fornecedor ou gestor"
- "listar contratos por cidade e período de assinatura no sistema de contratos"

## Status de Acesso
- **Acesso Confirmado**: Sim (perfil atual possui acesso e visualização da tela via menu Gestão Contratos -> Consulta -> Contratos por UO, Cidade, Forn. e Gestor).

---
*Documento inventariado com evidência de tela em 19/09/2026 (Status: inventariado).*
