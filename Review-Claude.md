# Review-Claude.md — Guia de revisão do MCP-Saneago

> **Este arquivo é meu (Claude), não do Gemini.** O `PLAN.md` é o documento de execução entregue ao Gemini. Este aqui é o roteiro para eu revisar o que o Gemini construir. Não é para o Gemini seguir.

---

## 0. Situação

- **Projeto:** `C:\repos\MCP-Saneago` — servidor MCP que conecta um LLM ao portal ZK da Intranet Saneago.
- **Quem executa:** Gemini (Antigravity/CLI), seguindo `PLAN.md`.
- **Quem revisa:** eu (Claude), usando este arquivo.
- **Status inicial:** repo só tinha `PLAN.md`. Eu reescrevi o `PLAN.md` corrigindo a abordagem e criei este guia.

## 1. Por que o plano foi corrigido (contexto que não pode se perder)

O plano original propunha coisas que os próprios projetos do usuário já provaram estar erradas. Correções aplicadas ao `PLAN.md`:

1. **`/zkau` direto é anti-padrão.** O plano original (Etapa 4) mandava montar POST manual em `/prt/zkau` com `cmd_0`/`data_0`/`uuid`. Isso contradiz o `SANEAGO ZKAU\ANATOMIA_ZKAU.md` ("replay direto é frágil, quebra quando a tela muda") e o `co701_discover.js`, que **funciona** dirigindo a UI viva com Playwright. → Executor deve usar UI viva, nunca replay de `/zkau`.
2. **Telas ZK abrem em `iframe`.** Não há `GET` direto no `.zul`. A tela carrega em `iframe[src*="...zul"]`. Inspector/executor operam sobre o `frame`, não sobre a página raiz.
3. **Navegação é por busca de app, não por URL.** Abre-se digitando o nome de exibição (ex.: `ECO701 - REGISTRO DE ATENDIMENTO`) num campo de busca e clicando na opção.
4. **"Reuso do PORTAL_LEGADO" é enganoso.** PORTAL_LEGADO autentica no **SanVAWeb** (terminal legado, comandos `PFxx`) — outro sistema. Só o bootstrap de sessão (`session.js`: login headless + `storageState`) é reutilizável.
5. **IDs/UUIDs ZK são dinâmicos.** Localizar campos por rótulo/texto próximo, nunca por UUID fixo.
6. **Stealth/anti-WAF é overkill.** O `co701_discover.js` loga com `chromium.launch({headless:true})` simples e funciona. Removido do plano.
7. **Segurança ausente no original.** Adicionado: read-only antes de escrita; confirmação + `audit.log` para escrita; nunca operar fora do perfil autorizado.
8. **Vertical primeiro.** Começar por `saneago_eco701_consultar_ra` (envelopa o `co701_discover.js`) para provar o encanamento MCP antes de generalizar.

## 2. Arquivos de referência (a fonte da verdade técnica)

- `C:\repos\6060-check\co701_discover.js` — padrão ZK que funciona (portal → iframe → campo por rótulo → consulta).
- `...\DEV_SAN\PORTAL_LEGADO\src\session.js` — bootstrap de login/sessão reutilizável.
- `...\DEV_SAN\SANEAGO ZKAU\ANATOMIA_ZKAU.md` — limites e por que não replayar `/zkau`.
- `...\DEV_SAN\SANEAGO ZKAU\PLAYBOOK_REQUISICOES_AUTORIZADAS.md` — padrão de sessão/requisição autorizada.
- Memórias relacionadas: `eco701-portal-intranet`, `download-ra-eco701`, `qlik-qsense-consulta` (todas rodam LOCAL, na rede Saneago).

## 3. Instruções que foram passadas ao Gemini

- Uma etapa por vez (ordem da seção 5 do PLAN.md); parar ao fim de cada etapa.
- Um commit por etapa: `etapa N: <o que fez>`, corpo com "o que fez / como testou / pendências".
- Manter `PROGRESSO.md` (status por etapa, arquivos tocados, comando de teste, saída, desvios justificados).
- Desvios do plano: registrar no PROGRESSO.md, não mudar o PLAN.md silenciosamente.
- Ao travar no portal (login/iframe/campo): parar e documentar, sem loop e sem cair para replay `/zkau`.

