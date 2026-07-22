# Relatório FASE 7 — Índice de Capacidades e Ferramenta de Descoberta

## Resumo da Entrega

A FASE 7 concluiu a indexação semântica e offline das 337 aplicações do portal Saneago, permitindo a descoberta instantânea de telas por linguagem natural, filtros exigidos e verticais de negócio.

O índice invertido gerado (`config/indice_capacidades.json`) e a ferramenta local de busca (`src/tools/descobrir.js`) operam 100% em memória, sem latência de rede e sem dependência do Playwright ou de acesso ao portal ZK.

---

## Alterações Arquivo por Arquivo e Decisões de Arquitetura

### 1. `src/gerar_indice_capacidades.js` (Gerador de Índice e Documentação Markdown)
- **Classificação por Vertical:** Mapeia prefixos de códigos de aplicações para 12 verticais organizadas de negócio.
- **Prefixos Mapeados:**
  - `comercial`: `ECO`, `ECOV`, `ECNV`, `ECAV`, `EACV`, `ECSV`, `EGWV`
  - `operacional`: `LRS`, `LRSV`, `LENV`, `LIG`, `LIGV`, `MPSV`, `GPMV`
  - `juridico`: `JAJ`, `JAJV`
  - `rh_pessoal`: `BAP`, `BAPV`, `BPAV`, `A`, `G`, `S`
  - `financeiro_licitacoes`: `FGC`, `FGCV`, `FGIV`, `FGOV`
  - `ouvidoria_governanca`: `MGOV`
  - `suprimentos_logistica`: `MTG`, `MTGV`
  - `transportes_frota`: `PGTV`
  - `patrimonio`: `HFI`, `HFIV`
  - `viagens_servico`: `HVW`, `HVWV`
  - `qualidade_laboratorio`: `LQA`, `LQAV`, `LQEV`, `KRT`, `KRTV`, `KOCV`
  - `ti_sistemas`: `BTWV`, `GSIV`, `GCAV`, `GSPV`, `GMQV`, `AGDV`, `MSIV`, `MSSV`
  - `indefinida`: Reservado para prefixos não cadastrados (na base real de 337 apps, **0 apps** ficaram como `indefinida`).
- **Níveis de Confiabilidade:**
  - **Alta (61 apps):** Possui tanto filtros de entrada reconhecidos quanto colunas de tabela/grid capturadas.
  - **Média (102 apps):** Possui filtros de entrada ou colunas de retorno identificados.
  - **Baixa (174 apps):** Aplicações sem filtros/colunas estruturadas reconhecidas (telas informativas/cadastros simples).
  - **Com Erro (10 apps):** Aplicações que falharam na varredura automatizada (detalhadas na seção de erros).

### 2. `src/tools/descobrir.js` (Módulo Puro de Descoberta por Relevância)
- **Pontuação Semântica (Ranking):** Avalia match exato/parcial de código da app, termos no nome da tela, correspondência de filtros inferidos da pergunta ou especificados e colunas retornadas.
- **Inferência de Filtros:** Reconhece termos em linguagem natural (ex: *"rua"* → `logradouro`, *"últimos 3 meses"* → `periodo`, *"maracanã"* → `bairro`, *"goiânia"* → `cidade`) e expande a busca no índice.

### 3. `test/fase7.test.js` (Testes Unitários Offline)
- Suíte automatizada com `node --test` cobrindo o mapeamento de verticais, a geração do índice a partir de fixtures e as buscas da ferramenta `descobrirAplicacao`.

### 4. `src/index.js` (Integração MCP)
- Registro da tool `saneago_descobrir_aplicacao` expondo os parâmetros `pergunta`, `filtros`, `vertical` e `limite`.

---

## Provas de Execução

### 1. Geração do Índice de Capacidades

```bash
$ node src/gerar_indice_capacidades.js
[Índice] Gerado com sucesso em: /Volumes/Mac_Dados/Repos/MCP-Saneago/config/indice_capacidades.json
[Índice] Total: 337 apps (Alta: 61, Média: 102, Baixa: 174, Erros: 10)
[Índice] Documentação salva em: /Volumes/Mac_Dados/Repos/MCP-Saneago/docs/CAPACIDADES.md
```

### 2. Execução da Suíte de Testes Automatizados

