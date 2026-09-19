# GCAV003 - Melhorias Previstas

## Categoria
Controle Atividades / Saneago

## Tipo
Cadastro e Consulta (zk)

## O que faz
Permite consultar e cadastrar solicitações de melhorias previstas por regional, distrito, situação (pendentes, aprovadas, todas) e período de solicitação.

## URL Real / Atalho Direto
- `https://www.saneago.com.br/prt/gca/GCA003SolicitacaoMelhoria.zul`

## Campos e Filtros da Tela
- **Regional** (`text` / readonly): Código da regional.
- **Distrito** (`text` / readonly): Distrito operacional.
- **Pendentes** (`radio` / editável): Filtro de solicitações pendentes.
- **Aprovadas** (`radio` / editável): Filtro de solicitações aprovadas.
- **Todas** (`radio` / editável): Filtro de todas as solicitações.
- **Período Solicitação** (`date` / editável): Data inicial do período de solicitação.
- **a** (`date` / editável): Data final do período de solicitação.

## Botões Disponíveis
- **Consultar**: Executa a consulta das solicitações conforme filtros.
- **Nova Solicitação**: Abre formulário para inclusão de nova solicitação de melhoria.
- **Limpar**: Limpa os campos e filtros da tela.

## Colunas do Resultado
- Num. Solicit.
- Cód. Distrito
- Distrito
- Valor
- Status
- Dt Cadastro
- Usu. Cadastro
- Dt Aprovação
- Usu. Aprovação
- Descrição

## Perguntas que Responde
- "consultar melhorias previstas no GCAV003"
- "pesquisar solicitações de melhoria por período ou status"
- "cadastrar nova solicitação de melhoria prevista"

## Status de Acesso
- **Acesso Confirmado**: Sim (perfil atual possui acesso e visualização da tela).

---
*Documento inventariado com evidência de tela em 19/09/2026 (Status: inventariado).*
