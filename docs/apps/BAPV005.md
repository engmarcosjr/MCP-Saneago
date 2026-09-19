# BAPV005 - Emissão de Frequência

## Categoria
Recursos Humanos e Pessoal

## Tipo
Leitura e Consulta (zk)

## O que faz
Permite emitir e imprimir folhas de frequência e relatórios de acompanhamento de frequência dos empregados por unidade organizacional e mês de referência.

## URL Real / Atalho Direto
- `https://www.saneago.com.br/prt/bap/BAP005EmitirFrequencia.zul`

## Campos e Filtros da Tela
- **Referência** (`date` / readonly): Mês e ano de referência da frequência (ex: setembro/2026).
- **Impressora** (`text` / editável): Código/identificador da impressora.
- **Impressora** (`text` / readonly): Descrição/nome da impressora selecionada.
- **Folha de Frequência** (`radio` / editável): Opção de emissão de Folha de Frequência (valor padrão: 1).
- **Relatório de acompanhamento** (`radio` / editável): Opção de emissão de Relatório de acompanhamento (valor padrão: 2).

## Botões Disponíveis
- **Imprimir**: Executa a emissão/impressão da folha ou relatório de frequência.

### Botões Ignorados
- **Sem Rotulo** (`a` / id `-btn`): Botão de busca/seleção de impressora.
- **Sem Rotulo** (`submit` / id `-a`): Gatilho de submissão/lookup ZK.

## Colunas e Grade de Resultados
- Código
- Unidade Organizacional
- Sigla

## Perguntas que Responde
- "emitir folha de frequência no BAPV005"
- "imprimir relatório de acompanhamento de frequência"
- "consultar frequência por unidade organizacional"

## Status de Acesso
- **Acesso Confirmado**: Sim (perfil atual possui acesso e visualização da tela via menu Administração Pessoal -> Relatório -> Emissão de Frequência).

---
*Documento inventariado com evidência de tela em 19/09/2026 (Status: inventariado).*
