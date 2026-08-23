# Relatório — FASE 16: endurecimento e honestidade

**Origem:** revisão geral do projeto após as FASES 11-15, que apontou riscos de produção.
**Executor:** AGY (`claude-sonnet-4-6`) nos itens T1-T6; conclusão (P1-P4) pelo
orquestrador Claude, após três execuções do AGY falharem sem entregar (ver "Execução").

---

## T1 — Timeout nas chamadas HTTP (CRÍTICO)

`src/supervisorio_http.js` e `src/zimbra.js` faziam `https.request` **sem timeout algum**.
Uma resposta que nunca fecha deixa a promise pendente para sempre e trava o **processo MCP
inteiro**, não apenas a chamada.

Implementado timeout configurável (`timeoutMs`, default 30 s) com mensagem clara citando
host e endpoint, sem stack trace.

### Defeito encontrado pelo teste (e corrigido)

A primeira implementação usava apenas `req.setTimeout()`. O teste escrito para prová-la
**reprovou-a**: com `timeoutMs: 300`, a rejeição só acontecia em **~5000 ms**.

Causa: `req.setTimeout()` mede inatividade **do socket já conectado** — não cobre a fase
de *connect* TCP. Se o host estiver inalcançável ou descartando pacotes, o connect pende
no default do sistema operacional (~75 s) e o timeout configurado nunca dispara. Ou seja,
a proteção não cobria justamente o cenário que motivou a tarefa.

Correção: temporizador de **ciclo completo** (connect + resposta) com `setTimeout` global
`unref`ado, somado ao `req.setTimeout`, ambos convergindo para um único caminho de falha
idempotente, com `clearTimeout` no `close`. Medição após a correção: **330 ms** para um
`timeoutMs` de 300 ms.

Também corrigido `port: 443` hardcoded → `options.port || 443` (rigidez desnecessária que
ainda impedia qualquer teste local).

## T2 — TLS com validação ligada por padrão (CRÍTICO)

Ambos os clientes usavam `rejectUnauthorized: false`, desligando a verificação de
certificado para hosts de produção. Agora a validação é **padrão**, com escape hatch
`SANEAGO_INSECURE_TLS` opt-in estrito (`'1'`/`'true'`), no estilo das flags
`SANEAGO_ALLOW_*`. Em falha de handshake, a mensagem informa explicitamente que o host
pode usar CA interna e que a variável existe — o usuário não fica no escuro.

**Pendência (exige rede):** validar o TLS estrito contra o certificado real do portal.

## T3 — `saneago_eco709_consultar_logradouro` era um stub que declarava sucesso (CRÍTICO)

A tool abria a tela, executava um `frame.evaluate` que coletava `inputs` e `labels`
**sem usá-los**, e devolvia sempre `{status: "ECO709_ABERTO"}` envelopado em
`sucesso: true`. Não preenchia filtro, não executava consulta, não lia resultado — mas
reportava sucesso. Uma LLM confiaria nesse retorno e responderia ao usuário como se a
consulta tivesse acontecido. **Pior do que a tool não existir.**

Adotado o caminho (b) do pacote: a tool passou a ser **honesta**, retornando
`sucesso: false` e `status: "NAO_IMPLEMENTADO"` com orientação. Não é a solução ideal.

**Pendência prioritária (exige rede):** implementar a consulta de fato, reaproveitando
`docs/HTTP-ECO707-ECO709.md` e os scripts de `scratch/exploracao/eco/`.

## T4 — Volume sem limite

- `saneago_listar_aplicacoes`: filtro por texto + limite default 50.
- `saneago_docflow_listar_anexos`: limite default de 200 arquivos, com **truncamento
  sempre sinalizado** (`truncado: true`, `totalArquivos` real, `limiteAplicado`,
  `arquivosOmitidos` por pasta e mensagem orientando o parâmetro `limiteArquivos`).
  Corte silencioso é proibido — a LLM precisa saber que não viu tudo.

## T5 — Caminho absoluto hardcoded
`src/tools/asfalto_local.js` deixou de depender de `/Users/macbookmj/...`: agora usa
`ASFALTO_LOCAL_DIR` com fallback para o caminho atual, preservando o comportamento.

## T6 — Efeito colateral não declarado
A tool de leitura do supervisório escrevia cache em disco. A escrita saiu do caminho de
leitura; o cache passa a ser populado por script administrativo explícito.

---

## Provas

```
npm test   → # tests 80 / # pass 80 / # fail 0
npm run smoke → {"ok":true,"verificacoes":88,"tools":23}
git status  → idêntico antes e depois de ambos
node --check → todos os .js modificados compilam
```

Novo `test/timeout.test.js`: 4 casos que sobem um servidor TCP local que aceita a conexão
e nunca responde, exigindo rejeição **dentro do prazo configurado**. 100 % offline.

---

## Lição registrada: a suíte não substitui o smoke

Durante esta fase, `src/tools/eco709.js` foi gravado com todas as aspas escapadas
(`\"use strict\";`) e **não compilava**. Como `src/index.js` o importa, o servidor MCP
inteiro parou de subir.

Mesmo assim, **`npm test` passou 76/76**: nenhum teste importa esse módulo, então a suíte
não percebeu. Quem pegou foi o **`npm run smoke`**, que sobe o servidor de verdade.

Conclusões para o projeto:
1. Cobertura de teste não substitui um smoke que exercita o sistema montado.
2. Módulo sem teste é **invisível** para a suíte — e a suíte verde dá falsa segurança.
3. Rodar `node --check` após editar qualquer `.js` teria pego o erro na hora.

## Execução

Três execuções do AGY falharam sem entregar: uma foi interrompida no meio (deixando o
arquivo corrompido acima), outra saiu com exit 0 após imprimir uma única linha, e a
terceira repetiu o mesmo. Os itens P1-P4 foram concluídos pelo orquestrador.

**Nenhuma dessas falhas foi detectável pelo código de saída** — todas exigiram verificar
a existência dos entregáveis e subir o servidor. Isso motiva o trabalho de monitoramento.
