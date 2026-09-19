# LENV145 - Interrupção de Energia

## Categoria
Gestão Energética / Cadastro

## Tipo
Leitura e Consulta (zk)

## O que faz
Permite consultar interrupções no fornecimento de energia elétrica e histórico de ocorrências por cidade, conta de energia ou protocolo CELG/CHESP.

## URL Real / Atalho Direto
- `https://www.saneago.com.br/prt/len/LEN145CadastroInterrupcaoEnergia.zul`

## Campos e Filtros da Tela
- **Cidade** (`text` / editável): Código e descrição da cidade.
- **Conta de Energia** (`text` / editável): Código e descrição da conta de energia elétrica.
- **Protocolo CELG/CHESP** (`text` / editável): Número de protocolo na concessionária de energia.
- **Unidade Operacional** (`text` / readonly): Código e nome da unidade operacional (UO).
- **Data / Hora Inicial** (`date` / editável): Data e hora inicial da ocorrência de interrupção.
- **Data / Hora Final** (`date` / readonly): Data e hora final da interrupção de energia.
- **Tipo de Impacto** (`combobox` / readonly): Classificação do impacto da interrupção na operação.
- **Vazão da UO (l/s)** (`text` / readonly): Vazão operacional da unidade em litros por segundo.
- **Observação** (`text` / readonly): Observações e detalhes complementares sobre o evento.
- **Matrícula** (`text` / readonly): Matrícula e nome do responsável pelo registro.
- **Data Inclusão** (`text` / readonly): Data de inclusão do registro no sistema com opção de filtro.

## Botões Disponíveis
- **Consultar**: Realiza a pesquisa das interrupções de energia conforme os filtros informados.
- **Cancelar**: Limpa os campos da tela e reinicia os filtros de consulta.

### Botões Ignorados
- **Sem Rotulo** (`a` / id `-btn`): Acionadores auxiliares de busca/combobox/calendário pareados aos campos de entrada.

## Colunas do Resultado
Nenhuma coluna identificada na tela inicial.

## Perguntas que Responde
- "consultar interrupções de energia elétrica no LENV145"
- "pesquisar ocorrências de falta de energia por cidade ou conta"
- "verificar protocolos de atendimento CELG/CHESP e impactos operacionais"

## Status de Acesso
- **Acesso Confirmado**: Sim (perfil atual possui acesso e visualização da tela via menu Gestão Energética -> Cadastro -> Interrupção de Energia).

---
*Documento inventariado com evidência de tela em 19/09/2026 (Status: inventariado).*