## 4. Checklist de revisão (o que eu confiro depois)

- [ ] `PROGRESSO.md` existe e cobre cada etapa com teste e saída.
- [ ] `git log --oneline` — um commit por etapa, mensagens no formato combinado.
- [ ] **Princípio 1:** nenhum POST `/zkau` montado à mão (grep por `zkau`, `cmd_0`, `data_0` no código; se aparecer em construção de request → reprovar).
- [ ] **Princípio 2:** read-only implementado e testado antes de qualquer tool de escrita.
- [ ] **Princípio 4:** campos localizados por rótulo/texto, não por UUID fixo.
- [ ] Inspector/executor operam sobre o `frame` do iframe, não a página raiz.
- [ ] Navegação por busca de app (nome de exibição), não por URL do `.zul`.
- [ ] Sem flags de stealth/anti-WAF.
- [ ] `.gitignore` protege `.auth/` e `config/credentials.json`; nada de segredo commitado (checar `git log -p` por credenciais/cookies).
- [ ] Escrita: confirmação explícita + gravação em `.auth/audit.log`.
- [ ] Cada etapa bate com seu "Critério de aceite" no PLAN.md.

## 5. Prova de fogo (teste real de ponta a ponta)

Rodar/inspecionar a tool `saneago_eco701_consultar_ra` com uma RA real. Precisa: rede Saneago (VM Google não serve — portal bloqueado), `config/credentials.json` presente. Confirmar que devolve os campos da RA **sem** ter montado request `/zkau`.

## 6. Riscos conhecidos a vigiar na revisão

- Gemini pode "otimizar" para HTTP direto/`/zkau` alegando velocidade → reprovar, é o erro nº1.
- Pode fiar em `id`/`uuid` capturados numa sessão → quebram na próxima.
- Pode tentar contornar login (stealth, credenciais hardcoded) se não tiver rede/credencial → reprovar e pedir ambiente correto.
- Pode emendar todas as etapas num commit só → dificulta revisão; pedir para fatiar.

---

# REVISÃO 1 — 2026-07-15 (Claude)

Revisado após Gemini concluir as 6 etapas (commits `42795ef`..`ccd639b`). Estrutura boa e disciplina de commits ok (1 por etapa). **Mas há 1 bug fatal, 0 validação real e a camada de segurança não foi feita. Reprovado para uso; precisa de correção.**

## ✅ Passou
- **Princípio 1 (o mais importante):** executor usa UI viva (`.click()`/`.fill()`/`.blur()` + espera AJAX). **Zero replay de `/zkau` montado à mão.** Correto.
- Commits fatiados por etapa, mensagens ok.
- `.gitignore` cobre `.auth/`, `config/credentials.json`, `*.png`, `*.log`; nenhum segredo commitado; `data/` está untracked (`git status` = `?? data/`).
- Inspector infere `label` por proximidade de `.z-label` (atende parcialmente "âncora por rótulo").
- `session.js` reusa `storageState`, mantém browser vivo, trata login/expiração de senha.

## ❌ Crítico (bloqueia uso)
1. **`console.log` corrompe o protocolo MCP (fatal).** 23 ocorrências em `session.js`/`portal.js`/`inspector.js`/`executor.js`. Num servidor MCP stdio, **stdout é o canal JSON-RPC** — qualquer `console.log` quebra o cliente na 1ª chamada de tool. Devem virar `console.error` (stderr). O banner em `index.js` já usa `console.error` corretamente; o resto não.
2. **Nunca foi validado end-to-end.** `PROGRESSO.md` diz "estruturalmente pronto para testes" — ou seja, **não rodou contra o portal de verdade**. Não há evidência de que consulta uma RA. Os `data/debug_*.png/html` sugerem que a UI deu trabalho. A prova de fogo (`saneago_eco701_consultar_ra`) foi trocada por tools genéricas e nunca exercida.
3. **Camada de segurança do plano ausente.** `preencher_campo`/`clicar_botao` executam direto: **sem separação read-only vs escrita, sem confirmação, sem `audit.js`/`audit.log`.** Contraria os princípios 2/3 e a seção 4 do PLAN.md.

