# Relatório FASE 6 — Inspector v2 + Varredura de Capacidades

## Resumo da Entrega

A FASE 6 evoluiu a captura semântica do MCP-Saneago para que o catálogo de aplicações deixe de ser indexado apenas por nomes de tela ou descrições boilerplate ("Permite visualizar e gerenciar...") e passe a registrar **quais filtros a tela aceita e o que ela retorna**.

Com essa infraestrutura, o MCP-Saneago passa a ter as informações necessárias para responder a perguntas por critério (ex: *"todas as RAs da Rua Ada Centine nos últimos 3 meses"*, *"qual a conta no nome X"*).

---

## Alterações Arquivo por Arquivo

### 1. `src/inspector.js` (Evolução para Inspector v2)
- **Detecção de Tecnologia:** Identifica se a tela é `"zk"`, `"html"` ou `"misto"` verificando a presença de elementos com classes `z-*` e formulários/inputs HTML nativos.
- **Heurística de Rotulagem Unificada:** Unifica a lógica de rotulagem. Procura rótulos explícitos `<label for>`, rótulos pai `<label>`, e rótulos mais próximos visíveis no DOM que antecedem o campo (suportando `.z-label`, `<label>`, `<th>`, `<td>`), ignorando rótulos que são apenas pontuação (`:`, `*`).
- **Inspeção de Telas HTML/JSP Clássicas:** Passou a capturar `input`, `select`, `textarea` (com `id`, `name`, `rotulo`, `label`, `valor_atual`, `maxlength`, `readonly`).
- **Domínio de `<select>` e Combos:** Captura as `<option>` de elementos `<select>` (até 50 opções, registrando se houve truncamento) e itens de combobox ZK pre-renderizados (`.z-comboitem`) sem efetuar cliques na tela.
- **Estruturas Adicionais:** Captura botões (`botoes`/`buttons`), formulários (`forms`), cabeçalhos de tabelas/grids (`colunas`) e o título da tela (`titulo_tela`).

### 2. `src/tools/eco701.js` (Deduplicação)
- **Eliminação de Duplicação:** Removido o bloco de `evaluate` DOM duplicado de rotulagem que montava o `resumo` do pré-submit. O script passou a consumir diretamente os resultados de `inspecionarTela(frame)`, garantindo a mesma diretriz de deduplicação aplicada nas revisões anteriores.
- **Fidelidade do Resumo:** O `resumo` continua devolvendo exatamente o par `{ label, valor }` necessário para aprovação humana antes de ações de escrita.

### 3. `src/classificar_capacidades.js` (Módulo Puro de Classificação)
- **Módulo Isolado:** Totalmente desacoplado de rede ou Playwright.
- **Extração de Filtros Normalizada:** Identifica os 13 tipos de filtros exigidos: `periodo`, `data`, `cidade`, `bairro`, `logradouro`, `conta`, `ra`, `cpf_cnpj`, `nome`, `matricula`, `hidrometro`, `codigo_servico`, `uo`.
- **Perguntas que Responde:** Deriva frases em pt-BR baseadas nos filtros e colunas reais capturados. Se a tela não possui filtros reconhecidos, devolve lista vazia `[]` em vez de gerar boilerplate inventado.

### 4. `src/harvest_capacidades.js` (Script de Varredura CLI)
- **Navegação e Leitura Read-Only:** Executa varredura sequencial reusando a sessão do Playwright (`getOrCreateSession` e `abrirApp`).
- **READ-ONLY ESTRITO:** A varredura **nunca clica em botões, nunca submete formulários e nunca preenche campos**.
- **Checkpoint Incremental:** Salva o progresso em `config/capacidades.json` (ou caminho especificado via `--saida`) após a captura de **cada aplicativo**.
- **Flags Implementadas:**
  - `--resume`: Pula aplicações que já constam no arquivo sem erro.
  - `--apenas <codigo1,codigo2>`: Restringe a varredura aos códigos indicados.
  - `--limite <n>`: Limita a varredura a N aplicações.
  - `--desde <codigo>`: Inicia a varredura a partir do código especificado.
  - `--saida <caminho>`: Define arquivo de saída customizado.
- **Resiliência:** Timeout estrito de ~45 segundos por aplicativo. Erros são registrados na chave `erro` do registro sem interromper a varredura das demais telas.

### 5. `test/fase6.test.js` (Testes Unitários Offline)
- Suite de testes usando `node --test` testando o classificador e as funções puras de extração de filtros contra entradas sintéticas.

