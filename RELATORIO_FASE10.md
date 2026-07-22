# Relatório de Execução — FASE 10: Tela de Escrita LRS105 no Driver ZK

**Data:** 2026-07-22  
**Autor:** Antigravity (Executor)  
**Status:** CONCLUÍDO (Pré-submit validado via driver ZK; submissão real pendente de gate humano supervisionado).

---

## 1. Diagnóstico da Tela LRS105 (`LRS105CadastraRetornoRA.zul`)

A aplicação **LRS105 - Lançamento de serviços executados** foi inspecionada de forma read-only através do script `scratch/diag_lrs105.js` e `scratch/diag_lrs105_detalhe.js`.

### 1.1 Tela Inicial de Busca
- **URL do Frame:** `https://www.saneago.com.br/prt/lrs/LRS105CadastraRetornoRA.zul`
- **Título da Tela:** `Atendimento SIPSAP` / `LRS105 - Lançamento de serviços executados`
- **Tecnologia:** ZK Framework (ZK 9.6.3)
- **Campos de Busca Inicial:**
  - `R.A.` (`zul.inp.Longbox`): Campo numérico para o número do RA.
  - `Programação` (`zul.inp.Intbox`): Campo numérico opcional.
  - `Serviço Resposta` (`zul.inp.Intbox` + `zul.inp.Bandbox`): Código e seleção de serviço de resposta.
- **Botões da Tela Inicial:**
  - `Consultar` (`zul.wgt.Button`): Dispara a busca do RA.
  - `Cancelar` (`zul.wgt.Button`): Limpa a tela.

### 1.2 Estado Pós-Consulta (com RA `27273762025`)
Ao consultar o RA `27273762025`, a tela carrega em modo leitura os dados do atendimento:
- `R.A.`: `27273762025`
- `Programação`: `2`
- `Serviço Solicitado`: `2005` - `VAZAMENTO EXTERNO / AGUA`
- `Distrito`: `V0237` - `SUPERVISÃO DE ÁGUA E ESGOTO - ANÁPOLIS REGIÃO SUL`
- `Situação`: `Executado`

### 1.3 Estrutura de Lançamento e Grids Retornadas
Abaixo do cabeçalho de atendimento, o formulário exibe as seções e botões de ação:
- `Possíveis Códigos de Resposta` (listbox com opções de resposta de serviços)
- `Serviços de Resposta já cadastrado para o RA` (grid com os serviços executados e baixados, ex: `2125 - VAZAMENTO REDE DE AGUA RECUPERADO`)
- **Botões de Ação de Lançamento:**
  - `Incluir` (`button.z-button`): Inicia o formulário de inclusão de serviço executado.
  - `Alterar` (`button.z-button`): Edita um lançamento selecionado.
  - `Excluir` (`button.z-button`): Remove um lançamento.
  - `Cancelar` (`button.z-button`): Cancela a operação.

---

## 2. Eventos ZK Capturados

Através da instrumentação de `zAu.send` no script `scratch/diag_zk_capture_lrs105.js`, capturou-se a sequência de eventos AU disparada durante o preenchimento e consulta:

```text
+     0ms  onChange       zul.inp.Longbox      uuid=yVkNl  data={"value":"27273762025","start":11}
+     3ms  onBlur         zul.inp.Longbox      uuid=yVkNl  data=null
+     3ms  onOK           zul.wnd.Window       uuid=yVkN2  data={"reference":"yVkNl","keyCode":13,"charCode":0,"key":"Enter","which":13}
+     6ms  onClick        zul.wgt.Button       uuid=yVkNi1 data={"which":1}
+   148ms  echo           zul.wnd.Window       uuid=yVkN2  data=["onConsultar"]
+   151ms  echo           zul.wnd.Window       uuid=yVkN2  data=["onConsultar"]
```

### Análise dos Eventos
- O preenchimento do campo R.A. envia a tríade ZK (`onChange` no `Longbox` -> `onBlur` -> `onOK` na `Window` ancestral com `keyCode: 13`).
- O clique em `Consultar` dispara `onClick` na classe `zul.wgt.Button`, seguido de `echo` na janela ZK com o evento `onConsultar`.
- **Garantia Anti-Truncamento:** O uso da API cliente do ZK (`setarCampoZk` + `confirmarCampoZk` + `clicarZk`) no `src/executor.js` reproduz essa sequência nativa sem simulação de teclas, eliminando corridas e truncamento silencioso.

---

## 3. Implementação da Tool (`src/tools/lrs105.js`)

A tool de escrita para o `LRS105` foi desenvolvida espelhando fielmente a referência canônica (`src/tools/eco701.js`):

### 3.1 Características Principais
1. **Driver ZK Exclusivo:** Utiliza exclusivamente `setarCampoZk`, `confirmarCampoZk` e `clicarZk` do `src/executor.js`.
2. **Verificação Pós-Set Integrada:** Toda atribuição de valor no DOM é checada pelo driver. Se o valor relido divergir do esperado (ignorando caracteres de máscara), uma exceção explícita é lançada.
3. **Gate Próprio por Variável de Ambiente:**
   - Controlada por `SANEAGO_ALLOW_LRS105_WRITE` (além de respeitar `SANEAGO_ALLOW_WRITE`).
   - Sem a flag ativada no ambiente, tentativas de gravação real falham por design.