## ⚠️ Menor / dívida
4. **Portal mudou** ("Rede Social Corporativa", placeholder `Buscar...`, `getByRole('row')`) — `portal.js` divergiu do `co701_discover.js`. **Desvio não registrado no PROGRESSO.md** (era obrigatório). Precisa provar que a abertura de app funciona nessa UI nova.
5. **Escrita de debug no caminho de produção:** `abrirApp` grava screenshot + HTML autenticado a cada chamada. Poluição e dado autenticado em disco. Colocar `data/` no `.gitignore` e condicionar debug a uma flag `DEBUG`.
6. **Âncora por `id` ZK:** aceitável só porque inspeciona→age no mesmo frame vivo e re-inspeciona após clicar. Documentar que o `id` só vale na sessão viva atual; nunca persistir/reusar entre sessões.
7. `PROGRESSO.md` raso: sem comando de teste, sem saída, sem desvios. Não seguiu o combinado.
8. Sem testes offline reais em `tests/` (os `test_stageN.js` exigem portal). Singleton global `activeFrame`/`activePage` (ok p/ 1 usuário).

## Próximos passos exigidos (viram o prompt do Gemini)
1. Trocar todo `console.log` por `console.error` em `src/*.js` (exceto stdout do protocolo).
2. Adicionar `data/` ao `.gitignore`; remover escrita de debug do fluxo normal (só sob `DEBUG=1`).
3. Implementar `src/audit.js` + gate de confirmação para escrita; flag `SANEAGO_ALLOW_WRITE` (default off) que só então registra as tools de escrita.
4. Criar tool vertical `saneago_eco701_consultar_ra(RA)` e **rodar de verdade** contra o portal; colar no `PROGRESSO.md` o comando e a saída (campos da RA).
5. Registrar no `PROGRESSO.md` o desvio da UI nova do portal, com o que foi testado.

---

# REVISÃO 2 — 2026-07-15 (Claude)

Revisado após Gemini corrigir a Revisão 1 (commits `1742423`..`177a9ec`). **Os 3 bloqueios da Rev 1 foram resolvidos e o E2E foi provado de verdade. Aprovado com 2 correções (uma regressão de design + 1 privacidade).**

## ✅ Corrigido / provado
1. **`console.log` → `console.error`:** zero `console.log` restante em `src/` (fora de testes). Protocolo MCP stdio não será mais corrompido. ✅
2. **E2E REAL — o item que faltava.** `node src/test_e2e.js 1812692026` rodou contra o portal e devolveu dados reais da tela (conta, CEP, nome, telefone, observação com histórico de cancelamento). **O encanamento inteiro funciona ponta a ponta.** Prova colada no `PROGRESSO.md`. ✅
3. **Gate de escrita + auditoria:** `SANEAGO_ALLOW_WRITE` (default off); `src/audit.js` grava em `.auth/audit.log` (gitignorado); tools de escrita envelopadas em try/catch com log de SUCESSO/ERRO. ✅
4. **`data/` no `.gitignore`** e debug sob flag. Sem artefatos untracked. ✅
5. **Desvio da UI ("Rede Social Corporativa") documentado** no `PROGRESSO.md` (busca por `Buscar...`, z-listbox, iframes aninhados `montarMenu.zul`→`.zul`). ✅

## ❌ Correções pendentes
6. **REGRESSÃO — tool de leitura trancada atrás do write gate.** `saneago_eco701_consultar_ra` é **consulta (read-only)**, mas está dentro do bloco `if (ALLOW_WRITE)` (registro na linha ~97) e com `if (!ALLOW_WRITE) throw` (linha ~206). Resultado: em modo read-only o LLM **nem enxerga nem executa** a tool que é justamente a prova segura do projeto. Consultar um RA não altera dado. Mover `saneago_eco701_consultar_ra` para as tools **sempre disponíveis** (junto de `listar_aplicacoes` e `abrir_e_inspecionar`) e remover o `if (!ALLOW_WRITE) throw` do case dela. Só `preencher_campo` e `clicar_botao` ficam atrás do gate.
7. **PRIVACIDADE — dado pessoal real commitado.** `PROGRESSO.md` (git-tracked) contém nome e telefone reais de um cidadão (RA 1812692026: "LUIS CLAUDIO", telefone). Mascarar na saída de exemplo (ex.: `LUIS C***`, `(62) 9****-5739`) e evitar colar PII real em arquivo versionado. Obs.: já entrou no histórico do git; para uso interno/privado basta mascarar daqui pra frente, mas não colar RA real de novo.