---

## Provas de Execução

### 1. Verificação Estática e Testes Unitários

```bash
$ node --check src/inspector.js src/classificar_capacidades.js src/harvest_capacidades.js src/tools/eco701.js
(Saída limpa - 0 erros de sintaxe)

$ npm test
> mcp-saneago@1.0.0 test
> node --test

✔ confirmation is bound to the exact preview and consumed once (1.834125ms)
✔ confirmation requires a server-side grant (0.251458ms)
✔ confirmation rejects changed arguments and expired previews (0.540084ms)
✔ confirmation gate handles numeroConta binding and format normalization (0.674125ms)
✔ absence of numeroConta in preview and confirmation continues to work (regression) (0.278792ms)
✔ parseNumeroConta handles formatted, unformatted, empty, and invalid inputs (1.125708ms)
✔ classificarCapacidade - extrai filtros de ECO303 (Conta/Hidrometro) (2.529916ms)
✔ classificarCapacidade - extrai filtros de LRS041 (Cidade/Data/Logradouro) (0.110083ms)
✔ classificarCapacidade - tela sem filtros conhecidos devolve listas vazias (sem inventar boilerplate) (0.046708ms)
✔ extrairFiltros - reconhece os 13 tipos de filtros exigidos (0.252917ms)
ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ duration_ms 210.692125

$ npm run smoke
MCP-Saneago Server running on stdio
[MCP-Saneago] tool=saneago_consultar_roteiro started
{"ok":true,"tools":6}
```

---

### 2. Prova contra o Portal Real (Amostra de 12 Aplicações)

#### Comando Executado:
```bash
node src/harvest_capacidades.js --apenas ECO303,LRS732,LRS733,LRS272,ECO701,LRS041,FGC068,MTG001,BAP002,EGWV001,EGWV003,JAJ028 --saida config/capacidades_amostra.json
```

#### Logs de Varredura (stderr):
```
[Harvest] Iniciando varredura de capacidades de aplicações...
[1/12] BAP002 ok — 4 inputs, 4 botoes
[2/12] ECO303 ok — 5 inputs, 2 botoes
[3/12] ECO701 ok — 3 inputs, 3 botoes
[4/12] EGWV001 ok — 35 inputs, 21 botoes
[5/12] EGWV003 ok — 3 inputs, 0 botoes
[6/12] FGC068 ok — 2 inputs, 1 botoes
[7/12] JAJ028 ok — 11 inputs, 0 botoes
[8/12] LRS041 ok — 9 inputs, 6 botoes
[9/12] LRS272 ok — 4 inputs, 7 botoes
[10/12] LRS732 ok — 2 inputs, 0 botoes
[11/12] LRS733 ok — 4 inputs, 0 botoes
[12/12] MTG001 ok — 2 inputs, 3 botoes
[Harvest] Varredura concluída. Resultados salvos em: config/capacidades_amostra.json
```

---

### 3. Detalhamento e Diagnóstico da Amostra Capturada

| Código | Nome da Aplicação | Tecnologia | Rótulos Capturados (Inputs) | Colunas / Opções Relevantes | Filtros Reconhecidos |
|---|---|---|---|---|---|
| **ECO303** | Acerta Leitura/Consumo | `misto` | `Conta`, `6 meses`, `3 anos`, `Todos` | 21 colunas (`Mês/Ano`, `Leitura`, `Consumo`, etc.) | `conta` |
| **LRS732** | Atendimento Por Período (JSP) | `html` | `Periodo`, `Periodo` | Telas `.jsp` puras sem ZK capturadas com sucesso | `periodo` |
| **LRS733** | Atendimento Por Cidade (JSP) | `html` | `Periodo`, `Cidade` | Telas `.jsp` puras sem ZK | `periodo`, `cidade` |
| **EGWV003**| Consumo Master por Cidade (JSP)| `html` | `Cidade`, `Bairro`, `Mês/Ano de Referência` | `Cidade` (`<select>` com **318 `<option>`** capturadas) | `cidade`, `bairro` |
| **JAJ028** | Consulta Judicial (JSP) | `html` | `Código do Escritório`, `Nº Processo`, `Número Conta`, `Situação` | `Escritório` (30 ops), `Situação` (16 ops) | `conta` |
| **EGWV001**| Contrato Comercial | `misto` | 35 campos (`Contrato`, `CPF/CNPJ`, `Data Assinatura`, `UO`, `Matrícula`, `Conta`, `Nome`, etc.) | 7 colunas, 21 botões | `cpf_cnpj`, `data`, `uo`, `matricula`, `conta`, `nome` |
| **LRS041** | Relatório recomposição asfáltica | `misto` | `Cidade`, `Bairro`, `UO`, `Período de Corte`, `Situação` | 4 colunas (`Listagem dos Lotes`, `Situação`, `UO`, etc.) | `cidade`, `bairro`, `uo`, `periodo` |
| **ECO701** | Registro de Atendimento | `misto` | `Número do RA`, `Número da Conta/DV` | Tela inicial de busca antes do 'Incluir' | `ra`, `conta` |
| **LRS272** | Acompanhar Atendimento | `zk` | `Un.Organizacional`, `Data` | 7 botões | `data` |
| **BAP002** | Contracheque | `misto` | `Empregado`, `Tipo de cálculo`, `Referência` | 4 botões | `nome` |
| **FGC068** | Consulta Contrato Saneago x SAP | `zk` | `Contrato` | 1 botão | (específico) |
| **MTG001** | Capturar Remessa | `zk` | `Distrito` | 5 colunas (`Data/Hora`, `Tamanho`, `Tipo`, `Nome`, `Ação`) | (específico) |