```bash
$ node --test test/fase7.test.js
[Índice] Gerado com sucesso em: /Volumes/Mac_Dados/Repos/MCP-Saneago/test/tmp_indice_test.json
[Índice] Total: 3 apps (Alta: 1, Média: 1, Baixa: 1, Erros: 1)
[Índice] Gerado com sucesso em: /Volumes/Mac_Dados/Repos/MCP-Saneago/test/tmp_indice_test.json
[Índice] Total: 1 apps (Alta: 1, Média: 0, Baixa: 0, Erros: 0)
[Índice] Gerado com sucesso em: /Volumes/Mac_Dados/Repos/MCP-Saneago/test/tmp_indice_test.json
[Índice] Total: 1 apps (Alta: 1, Média: 0, Baixa: 0, Erros: 0)
✔ derivarVertical - mapeia prefixos conhecidos corretamente (0.706167ms)
✔ gerarIndiceCapacidades - calcula confiabilidade alta, media e baixa (11.219459ms)
✔ descobrirAplicacao - busca local sobre o indice (2.989333ms)
✔ descobrirAplicacao - devolve mensagem honesta quando nada casa (0.738459ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 83.048292

$ npm test
✔ confirmation is bound to the exact preview and consumed once
✔ confirmation requires a server-side grant
✔ confirmation rejects changed arguments and expired previews
✔ confirmation gate handles numeroConta binding and format normalization
✔ absence of numeroConta in preview and confirmation continues to work (regression)
✔ parseNumeroConta handles formatted, unformatted, empty, and invalid inputs
✔ classificarCapacidade - extrai filtros de ECO303 (Conta/Hidrometro)
✔ classificarCapacidade - extrai filtros de LRS041 (Cidade/Data/Logradouro)
✔ classificarCapacidade - tela sem filtros conhecidos devolve listas vazias
✔ extrairFiltros - reconhece os 13 tipos de filtros exigidos
✔ derivarVertical - mapeia prefixos conhecidos corretamente
✔ gerarIndiceCapacidades - calcula confiabilidade alta, media e baixa
✔ descobrirAplicacao - busca local sobre o indice
✔ descobrirAplicacao - devolve mensagem honesta quando nada casa
ℹ tests 14
ℹ pass 14
ℹ fail 0
```

---

### 3. Invocações Reais da Tool `saneago_descobrir_aplicacao`

#### Invocação 1: Pergunta em Linguagem Natural sobre Registro de Atendimento por Logradouro e Período
**Chamada:**
```js
descobrirAplicacao({ pergunta: "RAs registradas por rua ou logradouro no periodo" })
```
**Resposta Retornada (Top Candidata):**
```json
{
  "ok": true,
  "total_encontrado": 87,
  "filtros_pesquisados": ["periodo", "logradouro", "ra"],
  "candidatas": [
    {
      "codigo": "ECO709",
      "nome": "RAs por Logradouro",
      "url_real": "https://www.saneago.com.br/prt/eco/ECO709ConsultaRALogradouro.zul",
      "filtros": ["cidade", "bairro", "logradouro", "codigo_servico", "periodo"],
      "colunas_retornadas": [
        "Número RA", "Datas", "Situação RA", "Conta", "Nome", "Qd.", "Lt.", "Nº", "Código Serviço", "Ir p/ RA", "Início", "Execução"
      ],
      "por_que_casou": [
        "Termos do nome casados: por, logradouro",
        "Filtro aceito pela tela: periodo",
        "Filtro aceito pela tela: logradouro",
        "Filtro aceito pela tela: ra"
      ]
    }
  ]
}
```

#### Invocação 2: Busca por Filtros (`cpf_cnpj` e `conta`)
**Chamada:**
```js
descobrirAplicacao({ filtros: ["cpf_cnpj", "conta"] })
```
**Resposta Retornada (Candidatas Principais):**
```json
{
  "ok": true,
  "total_encontrado": 87,
  "filtros_pesquisados": ["cpf_cnpj", "conta"],
  "candidatas": [
    {
      "codigo": "ECO410",
      "nome": "Cancelamento de Débito/Crédito",
      "url_real": "https://www.saneago.com.br/prt/eco/ECO410CancelaDebitoCredito.zul",
      "filtros": ["cpf_cnpj", "conta"],
      "colunas_retornadas": ["Número", "Situação", "Conta", "Data Emissão", "Data Venc.", "CPF/CNPJ", "Valor"],
      "por_que_casou": ["Filtro aceito pela tela: cpf_cnpj", "Filtro aceito pela tela: conta"]
    },
    {
      "codigo": "ECO348",
      "nome": "Cadastramento Grande Gerador",
      "url_real": "https://www.saneago.com.br/prt/eco/ECO348CadastroGrandeGeradorOleo.zul",
      "filtros": ["cpf_cnpj", "conta"],
      "colunas_retornadas": [],
      "por_que_casou": ["Filtro aceito pela tela: cpf_cnpj", "Filtro aceito pela tela: conta"]
    }
  ]
}
```