## Veredito
Núcleo **funciona e está provado**. Faltam só os itens 6 (5 min, corrige a lógica read-only) e 7 (higiene de PII). Depois disso, considero pronto para uso interno em modo read-only, e escrita só sob `SANEAGO_ALLOW_WRITE` com supervisão.

---

# REVISÃO 3 (fechamento) — 2026-07-15 (Claude)

Commits `3b1b599` e `b94313a`. **APROVADO. Pronto para uso interno.**

- Item 6 ✅ `saneago_eco701_consultar_ra` agora registrada FORA do `if (ALLOW_WRITE)` (linha ~61, sempre disponível) e o `if (!ALLOW_WRITE) throw` foi removido do case dela; o gate permanece só em `preencher_campo`/`clicar_botao`.
- Item 7 ✅ PII mascarada no `PROGRESSO.md` ("LUIS C***", telefone/observação removidos).

**Estado final:** UI viva sem replay `/zkau`; E2E provado; read-only por padrão (listar, abrir/inspecionar, consultar RA); escrita só sob `SANEAGO_ALLOW_WRITE` com auditoria em `.auth/audit.log`. Sem pendências de revisão. Melhorias futuras opcionais (não bloqueiam): tratar sessão expirada no meio da operação; testes offline em `tests/`; nota de que o `id` ZK só vale na sessão viva atual.

---

# CORREÇÃO DE RUMO — 2026-07-15 (Claude)

**O objetivo real do usuário:** que o MCP exponha TODAS as aplicações do portal ZK, ao ponto de falar em linguagem natural ("abre uma RA na rua tal", "volume consumido da conta X", "asfalto lançado da RA/dia"). Escopo confirmado: **só portal ZK** (ECO7xx/ECO6xx...).

**Gap descoberto:** a Etapa 2 (crawler/descoberta) do PLAN.md **nunca foi feita de verdade** — o Gemini curou 3 apps à mão. Falta o **levantamento automático de todas as aplicações** que o perfil do usuário acessa.

**Arquitetura correta para o objetivo (reforço):** cada intenção em linguagem natural = **uma tool de negócio (vertical)** mapeada e provada E2E, como o `eco701_consultar_ra`. As tools genéricas (abrir/preencher/clicar) não servem para "abre uma RA na rua tal" — muito frágil. O caminho é: (1) descobrir TODAS as apps, (2) construir verticais uma a uma pela lista real.

## PRÓXIMA TAREFA — Script de descoberta (Etapa 2 refeita)
Criar `src/discover.js` que enumera TODAS as aplicações visíveis ao perfil e regenera `config/catalogo_aplicacoes.json`. Fontes, da mais limpa à mais bruta:
1. Frame `montarMenu.zul` (construtor do menu) — extrair código + nome + `.zul` de cada app.
2. Capturar rede no load do portal (`page.on('response')`) — se houver endpoint JSON de menu, usar (padrão ANATOMIA_ZKAU).
3. Fallback: varrer a busca "Buscar..." por prefixos e agregar `z-listitem` únicos.

Saída: array `[{codigo, nome, url_zul, origem}]`, deduplicado e ordenado. Rodar de verdade, colar no PROGRESSO.md a **contagem** de apps e uma amostra. **Depois** disso, priorizar verticais pela lista real.

**Ao revisar (Revisão 4):** confirmar que `discover.js` rodou contra o portal, que o catálogo tem N>>3 apps reais, e que a fonte usada não foi replay manual de `/zkau`.

---

# REVISÃO 4 — 2026-07-15 (Claude)

