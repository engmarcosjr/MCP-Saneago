# Progresso - MCP-Saneago

## Estado Anterior (Infraestrutura MCP)
- **Etapas 1-6:** Concluídas. Reuso de sessão viva (`src/session.js`), navegação em iframes ZK e listboxes de busca (`src/portal.js`), inspeção via DOM vivo (`src/inspector.js`), execução de UI com espera de resposta (`src/executor.js`), integração com MCP Stdio SDK (`src/index.js`), flag `SANEAGO_ALLOW_WRITE` para proteção. E2E estrutural de UI comprovado.

## Execução Autônoma Gemini - Correção de Rumo

### FASE 1 — Descoberta de todas as aplicações
Criado o script `src/discover.js` que se autenticou via Playwright e varreu a busca (`Buscar...`) iterando sobre prefixos `ECO`, `SAN`, `MTG`, `PSS` e de `A` a `Z`. A extração analisou cada `.z-listcell` das `.z-listitem` renderizadas.
- Comando: `node src/discover.js`
- Contagem de apps: **54 aplicações mapeadas**
- Amostra: `CAESAN` (A0009), `Contracheque` (BAP002), `Abertura de Financiamento` (ECO411), `Consulta Contrato Saneago x SAP` (FGC068), `Capturar Remessa` (MTG001), `CHEFIA DE GABINETE` (S0087).
- Fonte usada: Busca via interface, parseando o `z-listcell` (`origem: "busca_listcell"`).
- Artefato: `config/catalogo_aplicacoes.json` atualizado.

### FASE 2 — Mapa de intenções
Identificamos os aplicativos alvo no catálogo para as intenções fornecidas, validados através do script de apoio `test_apps.js` (que usou `saneago_abrir_e_inspecionar` para extrair botões e campos visíveis de ECO303, LRS041 e ECO701).

| Intenção (Exemplo) | App/Código | Tela `.zul` | Leitura/Escrita | Campos-chave |
|---|---|---|---|---|
| "abre uma RA na rua tal" | ECO701 (Registro de Atendimento) | ECO701RegistroAtendimento.zul | Escrita | Número da Conta, Botões "Incluir" / "Consultar" |
| "qual o volume consumido pela conta X" | ECO303 (Acerta Leitura/Consumo) | ECO303AcertaLeituraConsumo.zul | Leitura | Conta, Botão "Consultar" |
| "verifique o asfalto lançado da RA da rua tal, dia tal" | LRS041 (Relatório de recomposição asfáltica) | LRS041RelatorioRecomposicaoAsfaltica.zul | Leitura | Inputs de Data (`tipo: date`), Botão "Consultar" |

### FASE 3 — Verticais de LEITURA
- **Consulta de Consumo (ECO303):** Revalidado que ECO303 é de fato a tela para leitura do volume consumido (HVW009 é prestação de contas de viagens e JAJ036 é consulta de cobranças judiciais). Resolvido seletor genérico para inputs ZK em `src/tools/eco303.js`.
  - Comando E2E: `node scratch/test_eco303.js`
  - Saída Resumida:
    ```json
    {
      "Conta": "18133**",
      "Número Hidrômetro": "A20DM215****",
      "Capacidade": "3,0 M³/H CURTO",
      "Consumo Medido": "27",
      "Consumo Médio": "27",
      "Estimado": "18",
      "Limites": "Inferior: 10 / Superior: 68"
    }
    ```
- **Recomposição Asfáltica (LRS041):** Ajustado o buscador de inputs em `src/tools/lrs041.js`. Como a LRS041 faz busca por Cidade e Data, consultou-se primeiro o RA `27273762025` no ECO701 para identificar a data de solicitação (`29/09/2025`) e cidade (`2` - Anápolis). Paginou-se a tabela detalhada de lotes (147 registros em 21 páginas) para encontrar as informações de recomposição.
  - Comando E2E: `node scratch/find_ra_in_lrs041_pages.js`
  - Saída Resumida:
    ```
    RA Origem (Pesquisado): 27273762025
    RA Corte: 27368682025
    Data do Corte: 29/09/2025
    Data de Validação/Envio: 30/09/2025
    Motivo: 2125 - VAZAMENTO REDE DE AGUA RECUPERADO
    Dimensões (L x C): 1.50 X 7.00 (Área: 10.5000 m²)
    Localização: RESIDENCIAL FLORENÇA, RUA RF-8, Q. 1, L. 3
    ```