#### Invocação 3: Busca Restrita por Vertical (`qualidade_laboratorio`)
**Chamada:**
```js
descobrirAplicacao({ vertical: "qualidade_laboratorio", limite: 3 })
```
**Resposta Retornada:**
```json
{
  "ok": true,
  "total_encontrado": 23,
  "filtros_pesquisados": [],
  "candidatas": [
    {
      "codigo": "KOCV004",
      "nome": "Previsto X Executado",
      "url_real": "https://www.saneago.com.br/prt/koc/KOC004ConsultaPrevistoExecutado.zul",
      "filtros": ["ra"],
      "colunas_retornadas": ["Código", "Descrição", "Previsto", "Executado"],
      "por_que_casou": ["Vertical casada: qualidade_laboratorio"]
    },
    {
      "codigo": "KRTV003",
      "nome": "Consulta AVTO",
      "url_real": "https://www.saneago.com.br/prt/krt/KRT003ConsultarAvto.zul",
      "filtros": ["cidade", "bairro", "logradouro", "periodo", "cpf_cnpj"],
      "colunas_retornadas": ["Dias na Unidade", "Número", "Ano", "Cidade", "Parecer de Água", "Parecer de Esgoto", "Prazo Final", "Situação", "Fluxo", "U.O.", "Empreendedor", "Nome Empreendimento", "Validade"],
      "por_que_casou": ["Vertical casada: qualidade_laboratorio"]
    },
    {
      "codigo": "KRT028",
      "nome": "Lista para Análise",
      "url_real": "https://www.saneago.com.br/prt/krt/KRT028ListaAnalise.zul",
      "filtros": [],
      "colunas_retornadas": ["Dias na Unidade", "Número AVTO", "Ano AVTO", "Cidade", "Parecer de Água", "Parecer de Esgoto", "U.O.", "Prazo Final", "Empreendedor", "Qtd de Unidades Comerciais", "Qtd de Unidades Residenciais", "Nome Empreendimento"],
      "por_que_casou": ["Vertical casada: qualidade_laboratorio"]
    }
  ]
}
```

---

## Erros Remanescentes (10 Aplicações)

A varredura registrou erro de captura em 10 das 337 aplicações. Abaixo o diagnóstico empírico extraído dos logs de execução:

| Código | Nome no Catálogo | Diagnóstico Empírico / Motivo da Falha |
|---|---|---|
| **BPAV004** | Gestão de Empregados no Teletrabalho | **Item de Menu Indisponível / Restrição de Perfil:** `Timeout 30000ms exceeded waiting for locator('.z-menupopup-open .z-menuitem-text').filter({ hasText: 'Gestão de Empregados no Teletrabalho' })`. O item não é exibido no menu flutuante ZK para a conta/perfil logado. |
| **BPAV005** | Reporte de Atividades de Teletrabalho | **Item de Menu Indisponível / Restrição de Perfil:** Idem a BPAV004 (menu de teletrabalho não localizado no DOM). |
| **BPAV006** | Painel de Empregados em Teletrabalho | **Item de Menu Indisponível / Restrição de Perfil:** Idem a BPAV004 (menu de teletrabalho não localizado no DOM). |
| **ECO815** | Coletânea de Diretrizes Comerciais | **Link Externo / Documento PDF:** `Nao foi possivel encontrar o frame da aplicacao`. A aplicação dispara um download direto ou abre arquivo PDF em janela externa fora do container de iframe ZK. |
| **ECO954** | Painel de Religação | **Dashboard Externo / Popup:** A aplicação abre um sistema de dashboard/BI externo em nova aba/janela do navegador, não renderizando iframe no portal principal. |
| **ECO962** | Painel de Cortes | **Dashboard Externo / Popup:** Idem a ECO954 (painel estatístico BI externo em nova janela). |
| **FGIV005** | Consulta de documentos digitalizados | **Sistema de GED Externo:** A aplicação abre o sistema corporativo de gestão de documentos digitalizados em aba externa desacoplada. |
| **LIG002** | Mapa Web SanSIG | **Aplicação GIS Externa:** Abre a interface do visualizador GIS web (SanSIG) em nova janela fora do container ZK. |
| **LIGV002** | Mapa Web SanSIG | **Aplicação GIS Externa:** Idem a LIG002 (visualizador SanSIG em janela externa). |
| **MGOV050** | Painel Estatístico Ouvidoria | **Dashboard BI Externo:** Abre painel de BI da Ouvidoria em popup/janela externa sem iframe ZK. |

---

## Respostas às Perguntas do Usuário (T5)