Revisado a execução autônoma pós "Correção de Rumo" (commits `6dea3f6`..`859a8e9`, FASES 1→4 do `EXECUCAO_GEMINI.md`). **A descoberta e o roteiro (entrega central) estão bons e provados. Mas 2 das 3 verticais novas têm defeitos que bloqueiam uso: uma tool está invisível ao LLM e outra pode abrir RA em endereço errado. Aprovado parcialmente; 3 correções obrigatórias.**

## ✅ Passou
1. **FASE 1/1.5 — descoberta real e completa.** `src/discover.js` (menu `montarMenu.zul` + busca refinada) gerou catálogo com **337 apps** (verifiquei o JSON: 337 entradas, ECO701 incluída). Sem replay `/zkau` — as ocorrências de `zkau` no código são só `waitForResponse` (espera de AJAX, legítimo).
2. **Roteiro estruturado + roteamento por intenção.** `config/roteiro.json` com 54 apps (51 `auto`, 3 `enriquecido`), 54 markdowns em `docs/apps/`, tool `saneago_consultar_roteiro` read-only sempre disponível, e `saneago_abrir_e_inspecionar` aceitando intenção. É a arquitetura pedida.
3. **Reprocessamento:** 9/10 apps falhas corrigidas via ajuste de detecção de iframe no `portal.js`; `LIG002` documentada como exceção plausível (mapa GIS externo).
4. **Higiene de protocolo MCP:** zero `console.log` nos módulos carregados pelo servidor (`index/portal/session/inspector/executor/audit/tools`); os `console.log` restantes estão só em scripts CLI standalone (`discover.js`, `generate_roteiro.js` etc.), que não rodam sob stdio MCP. OK.
5. **Gate de escrita preservado:** `preencher_campo`/`clicar_botao`/`abrir_ra` só sob `SANEAGO_ALLOW_WRITE`; `abrir_ra` exige `confirmar: true` + auditoria; e o Gemini **parou corretamente antes de submeter RA real** (PEDIDO_AJUDA.md), como mandava a FASE 4.
6. `scratch/` no `.gitignore`; nenhum segredo novo commitado.

## ❌ Correções obrigatórias (bloqueiam uso)
1. **`saneago_asfalto_da_ra` está INVISÍVEL ao LLM.** O `case` existe no CallTool (`src/index.js:371`), mas a tool **não foi adicionada ao array do ListTools** (nem no bloco read-only nem no de escrita). Resultado: o cliente MCP nunca lista a tool e a intenção "asfalto lançado" não funciona. Adicionar a definição dela ao bloco de tools sempre disponíveis (é read-only).
2. **A vertical LRS041 não implementa o fluxo que foi provado.** A prova E2E do PROGRESSO usou `scratch/find_ra_in_lrs041_pages.js`: consultou o RA no ECO701 para obter **cidade + data**, preencheu LRS041 por cidade/período e **paginou 21 páginas** da tabela de lotes. Já a tool `consultarAsfalto` (`src/tools/lrs041.js:21-24`) apenas preenche **"o primeiro input de texto editável"** com o RA e clica Consultar — heurística **posicional** (viola o princípio nº 5 de âncora por rótulo) e **sem paginação**. Ou seja: a prova não prova a tool; a tool como está provavelmente não devolve o asfalto de uma RA. Portar para a tool o fluxo real do scratch (ECO701 → cidade/data → LRS041 → paginação até achar a RA).
3. **`abrirRA` tem endereço hardcoded como default — risco de RA em endereço ERRADO.** `src/tools/eco701.js:30-31`: `cep = "75040050"` e `numero = "550"` ("default para Ada Centine"). Se o usuário passar um endereço **sem CEP** (caso normal: "abre uma RA na rua tal"), a tool preenche silenciosamente o CEP da Rua Ada Centini e prepara/submete a RA **no lugar errado**. Para uma tool de ESCRITA isso é inaceitável. Corrigir: sem CEP extraível → **falhar pedindo o CEP** (ou resolver rua→CEP explicitamente); nunca assumir default. Idem `numero`.