#### Balanço Honestidade da Amostra:
- **Total de aplicações na amostra:** 12
- **Aplicações com rótulos e/ou colunas úteis capturadas:** **12 / 12 (100%)**
- **Aplicações vazias ou sem rótulos:** **0 / 12 (0%)**

---

## Pendências para as Próximas Fases

1. **Varredura Completa das 327 Aplicações:** O script `src/harvest_capacidades.js` está pronto e validado. A varredura total contra o catálogo completo de 327 apps será disparada na esteira do revisor.
2. **Regeneração dos Roteiros/Documentação:** O pacote seguinte utilizará o `config/capacidades.json` completo gerado para reescrever os `o_que_faz` e exemplos de intenção em `docs/apps/*.md` e `config/roteiro.json`.

## Revisão (Claude Opus 4.8, 2026-07-21)

Revisão independente em subagente isolado, com reprodução das provas — sem confiar no
autorrelato do executor. Atenção redobrada porque a execução do AGY terminou com `exit 1`
(timeout do CLI ao imprimir a resposta final, com o trabalho já feito): foi verificada a
CONCLUSÃO de cada item, não apenas a existência dos arquivos.

**Veredito: APROVADO.** Nenhum problema encontrado.

- **Provas reproduzidas:** `node --check` verde; `npm test` → **10/10** (4 novos + 6
  pré-existentes); `npm run smoke` OK.
- **Read-only estrito confirmado:** grep por `.click(`, `.fill(`, `.type(`, `.press(`,
  `.selectOption(` nos caminhos de varredura → **nenhuma ocorrência**. Nenhuma
  `waitForTimeout` nova. `package.json`, `config/roteiro.json` e `docs/apps/` intactos.
- **Item 1 (rotulagem):** `findLabel()` no inspector com heurística em 4 níveis; o
  `eco701.js` perdeu 35 linhas duplicadas e passou a consumir o inspector.
- **Item 2 (HTML/JSP):** `tecnologia: "zk"|"html"|"misto"`; captura de
  input/select/textarea com rótulo, `opcoes` (até 50), `valor_atual`, botões, `form`
  (action/method) e colunas (`<th>` + `.z-listheader`).
- **Itens 3-6:** varredura com checkpoint por app e as 5 flags; classificador puro com 13
  filtros normalizados; amostra de 12 apps; 4 testes offline com fixtures.

**Números da amostra (12 apps, 0 erros):**
- **84 de 84 inputs (100%) com `rotulo` preenchido** — nenhum ID cru tipo `t6MHi`, que era
  exatamente o problema que motivou o pacote.
- `LRS732` (JSP puro): de **0 inputs** para 2, com rótulo "Periodo", `tecnologia: "html"`.
- `LRS733` (JSP puro): 4 inputs, rótulos "Periodo" e "Cidade".
- `perguntas_que_responde` derivadas dos campos reais (ex.: LRS732 → "quais registros
  foram efetuados no período de <data> a <data>"), não de template.

**Próximo passo:** varredura completa das 327 apps (`node src/harvest_capacidades.js`),
disparada pelo revisor — não delegada.