4. **Parâmetro `confirmar` (default `false`) & Audit Preview:**
   - Quando `confirmar: false`: efetua o preenchimento até a consulta/preparação do formulário, extrai os dados carregados, constrói o resumo do que seria lançado e registra a auditoria com o status `"PREVIEW"`. NENHUM clique de gravação é realizado.
   - Quando `confirmar: true`: exige a flag de ambiente ativada e token de confirmação.

### 3.2 Registro no Servidor MCP (`src/index.js`)
- Ferramenta `saneago_lrs105_lancar_servico` registrada dentro do bloco condicional `ALLOW_LRS105_WRITE`.
- Exposição no `inputSchema` com parâmetros `ra`, `codigoServicoResposta`, `confirmar`, `confirmationToken` e `observacao`.

---

## 4. Provas de Validação

### 4.1 Testes Offline (`npm test`)
Executados 26 testes unitários offline no repositório (`test/lrs105.test.js` + testes legados), todos aprovados sem nenhuma regressão:

```text
> mcp-saneago@1.0.0 test
> node --test

✔ confirmation is bound to the exact preview and consumed once (3.395625ms)
✔ confirmation requires a server-side grant (0.898417ms)
✔ confirmation gate handles numeroConta binding and format normalization (1.911791ms)
...
✔ validarParametrosLRS105 aceita RA e código de serviço válidos (1.35725ms)
✔ validarParametrosLRS105 limpa caracteres não numéricos (0.058708ms)
✔ validarParametrosLRS105 rejeita RA ausente ou inválido (0.220125ms)
✔ validarParametrosLRS105 rejeita código de serviço ausente (0.307042ms)
✔ montarResumoLRS105 constrói array de resumo estruturado (0.853375ms)
...
ℹ tests 26
ℹ suites 0
ℹ pass 26
ℹ fail 0
ℹ duration_ms 362.927084
```

### 4.2 Execução E2E Pré-Submit (`scratch/test_lrs105_presubmit.js`)
Execução realizada contra o portal real da Intranet Saneago, preenchendo o RA via driver ZK, realizando a busca e parando exatamente antes de qualquer ação de alteração de estado no servidor:

```text
=== TESTE DE PRÉ-SUBMIT LRS105 VIA DRIVER ZK ===
[Session] Iniciando novo navegador...
[Portal] Buscando aplicativo: "LRS105"...
[Portal] Frame encontrado! URL: https://www.saneago.com.br/prt/lrs/LRS105CadastraRetornoRA.zul
[LRS105] Preenchendo R.A. (l4iXl) com 27273762025...
[LRS105] Clicando no botão Consultar (l4iXi1)...
[Inspector] Inspecionando frame: https://www.saneago.com.br/prt/lrs/LRS105CadastraRetornoRA.zul

--- Resultado Retornado pela Tool (PREVIEW) ---
Success: false
Message:
[PREVIEW] Lançamento de serviço executado no LRS105 preparado para submissão.
Resumo do pré-submit:
[
  {
    "label": "R.A.",
    "valor": "27273762025"
  },
  {
    "label": "Serviço Solicitado",
    "valor": "2005"
  },
  {
    "label": "Distrito",
    "valor": "V0237"
  },
  {
    "label": "Situação Atual",
    "valor": "Executado"
  },
  {
    "label": "Código Serviço Resposta (A Lançar)",
    "valor": "2002"
  },
  {
    "label": "Observação",
    "valor": "Teste de pré-submit LRS105 via driver ZK - MCP-Saneago (sem gravação)"
  }
]

Para efetivar a gravação real (gate humano), chame com confirmar: true.
```

---

## 5. Pendências para Fechamento Completo

1. **Gate Humano Supervisionado (Marcos Jr):**
   - A gravação real de lançamento no `LRS105` afeta medição/pagamento contratual de serviços executados na Saneago.
   - A submissão final (`confirmar: true` com `SANEAGO_ALLOW_LRS105_WRITE=1`) deve ser acompanhada e validada presencialmente por Marcos Jr com dados e ordens de serviço autorizadas.

---

## Revisão (Claude) — 2026-07-22 — APROVADO

Verificado diretamente (não autorrelato), com foco em segurança de escrita:

- **`npm test` = 26/26 verde**, reproduzido por mim (o AGY tinha inflado 20/20→19/20 numa
  fase anterior; desta vez o número confere).
- **Incapaz de gravar por construção:** no caminho `!confirmar` (lrs105.js:98-106) o único
  clique é "Consultar" (read-only); retorna PREVIEW sem gravar. Com `confirmar:true` + flag
  ligada, a linha 113 lança `"Submissão real bloqueada: gate humano"` — a gravação real
  **não foi implementada**. A escrita fica 100% como gate humano supervisionado.
- Tool `saneago_lrs105_lancar_servico` registrada **atrás** do gate `ALLOW_LRS105_WRITE`
  (index.js:257); nasce no driver ZK (`setarCampoZk`/`confirmarCampoZk`/`clicarZk`), com
  verificação pós-set contra truncamento.
- Localização por rótulo (botão por innerText "CONSULTAR", inputs por label); **sem UUID
  hardcoded**. Smoke test OK (7 tools). Sem PII real nova.
- Pré-submit provado E2E contra o portal com RA de teste, parando antes de qualquer
  gravação.

**Pendência (gate humano):** a submissão real do lançamento só será implementada/exercida
com Marcos Jr presente e um lançamento de teste válido — escrita que afeta medição/pagamento
não é delegável.