## ⚠️ Menor / dívida (não bloqueiam)
4. **Roteiro cobre 54 de 337 apps.** O brief pedia ~54 (foi escrito quando o catálogo tinha 54), então não é descumprimento — mas o `PROGRESSO.md` deve declarar explicitamente que **283 apps do catálogo estão sem roteiro** (pendência futura), senão a frase "roteiro de todas as apps" engana.
5. **Provas E2E vivem em `scratch/` gitignorado** — os scripts de prova não estão versionados; a evidência não é reproduzível a partir do repo. Considerar mover os testes E2E "oficiais" para `tests/e2e/` versionado (sem PII).
6. **PII leve no `PROGRESSO.md`:** conta real `1813366` + nº de hidrômetro + endereços residenciais com quadra/lote. Menos sensível que nome/telefone, mas seguir mascarando (ex.: `18133**`).
7. **Caminho pós-submit do `abrirRA` nunca foi executado** (clique em "Gerar RA" + captura do popup) — código não provado. Esperado nesta fase; validar na submissão supervisionada.
8. **`servico` sem validação** no `abrirRA`: espera código numérico (ex.: `2002`) num `z-intbox`, mas aceita texto livre sem checar.

## Pendência que é DO USUÁRIO (PEDIDO_AJUDA.md)
- Fornecer conta/RA/data reais para E2E adicionais e decidir quando fazer a **submissão supervisionada** da primeira RA real (FASE 4). Recomendo só depois das correções 1–3.

## Veredito
Descoberta + roteiro + roteamento: **aprovados**. Verticais: `consultar_consumo` ok; `asfalto_da_ra` e `abrir_ra` **reprovadas até corrigir os itens 1–3** (itens 1 e 3 são rápidos; o 2 exige portar o fluxo do scratch para a tool). Os itens 1–3 viram o próximo prompt do Gemini.

---

# REVISÃO 5 — 2026-07-15 (Claude)

Revisado o pacote de correções da Rev 4 (commits `75148be`..`cea4542`, executado pelo AGY2 em sessão sandbox sem rede). **APROVADO após correções substanciais do revisor** — o AGY entregou a estrutura certa dos 3 itens, mas sem E2E (sandbox sem credenciais), e o E2E real revelou 4 defeitos que corrigi e provei.

## ✅ Do AGY (passou)
- Item 1: `saneago_asfalto_da_ra` no ListTools read-only — correto.
- Item 3: validação obrigatória de CEP/número no `abrirRA` — direção certa (com 1 bug, abaixo).
- Item 2: estrutura do fluxo ECO701→LRS041 portada — mas não funcionava de ponta a ponta.
- PROGRESSO.md com a nota das 283 apps sem roteiro; disciplina de 1 commit por item.

## 🔧 Correções do revisor (detalhes no PROGRESSO.md, seção "REVISÃO 5")
1. `portal.js`: regressão do frame-finder (aceitava o `index.html` da home; quebrava qualquer app ZK, inclusive a `eco701_consultar_ra` aprovada na Rev 3). Duas fases: `.zul` primeiro.
2. `eco701.js`: regex de número podia capturar pedaço do CEP; validação movida para antes de abrir o portal.
3. `lrs041.js`: lia campo inexistente (`valor` vs `valor_atual`) e rótulo sem normalizar acento; faltava clicar no lote para abrir o detalhe; o detalhe não pagina — rola (render on demand); seletor `button.z-paging-next` nunca casava.
4. Polling em vez de esperas fixas nos 3 pontos de carregamento assíncrono.

## Prova de fogo (rodada pelo revisor, rede Saneago)
`consultarAsfalto("27273762025")` → cidade 2 e data 29/09/2025 inferidas do ECO701; RA encontrada no detalhe do LRS041 (corte 29/09/2025, `2125 - VAZAMENTO REDE DE AGUA RECUPERADO`, 1.50×7.00, 10,5 m², Residencial Florença). `abrirRA` sem CEP/número falha pedindo o dado (validado em 4 formatos).

## Estado
As 3 verticais de leitura funcionam provadas E2E. Pendências (não bloqueiam): varrer múltiplos lotes no LRS041 (hoje abre só o primeiro); submissão supervisionada da primeira RA real (FASE 4, decisão do usuário).
