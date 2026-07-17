# Plano — Migração do executor para a API cliente do ZK

**Data:** 2026-07-16 · **Autor:** Claude (revisor) + Marcos Jr · **Status:** IMPLEMENTADO e provado no ECO701 (FASES A–C). Projeto paralisado antes do gate de escrita real (bloqueio de negócio, REGRA 7 — ver `PROGRESSO.md`).

## 0. Diretriz de escopo (decisão 2026-07-16) — NÃO migrar em massa

O driver ZK é **compartilhado** (`src/executor.js`) — já está disponível para todas as
tools; não há "refazer aplicação por aplicação". Ele resolve apenas a **corrida de
digitação** (campo longo no meio de sequência com autofill mexendo na tela), que é um
problema de telas de ESCRITA. As consultas (`eco303`/`lrs041`) preenchem poucos campos
curtos de busca e estão provadas — **não** devem ser migradas (risco de regressão sem
ganho). Padrão: **toda tela de escrita nova nasce no driver ZK**; leitura fica como está,
migra só se der problema de digitação, caso a caso e com captura de eventos. As 327 apps
do catálogo são roteiros (sem código) — nada a migrar. Detalhe e justificativa completa na
seção "PARALISAÇÃO" do `PROGRESSO.md`.

## 1. Contexto e motivação

O projeto dirige as telas ZK do portal Saneago simulando um humano: `pressSequentially`
tecla a tecla, cliques do Playwright, `Tab` para blur. Isso provou funcionar, mas ao custo
de uma classe inteira de bugs de corrida documentados no `PROGRESSO.md`:

- **Truncamento silencioso**: o autofill do CEP deixa o ZK mexendo na tela e engole teclas
  (`MARCOS JR - TESTE...` virava `MARCOS JR`, cortado em ponto diferente a cada rodada);
- **Embaralhamento**: DDD `62` gravado como `(26)`;
- **Esperas frágeis**: todo passo precisa de polling contra re-render do ZK;
- **Custo por app**: cada tela nova exige redescobrir os mesmos contornos de timing.

A alternativa "replay de `/zkau` via HTTP puro" foi avaliada e **descartada** (ver
`PLAN.md` princípio 1 e `ANATOMIA_ZKAU.md`): exigiria reimplementar o motor cliente do ZK
(rastrear `dtid`/`uuid`/`sid`, parsear respostas AU, seguir mutações da árvore), com o pior
modo de falha possível — o silencioso.

**Este plano adota o meio-termo:** manter o navegador vivo (Playwright + sessão + iframe),
mas **parar de fingir digitação** — falar com o ZK pela API cliente dele
(`zk.Widget`/`zAu`), dentro do `frame.evaluate()`. O motor cliente oficial do ZK cuida do
protocolo AU (dtid, uuid, sid, serialização) sempre na versão certa; nós só disparamos os
mesmos eventos que a interação real dispararia.

## 2. Prova de conceito (executada em 2026-07-16, rede Saneago, read-only)

Scripts em `scratch/` (manter como referência canônica):

| Script | O que provou |
|---|---|
| `diag_zk_capture_eventos.js` | Instrumentou `zAu.send` e capturou o fluxo de eventos AU que a digitação real envia. **Método reutilizável para mapear qualquer interação.** |
| `diag_zk_widget_api.js` | Replicou o fluxo inteiro do pré-submit do ECO701 só com a API cliente. **Veredito: NOME íntegro (29/29 chars), autofill do CEP em 523ms, zero truncamento.** |

### 2.1 Fatos estabelecidos

- Portal usa **ZK 9.6.3** (build 2022102511); `zk`, `zk.Widget`, `zAu` expostos no frame.
- **Clique de botão**: `wgt.fire("onClick", { which: 1 }, { toServer: true })` funciona
  (classe `zul.wgt.Button`) — a tela do Incluir renderizou normalmente.
- **Campos de texto/número** (`zul.inp.Textbox`, `zul.inp.Intbox`): setar
  `wgt.getInputNode().value = valor` e chamar `wgt.updateChange_()` envia o `onChange`
  correto (o Intbox coage para número sozinho — a captura mostrou `{"value":75040050}`).
- **O Enter que dispara o autofill do CEP não é evento do campo** — a captura revelou a
  tríade real:
  1. `onChange` no Intbox (`{value: 75040050, start: 8}`)
  2. `onBlur` no Intbox
  3. `onOK` na **`zul.wnd.Window` ancestral**, com
     `{reference: <uuid do campo>, keyCode: 13, charCode: 0, key: "Enter", which: 13}`
- Replicando a tríade, o autofill populou Cidade/Bairro/Logradouro em **523ms**.
- Valor setado via API **não sofre corrida**: amostragem de 5s manteve os 29 chars
  íntegros mesmo com o autofill do CEP rodando em paralelo — exatamente o cenário que
  truncava a digitação simulada.

### 2.2 Regra de ouro do método

> **Nunca inventar o formato de um evento.** Para cada interação nova (combo, bandbox,
> grid, radio), primeiro rodar a instrumentação de `zAu.send` (padrão do
> `diag_zk_capture_eventos.js`) fazendo a interação REAL uma vez, e replicar o fluxo
> capturado. O que se replica é o *comportamento provado*, não a documentação do ZK.

## 3. Arquitetura da mudança

**Não muda:** `session.js` (login/cookies), `portal.js` (abrir apps, busca, menu fallback),
`inspector.js` (localização de campos por rótulo — os UUIDs mudam a cada render, a
heurística de rótulo continua sendo o endereço estável), trava `SANEAGO_ALLOW_WRITE`,
audit log, contrato das tools MCP (`src/index.js`).