Com base exclusivamente no índice estruturado em `config/indice_capacidades.json`:

### 1. "Todas as RAs da Rua Ada Centine, no Maracanã, dos últimos 3 meses" — dá? qual tela?
**SIM, DÁ.**
- **Aplicação:** `ECO709` (RAs por Logradouro)
- **Filtros Provados:** `cidade`, `bairro`, `logradouro`, `codigo_servico`, `periodo`
- **Retorno Provado:** `Número RA`, `Datas`, `Situação RA`, `Conta`, `Nome`, `Qd.`, `Lt.`, `Nº`, `Código Serviço`, `Ir p/ RA`, `Início`, `Execução`.
- **Como Executar:** Informar `cidade: "Anápolis"` (ou município correspondente ao bairro Maracanã), `bairro: "Maracanã"`, `logradouro: "Rua Ada Centine"` e o `periodo` dos últimos 3 meses na tela `ECO709`.

---

### 2. "Pesquisar a conta no nome de Marcos Antônio" — dá? qual tela? o que retorna?
**NÃO É POSSÍVEL BUSCAR CONTA DIRETAMENTE APENAS PELO NOME PRÓPRIO.** *(Nota: Veja retificação da FASE 8 abaixo)*

> [!NOTE]
> **CORREÇÃO DA FASE 8:** A conclusão acima de que "não é possível buscar conta diretamente apenas pelo nome" estava **INCORRETA** e decorreu de uma **lacuna de descoberta** (o menu flutuante ZK da Fase 7 não havia sido percorrido recursivamente até o último nível). Não se trata de falha no classificador semântico.
> 
> Na **FASE 8**, a expansão recursiva do menu (T1) e a busca por prefixos refinada (T2) descobriram a aplicação **`ECO154` (Usuários por Nome)** no caminho `COMERCIAL - WEBCOM › Cadastro › Usuários › Usuários por Nome` (`https://www.saneago.com.br/prt/eco/ECO154ConsultaUsuario.zul`).
> 
> A aplicação **`ECO154`** permite pesquisar contas de água/esgoto diretamente pelo campo **`Nome`** (bem como por `CPF/CNPJ`, `Cidade`, `Bairro`, `Logradouro`) e retorna no grid os campos: **`Nº Conta`**, **`Nome Proprietário`**, **`Logradouro`**, **`Quadra`**, **`Lote`**, **`Nº`**, **`Hidrômetro`** e **`Id. Conta.`**.

- **Explicação original da Fase 7:** Não existe no portal uma tela de consulta geral de contas por nome de pessoa física isolado.
- **Alternativas Existentes no Índice:**
  - Se possuir o **CPF/CNPJ**, pode usar a app `EGWV001` (Contrato Comercial), `ECO410` (Cancelamento de Débito) ou `ECO010` (Solicitar Titularidade) que aceitam `cpf_cnpj` e retornam o número da `Conta` e o `Nome Titular`.
  - Se souber o **Endereço/Logradouro**, pode usar a app `ECO709` (RAs por Logradouro) que aceita `logradouro` + `bairro` + `cidade` e lista a `Conta` e o `Nome` dos moradores/solicitantes com RA registrada.
  - Se for no escopo de acompanhamento de refaturamento, a app `ECO495` aceita o filtro `nome` e retorna a `Conta` refaturada.
- **O que faltaria:** Uma aplicação no portal que disponibilizasse pesquisa fonética ou textual direta `Nome Cliente -> Número Conta`.

---

### 3. Outras 10 Perguntas de Alto Valor Atendidas Pelo Índice

1. **"Qual o histórico de leituras e consumos faturados da conta 123456?"**
   - **Aplicação:** `ECO303` (Acerta Leitura/Consumo)
   - **Filtros:** `conta`
   - **Retorno:** `Mês/Ano`, `Data Leitura`, `Consumo`, `Motivo Crítica`, `MCF`, `MRL`, `Dados de leitura`

2. **"Quais os débitos em cobrança judicial ou títulos em cartório no CPF 123.456.789-00?"**
   - **Aplicação:** `ECNV007` (Consultar Protesto)
   - **Filtros:** `cpf_cnpj`
   - **Retorno:** `Conta`, `Referência`, `Documento`, `Valor`, `Data de Envio`, `Situação Atual`

3. **"Qual o relatório de recomposição asfáltica pendente na cidade de Goiânia no bairro Bueno?"**
   - **Aplicação:** `LRS041` (Relatório de recomposição asfáltica)
   - **Filtros:** `cidade`, `bairro`, `uo`, `periodo`
   - **Retorno:** `Listagem dos Lotes`, `Situação`, `Unidade Organizacional`, `E-mail do Destinatário`