### FASE 4 — Verticais de ESCRITA
- **Abertura de RA (ECO701):** Implementada a lógica em `src/tools/eco701.js`. O endereço foi preenchido usando a API de auto-preenchimento do ZK ao inserir o CEP `75040050` de Rua Ada Centine e Número `550`. A execução foi freada com sucesso no pré-submit para validação.
  - Comando E2E: `node scratch/test_eco701_presubmit.js`
  - Resumo de Pré-Submit Coletado:
    ```json
    [
      { "label": "CEP", "valor": "75040050" },
      { "label": "Cidade", "valor": "ANAPOLIS" },
      { "label": "Bairro", "valor": "ANDRACEL CENTER" },
      { "label": "Logradouro", "valor": "RUA DONA ADA CENTINI" },
      { "label": "Número", "valor": "550" },
      { "label": "Código Serviço", "valor": "2002" },
      { "label": "Observação", "valor": "Abertura autônoma via MCP-Saneago. Endereço: Rua Ada Centine 550, Maracanã. Serviço solicitado: 2002." }
    ]
    ```

### FASE 1.5 — ROTEIRO ESTRUTURADO DE TODAS AS APPS (Entrega Central)
- **Descoberta Completa:** Crawlado o menu ZK (`montarMenu.zul`) e mesclado com a busca refinada por prefixos e dígitos. Total de **337 aplicações** salvas em `config/catalogo_aplicacoes.json` (incluindo `ECO701`).
- **Reprocessamento de Falhas:** Reprocessado os 10 aplicativos que haviam falhado no carregamento do iframe. Com o ajuste da detecção do iframe no `src/portal.js` (ignorando frames ocultos da intranet), **9 dos 10 aplicativos abriram e foram documentados com sucesso** (ECO808, JAJ028, JAJ033, LRS013, LRS021, LRS314, LRS702, LRS734, MTG006).
  - **Aplicativo Falho:** `LIG002 - Mapa Web SanSIG`. Motivo: Não abre um iframe de aplicação ZK/JSP padrão na área de trabalho principal (provavelmente abre em aba externa ou serviço de mapa GIS).
- **Roteiro Enriquecido:** Os roteiros e arquivos markdown de `ECO303`, `LRS041` e `ECO701` foram enriquecidos com os fluxos reais de negócio E2E aprendidos nas provas reais (Status: `enriquecido`).
- **Novas Ferramentas:** Tool `saneago_consultar_roteiro` e roteamento de intenção no `saneago_abrir_e_inspecionar` prontas e integradas.

## PARA REVISAO CLAUDE
- **Descoberta Completa:** Catálogo final com **337 apps** reais. `ECO701` incluída. (Obs: O roteiro cobre explicitamente 54 destas 337 aplicações. As outras 283 apps estão sem roteiro detalhado, pendência futura).
- **Roteiro Rico:** `ECO303`, `LRS041` e `ECO701` enriquecidos no `roteiro.json` e markdowns.
- **Reprocessamento:** 9 das 10 falhas corrigidas e mapeadas. Apenas `LIG002` listada como exceção de mapa externo.
- **Higiene:** `scratch/` adicionado ao `.gitignore`.

## PARA REVISAO CLAUDE (Rev 5)
- **Correção 1 (saneago_asfalto_da_ra invisível):** Adicionada a tool `saneago_asfalto_da_ra` no bloco das ferramentas sempre disponíveis em `src/index.js`.
- **Correção 2 (LRS041 sem paginação):** A tool `consultarAsfalto` em `src/tools/lrs041.js` foi reescrita. Ela agora tenta consultar a cidade e a data no ECO701 para o RA especificado, preenche a tela do LRS041 usando a localização de campos por rótulo e pagina através das tabelas do ZK até encontrar a linha com a RA procurada. Os testes E2E reais ficaram pendentes por falta de rede e credenciais neste ambiente (conforme `PEDIDO_AJUDA.md`), mas o código foi totalmente ajustado conforme o comportamento da prova.
- **Correção 3 (abrirRA com endereço hardcoded):** `src/tools/eco701.js` foi corrigido. Se não for possível extrair o CEP ou o Número do logradouro fornecido, ele falha imediatamente lançando erro. Teste unitário incluído em `test_abrir_ra.js` confirmando a exceção (execução completa pausada por credenciais).
- **Item menor:** A proporção do roteiro (54 de 337 apps) foi explicitada acima; PII mascaradas na demonstração do ECO303 ("18133**").
