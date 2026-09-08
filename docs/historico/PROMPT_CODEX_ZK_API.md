# Prompt para o Codex — Driver ZK Client API (MCP-Saneago)

Copie tudo abaixo da linha e cole no Codex, com o diretório de trabalho em
`/Volumes/Mac_Dados/Repos/MCP-Saneago`.

---

Você é o EXECUTOR de um pacote de trabalho no projeto **MCP-Saneago**
(`/Volumes/Mac_Dados/Repos/MCP-Saneago`). Seu trabalho será revisado por um revisor
independente (Claude) antes de qualquer commit — **você NÃO faz commit, NÃO faz push e
NÃO altera nada fora do escopo listado**. Entregue código + relatório.

## Contexto obrigatório (leia antes de escrever qualquer linha)

1. `docs/PLANO_ZK_CLIENT_API.md` — o plano desta mudança, com a prova de conceito já
   executada e aprovada. Este documento é a especificação; em caso de dúvida, ele manda.
2. `scratch/diag_zk_widget_api.js` — prova de conceito FUNCIONANDO (rodada na rede real):
   é o comportamento de referência que você vai generalizar.
3. `scratch/diag_zk_capture_eventos.js` — instrumentação de `zAu.send` que captura os
   eventos AU reais; é o método para mapear qualquer interação nova.
4. `src/executor.js` — executor atual (digitação simulada com verificação anti-truncamento).
5. `src/tools/eco701.js` — a tool `abrirRA` que será migrada.
6. `PROGRESSO.md` (seções FASE 4) — histórico dos bugs de corrida que motivam a mudança.

## Fatos provados que você deve respeitar (não redescobrir, não contrariar)

- Portal usa ZK 9.6.3; `zk`, `zk.Widget`, `zAu` disponíveis dentro do frame da aplicação.
- Setar campo: `inp = wgt.getInputNode() || el; inp.value = valor; wgt.updateChange_()`.
- "Enter" (dispara autofill do CEP): tríade `onChange` (via updateChange_) →
  `wgt.fire("onBlur", null, {toServer: true})` → `win.fire("onOK", {reference: wgt.uuid,
  keyCode: 13, charCode: 0, key: "Enter", which: 13}, {toServer: true})`, onde `win` é o
  ancestral com `className === "zul.wnd.Window"`.
- Clique: `wgt.fire("onClick", {which: 1}, {toServer: true})`.
- Os IDs/UUIDs dos componentes mudam a cada render — a localização de campos continua
  sendo por rótulo (heurísticas existentes em `inspector.js`/tools). Não hardcode IDs.

## Escopo do pacote

### FASE A — driver ZK em `src/executor.js`
Adicionar (sem remover as funções atuais — elas viram fallback):

- `setarCampoZk(frame, elementId, valor)` — conforme especificação da seção 3.1 do plano.
  OBRIGATÓRIO manter a verificação pós-set: reler o `value` do DOM e comparar ignorando
  caracteres de máscara `( ) - . _ /` e espaço; divergência lança erro com os dois valores
  na mensagem. Retornos internos dos `frame.evaluate` sempre `{ok, classe, via, motivo?}`.
- `confirmarCampoZk(frame, elementId)` — a tríade blur+onOK descrita acima. Se não achar
  a `Window` ancestral, lançar erro claro.
- `clicarZk(frame, elementId)` — clique via evento de widget.
- Todas: se `typeof zk === "undefined"` ou widget não resolvido, lançar erro com mensagem
  que oriente o chamador a usar o caminho antigo (`preencherCampo`/click Playwright).

### FASE B — captura e implementação da combo (Forma de Atendimento)
- Criar `scratch/diag_zk_capture_combo.js` no padrão do `diag_zk_capture_eventos.js`:
  instrumentar `zAu.send`, executar a seleção REAL da combo "Forma de Atendimento"
  (o código atual em `eco701.js` já faz isso via popup + clique — reuse-o), e logar o
  fluxo de eventos capturado.
- Implementar `selecionarComboZk(frame, elementId, textoOpcao)` em `executor.js`
  replicando o fluxo capturado. **Se você NÃO tiver acesso à rede Saneago para rodar a
  captura, implemente o script de captura, deixe `selecionarComboZk` lançando
  `Error("PENDENTE: rodar diag_zk_capture_combo.js na rede Saneago e replicar o fluxo")`
  e registre isso no relatório.** Não invente o formato do evento.

### FASE C — migração do `abrirRA` em `src/tools/eco701.js`
- CEP: `setarCampoZk` + `confirmarCampoZk` (substitui `preencherCampo` + `press("Enter")`).
- Nome do cliente, nome do contato, DDD e telefone do contato, número, observação:
  `setarCampoZk`.
- Código do serviço: `setarCampoZk` + manter o polling existente da descrição do serviço.
- Botão "Incluir": `clicarZk` (manter o polling de até 10s que espera o botão existir).
- Combo Forma de Atendimento: usar `selecionarComboZk` SE a FASE B estiver completa;
  caso contrário manter o caminho atual do popup intocado.
- Botão "Gerar RA" e toda a lógica de gate de escrita (`confirmar`, `SANEAGO_ALLOW_WRITE`),
  detecção de erro pós-submit, `validacaoPreSubmit`, resumo do preview: **NÃO ALTERAR** a
  lógica; apenas trocar o mecanismo de clique para `clicarZk` onde couber.
- Toda espera continua sendo polling por condição observável. Não introduzir
  `waitForTimeout` fixos novos (os existentes você pode manter).

### Atualizar `scratch/diag_zk_widget_api.js`
- Reescrever para consumir as funções novas do executor em vez do código inline, virando
  o teste de regressão do driver.

## Fora de escopo — NÃO tocar
`src/index.js` (schemas das tools), `src/session.js`, `src/portal.js`, trava de escrita,
audit, ECO303, LRS041, qualquer replay HTTP de `/zkau`.

## Verificação exigida antes de entregar
1. `node --check` em todos os arquivos alterados/criados (colar saída no relatório).
2. Se tiver rede Saneago + `config/credentials.json`: rodar
   `node scratch/diag_zk_widget_api.js` (read-only) e colar a saída íntegra no relatório.
   O critério é: `NOME integro: SIM` e `AUTOFILL OK`.
3. Se NÃO tiver rede: dizer isso explicitamente no relatório; o E2E será rodado pelo
   revisor. Não simule nem invente saídas.
4. **PROIBIDO** rodar qualquer coisa com `--confirmar` ou `SANEAGO_ALLOW_WRITE=1`.
   A submissão real é gate humano.

## Entrega
- Código nos arquivos do escopo.
- `RELATORIO_ZK_API.md` na raiz: o que foi feito por fase, decisões tomadas, o fluxo de
  eventos capturado da combo (ou a pendência), saídas das verificações, e qualquer desvio
  do plano com justificativa.
- Sem commits. Sem push. Sem arquivos fora do escopo além do relatório e dos scratch/.
