# Relatório — API cliente ZK

Data: 2026-07-16

## FASE A — driver

Implementadas em `src/executor.js`:

- `setarCampoZk`: resolve `zk.Widget`, usa `getInputNode()` + `updateChange_()` e mantém fallback `setValue` + `onChange`.
- Verificação pós-set obrigatória, comparando o valor DOM e o esperado sem máscara/espaços (`( ) - . _ /`). Divergência informa os dois valores.
- `confirmarCampoZk`: envia `onBlur` e depois `onOK` na `zul.wnd.Window` ancestral, com a referência/teclas capturadas.
- `clicarZk`: envia `onClick` com `which: 1`.
- Erros de API ZK indisponível, elemento ausente, widget não resolvido e Window ausente são explícitos e orientam o fallback antigo.

Todos os `frame.evaluate` do driver retornam objetos com `ok`, `classe`, `via` e, quando aplicável, `motivo`.

## FASE B — combo

Foi criado `scratch/diag_zk_capture_combo.js`. A captura real read-only retornou:

```text
[Combo] alvo: {"inputId":"pB6Wx0-real","buttonId":"pB6Wx0-btn","popupId":"pB6Wx0-pp","readonly":true} opcao: 3 - INTERNO

[Combo] 3 eventos AU enviados:
  +     0ms onOpen       zul.inp.Combobox         uuid=pB6Wx0 data={"open":true,"value":""}
  +    31ms onChange     zul.inp.Combobox         uuid=pB6Wx0 data={"value":"3 - INTERNO","start":0}
  +    31ms onSelect     zul.inp.Combobox         uuid=pB6Wx0 data={"items":["pB6Wwr"],"reference":"pB6Wwr"}
[Combo] valor final: 3 - INTERNO
```

`selecionarComboZk` foi implementada em `src/executor.js` reproduzindo esse fluxo. O UUID do item é localizado dinamicamente no popup; nenhum ID/UUID é hardcoded. `eco701.js` usa a função para a combo readonly. O caminho Playwright permanece para uma eventual combo editável.

## FASE C — ECO701

`abrirRA` agora usa o driver ZK para CEP + confirmação, nome do cliente, contato, DDD/telefone, código do serviço, número, observação, Incluir e Gerar RA. A lógica de confirmação, `SANEAGO_ALLOW_WRITE`, validação pré-submit, resumo, detecção de erro e polling pós-submit foi preservada. A seleção da combo foi migrada após a captura real.

## Verificações

`node --check`:

```text
OK src/executor.js
OK src/tools/eco701.js
OK scratch/diag_zk_widget_api.js
OK scratch/diag_zk_capture_combo.js
```

Diagnóstico de regressão read-only: executado com credenciais existentes e rede Saneago. Saída íntegra:

```text
[Fase 0] Sonda ZK: {"zk":true,"versao":"9.6.3","build":"2022102511","temWidget":true,"temZAu":true,"widgetsNaTela":true}
[Fase 1] Clique 'Incluir' via widget: {"ok":true,"classe":"zul.wgt.Button","via":"onClick"}
[Fase 2] CEP via widget: {"ok":true,"classe":"zul.inp.Intbox","via":"updateChange_","valorDom":"75040050","verificacao":"75040050"}
[Fase 2] Blur+Enter (onOK na Window) via widget: {"ok":true,"classe":"zul.inp.Intbox","via":"onBlur+Window.onOK","janela":"pNTA0"}
[Fase 2] AUTOFILL OK em 526ms: ANAPOLIS / ANAPOLIS / RUA DONA ADA CENTINI
[Fase 3] NOME via widget (3ms): {"ok":true,"classe":"zul.inp.Textbox","via":"updateChange_","valorDom":"MARCOS JR - TESTE MCP-SANEAGO","verificacao":"MARCOS JR - TESTE MCP-SANEAGO"}
[Fase 4] Servico: {"ok":true,"classe":"zul.inp.Intbox","via":"updateChange_","valorDom":"2002","verificacao":"2002"}
[Fase 4] Numero: {"ok":true,"classe":"zul.inp.Textbox","via":"updateChange_","valorDom":"550","verificacao":"550"}
[Fase 4] Observacao: {"ok":true,"classe":"zul.inp.Textbox","via":"updateChange_","valorDom":"Teste diagnostico API cliente ZK - MCP-Saneago (read-only, sem submissao).","verificacao":"Teste diagnostico API cliente ZK - MCP-Saneago (read-only, sem submissao)."}
[Veredito] NOME integro: SIM | tempo total: 24.2s
[Veredito] Nada foi submetido (Gerar RA nao foi acionado).
```

A amostragem completa mostrou 10 leituras consecutivas do nome, todas com 29 caracteres e `OK`. A captura e o diagnóstico não usaram `--confirmar` nem `SANEAGO_ALLOW_WRITE=1`.

Não foram feitos commit ou push. O worktree já tinha alterações anteriores em `PROGRESSO.md`, `src/index.js`, `src/executor.js` e `src/tools/eco701.js`, além de arquivos não rastreados; elas foram preservadas.
