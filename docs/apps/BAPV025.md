# BAPV025 - Agendamento/Alteração de Férias

## Categoria
Recursos Humanos e Pessoal

## Tipo
Cadastro e Movimentação (zk)

## O que faz
Permite consultar, agendar e solicitar alteração de férias de empregados, visualizando períodos aquisitivos, concessivos, saldo de férias e parcelamento.

## URL Real / Atalho Direto
- `https://www.saneago.com.br/prt/bap/BAP025SolicitaFerias.zul`

## Campos e Filtros da Tela
- **Empregado** (`text` / editável): Matrícula do empregado.
- **Empregado** (`text` / readonly): Nome do empregado.
- **Período Aquisitivo** (`combobox` / readonly): Seleção do período aquisitivo de férias.
- **Período Aquisitivo** (`date` / readonly): Data inicial do período aquisitivo.
- **A** (`date` / readonly): Data final do período aquisitivo.
- **Data de Admissão** (`date` / readonly): Data de admissão do empregado.
- **Período Concessivo** (`date` / readonly): Data inicial do período concessivo.
- **A** (`date` / readonly): Data final do período concessivo.
- **Qtd. dias de direito** (`text` / readonly): Quantidade total de dias de direito a férias.
- **Qtd. dias falta** (`text` / readonly): Quantidade de faltas computadas no período.
- **Qtd. dias Lic. Médica** (`text` / readonly): Quantidade de dias de licença médica.
- **Qtd. dias Lic. Remunerada** (`text` / readonly): Quantidade de dias de licença remunerada.
- **Qtd. meses Lic. Não Remunerada** (`text` / readonly): Quantidade de meses de licença não remunerada.
- **Inconsistência** (`textarea` / readonly): Mensagens de inconsistência de férias.
- **Dt. Últ. Atualização** (`date` / readonly): Data da última atualização cadastral.
- **Dt. Últ. Atualização** (`checkbox` / readonly): Flag de controle da última atualização.
- **Saldo de Férias** (`text` / readonly): Saldo de dias de férias disponíveis.
- **Saldo de Férias** (`checkbox` / readonly): Flag de controle de saldo.
- **Parcela única** (`date` / readonly): Data inicial de fruição da parcela única/férias.
- **A** (`date` / readonly): Data final de fruição da parcela única/férias.
- **Quantidade de dias** (`text` / readonly): Quantidade de dias de férias solicitados.
- **Observações** (`textarea` / readonly): Observações gerais sobre o agendamento de férias.

## Botões Disponíveis
Nenhum botão nomeado de ação visível na tela inicial antes de selecionar empregado.

### Botões Ignorados
- **Sem Rotulo** (`a` / id `-btn`): Abridores de busca de empregado, combobox de período aquisitivo e seletores de data.
- **Sem Rotulo** (`button` / id `kJoU03`): Botão técnico de controle ZK sem rótulo visível.

## Colunas e Grade de Resultados
Nenhuma grade de resultados visível na tela inicial antes da seleção de empregado.

## Perguntas que Responde
- "consultar agendamento de férias no BAPV025"
- "ver saldo e períodos aquisitivos de férias"
- "solicitar alteração de férias do empregado"

## Status de Acesso
- **Acesso Confirmado**: Sim (perfil atual possui acesso e visualização da tela via menu Administração Pessoal -> Cadastro -> Agendamento/Alteração de Férias).

---
*Documento inventariado com evidência de tela em 19/09/2026 (Status: inventariado).*