**Muda:** `src/executor.js` ganha o driver ZK; `src/tools/eco701.js` passa a usá-lo.

### 3.1 Novas funções em `src/executor.js`

```
setarCampoZk(frame, elementId, valor)
  - resolve wgt = zk.Widget.$(el); inp = wgt.getInputNode() || el
  - inp.value = valor; wgt.updateChange_()
  - fallback (widget sem updateChange_): wgt.setValue(valor) +
    wgt.fire("onChange", {value: valor, start: -1}, {toServer: true})
  - VERIFICAÇÃO OBRIGATÓRIA (mantida do executor atual): reler o value do DOM e
    comparar ignorando caracteres de máscara `( ) - . _ / espaço`; divergência = throw.
    A API elimina a corrida, mas a verificação é a guarda contra o desconhecido —
    não removê-la.

confirmarCampoZk(frame, elementId)   // o "Enter" do ZK
  - wgt.fire("onBlur", null, {toServer: true})
  - sobe wgt.parent até className === "zul.wnd.Window"
  - win.fire("onOK", {reference: wgt.uuid, keyCode: 13, charCode: 0,
                      key: "Enter", which: 13}, {toServer: true})

clicarZk(frame, elementId)
  - wgt.fire("onClick", {which: 1}, {toServer: true})
```

Regras transversais:
- Todo `frame.evaluate` retorna `{ok, classe, via, motivo?}` — erro nunca é engolido.
- Se `zk`/`zk.Widget` não existir no frame (telas `.jsp` legadas, ex.: LRS014/LRS020),
  as funções lançam erro claro e o chamador usa o caminho antigo — **o caminho por
  digitação (`preencherCampo`/`clicar`) NÃO é removido**; vira fallback documentado.
- Esperas pós-evento continuam sendo **polling por condição observável** (campo populado,
  botão presente) — a API não elimina a latência do servidor, só a corrida do input.

### 3.2 Migração do `src/tools/eco701.js` (`abrirRA`)

Trocar, na sequência do preenchimento:
- CEP: `preencherCampo + press("Enter")` → `setarCampoZk + confirmarCampoZk` (tríade provada);
- Nome do cliente, nome/telefone do contato, número, observação: `setarCampoZk`
  (o desempate de qual campo é qual **não muda** — continua vindo do rótulo/escopo);
- Código do serviço: `setarCampoZk` + polling da descrição do serviço (lookup server-side);
- Botões (Incluir; Gerar RA continua atrás do gate de escrita): `clicarZk`;
- **Combo "Forma de Atendimento" (readonly/select-only): NÃO migrar às cegas.**
  Passo obrigatório: capturar com a instrumentação o que o clique real no `.z-comboitem`
  envia (provavelmente `onSelect`/`onChange` na `zul.inp.Combobox`) e só então replicar.
  Até lá, manter o caminho atual (popup + clique real), que está provado.

### 3.3 O que fica explicitamente FORA de escopo

- Replay de `/zkau` via HTTP sem navegador — descartado (seção 1).
- Alterar schemas das tools MCP, a trava de escrita ou o fluxo de confirmação humana.
- Migrar ECO303/LRS041 — só depois do ECO701 aprovado (são read-only e estão estáveis).
- Bandboxes por nome (cidade/bairro/logradouro sem CEP) — pendência separada no PROGRESSO.

## 4. Fases e critérios de aceite

**FASE A — driver no executor** (sem tocar nas tools)
- `setarCampoZk`, `confirmarCampoZk`, `clicarZk` implementados com verificação e erros claros.
- Aceite: `node --check` verde; `scratch/diag_zk_widget_api.js` reescrito para usar as
  funções novas do executor (em vez de código inline) passa com NOME íntegro e autofill OK.

**FASE B — captura da combo**
- Rodar a instrumentação sobre o clique real na "Forma de Atendimento"; registrar o fluxo
  de eventos num comentário/`docs/` e implementar `selecionarComboZk` replicando-o.
- Aceite: combo verificada com valor final "3 - INTERNO" via API, em tela real.

**FASE C — migração do `abrirRA`**
- Sequência completa do pré-submit via driver ZK.
- Aceite: `node scratch/test_eco701_supervisionado.js` (SEM `--confirmar`) com `resumo`
  equivalente ao atual: CEP autofill (ANAPOLIS/BAIRRO MARACANA/RUA DONA ADA CENTINI),
  serviço 2002, forma 3-INTERNO, nome/contato íntegros, `validacaoPreSubmit: []`.
- **5 execuções consecutivas sem truncamento nem divergência** (o bug antigo era
  intermitente; uma rodada verde não prova nada).

**FASE D — submissão real** (gate humano, fora do escopo do executor da mudança)
- Com Marcos Jr presente, `--confirmar` + `SANEAGO_ALLOW_WRITE=1`. Mesmo protocolo de
  auditoria de sempre.

## 5. Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Evento com payload errado "funciona" na tela mas o servidor ignora/corrompe | Só replicar fluxos capturados da interação real (regra de ouro); verificação de valor pós-set mantida |
| Telas não-ZK (`.jsp`) sem `zk` no frame | Erro explícito + fallback para digitação simulada |
| Combo/bandbox/grid com eventos próprios | Capturar antes de implementar, um tipo de widget por vez |
| Upgrade futuro do ZK no portal | `zk.version` logado na sonda; a captura de eventos permite re-derivar os fluxos |
| Regressão no que já funciona | Caminho antigo preservado; migração só no eco701; E2E de 5 rodadas |