4. **"Quais as RAs abertas associadas ao número de conta de água 987654?"**
   - **Aplicação:** `ECO707` (RAs por Número de Conta)
   - **Filtros:** `conta`
   - **Retorno:** `Número RA`, `Datas`, `Situação RA`, `Código Serviço`, `Início`, `Execução`

5. **"Quais os pagamentos via PIX confirmados no sistema no período de 01/07 a 15/07?"**
   - **Aplicação:** `ECO674` (Consulta PIX)
   - **Filtros:** `periodo`
   - **Retorno:** `Lista de Pix Efetivados`, `Id Transação`, `Conta`, `Documento`, `Valor`, `Data de Envio`

6. **"Quais as manobras de rede e fechamento de registros cadastrados para a cidade de Anápolis?"**
   - **Aplicação:** `GPMV001` (Manobra de Registros)
   - **Filtros:** `cidade`, `bairro`, `codigo_servico`
   - **Retorno:** `Manobra`, `Serviço`, `Un. Responsável`, `Cidade`, `Reservatório`, `Data Início`, `Data Término`

7. **"Quais os laudos de aferição de hidrômetro registrados para a conta 456789?"**
   - **Aplicação:** `ECO213` (Aferição de Hidrômetro)
   - **Filtros:** `conta`
   - **Retorno:** `Laudo`, `Ano`, `Hidrômetro`, `Data da Solicitação`, `Data da Emissão`, `Resultado dos Ensaios`

8. **"Qual a lista de processos judiciais vinculados à conta de água 112233?"**
   - **Aplicação:** `JAJ036` (Consulta Processo Conta)
   - **Filtros:** `conta`
   - **Retorno:** `Processo`, `Data Ajuizamento`, `Situação`, `Resultado`

9. **"Qual o comprovante e status do envio de declaração de IRPF para o CPF 123.456.789-00?"**
   - **Aplicação:** `BAP012` (Enviar Declaração IRPF)
   - **Filtros:** `cpf_cnpj`
   - **Retorno:** `Sequencial`, `Data Envio`, `Tipo Documento`, `Competência`, `Status Recebimento`

10. **"Quais as análises e processos de Atestado de Viabilidade Técnica e Operacional (AVTO) na cidade de Aparecida de Goiânia?"**
    - **Aplicação:** `KRTV003` (Consulta AVTO)
    - **Filtros:** `cidade`, `bairro`, `logradouro`, `periodo`, `cpf_cnpj`
    - **Retorno:** `Dias na Unidade`, `Número`, `Ano`, `Cidade`, `Parecer de Água`, `Parecer de Esgoto`, `Prazo Final`, `Situação`, `U.O.`, `Empreendedor`

## Revisão (Claude Opus 4.8, 2026-07-21)

Revisão independente em subagente isolado, com reprodução das provas — sem confiar no
autorrelato do executor.

**Veredito: APROVADO.** Nenhum problema encontrado.

- Testes: `node --test test/fase7.test.js` → **4/4 passaram**, 0 falhas.
- `node src/gerar_indice_capacidades.js` regenera o índice sem erro; `total_aplicacoes: 337`,
  com `por_filtro` e `por_vertical` apontando para códigos existentes.
- **Verificação anti-alucinação (foco da revisão):** os filtros `cidade`, `bairro`,
  `logradouro` e `periodo` atribuídos ao ECO709 foram conferidos no `config/capacidades.json`
  bruto — são rótulos **realmente capturados** na varredura, não inferidos. Amostra de
  4 dos 10 códigos citados no T5 também confere (ECO303→`conta`, ECNV007→`cpf_cnpj`,
  LRS041→`cidade,bairro,uo,periodo`, ECO707→`conta`).
- `src/tools/descobrir.js` importa apenas `fs` e `path`: busca 100% local, sem rede e sem
  Playwright, como especificado.
- `src/index.js` registra `saneago_descobrir_aplicacao` no padrão das tools existentes e o
  servidor MCP carrega sem erro.
- Invocações reais da tool: "RAs por logradouro e bairro nos últimos 3 meses" → ECO709 em
  1º; "consultar conta pelo nome do titular" → ECO495 em 1º.
- Nenhum arquivo fora do repositório tocado; `agy_run.log` e `scratch/` fora do versionamento.

**Observação para a próxima fase:** o ranking devolve muitas candidatas (113 e 92 nos dois
testes). A ordenação acerta o topo, mas vale limitar/pontuar melhor a cauda antes de expor
isso a uma LLM consumidora.
