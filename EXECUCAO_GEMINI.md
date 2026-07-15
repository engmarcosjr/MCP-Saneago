# Brief de Execução Autônoma — MCP-Saneago (para o Gemini)

Você vai trabalhar de forma autônoma e longa, executando as fases abaixo em ordem, sem esperar aprovação entre elas. O usuário só revisa **no final**. Portanto: capriche no registro e **pare com segurança** quando travar (ver seção "VÁLVULA DE SEGURANÇA"). Não invente, não force, não caia para replay de `/zkau`.

Leia antes de começar: `PLAN.md`, `Review-Claude.md` (especialmente a seção "CORREÇÃO DE RUMO"), e `PROGRESSO.md`.

---

## Objetivo final
Expor **todas as aplicações do portal ZK** que o perfil do usuário acessa, como **tools de negócio em linguagem natural**. Exemplos que o usuário quer conseguir falar:
- "abre uma RA na rua tal" (escrita — ECO701)
- "qual o volume consumido pela conta X" (leitura)
- "verifique o asfalto lançado da RA da rua tal, dia tal" (leitura)

Escopo: **apenas portal ZK** (ECO7xx/ECO6xx e afins). Nada de SanVAWeb/Qlik nesta rodada.

### DIRETRIZ CENTRAL (esclarecida pelo usuário)
O usuário **NÃO quer nomear a aplicação**. Ele fala a intenção em linguagem natural e o MCP deve descobrir sozinho qual app usar e como operá-la. Para isso, a entrega mais importante é um **ROTEIRO ESTRUTURADO** (uma "memória") que documenta, para **cada uma das ~54 apps**: o que faz, seus campos, e como executar cada operação. Esse roteiro é o que permite o LLM **rotear** intenção → app → passos sem o usuário citar código. As verticais (ECO303/LRS041/ECO701) continuam, mas o roteiro cobre TODAS as apps.

## Princípio de arquitetura (não negocie)
Cada intenção em linguagem natural = **uma tool de negócio (vertical)** com o fluxo daquela tela mapeado e **provado ponta a ponta**, no padrão do `saneago_eco701_consultar_ra`. As tools genéricas (abrir/preencher/clicar) são de apoio, não a entrega. Interação sempre por **UI viva (Playwright)**, nunca replay manual de `/zkau`. Read-only por padrão; escrita só sob `SANEAGO_ALLOW_WRITE` com confirmação + auditoria.

---

## FASE 1 — Descoberta de todas as aplicações
Criar `src/discover.js` (reusa `getOrCreateSession`) que enumera TODAS as apps do perfil e regenera `config/catalogo_aplicacoes.json`. Fontes, da mais limpa à mais bruta (documente qual funcionou):
1. Frame `montarMenu.zul` — extrair código + nome + `.zul` de destino de cada app.
2. Endpoint de menu na rede (`page.on('response')` no load de `principal.zul`) — se vier JSON com a lista, use.
3. Fallback: varrer a busca "Buscar..." por prefixos (ECO, SAN, MTG, PSS, A–Z) e agregar `z-listitem` únicos.

Saída: array `[{codigo, nome, url_zul, origem}]`, deduplicado e ordenado.
**Prova:** rode de verdade; grave em `PROGRESSO.md` o comando, a contagem de apps, a fonte usada e ~10 amostras.
Commit: `feat: descoberta automatica de todas as aplicacoes ZK`.

## FASE 1.5 — ROTEIRO ESTRUTURADO de TODAS as apps (entrega central)
Documente as ~54 apps de forma semi-automática. Para cada app do catálogo:
1. Abrir + **inspecionar SÓ a tela inicial** (não clicar em botões de ação — evita efeito colateral/escrita).
2. Autogerar uma entrada de roteiro com o que dá para inferir: campos (label+tipo), botões, `o_que_faz` (a partir do nome + campos), `categoria`, `tipo` (leitura/escrita/misto).
3. Marcar `status_doc: "auto"` (rascunho) — apps que precisam de detalhe humano ficam sinalizadas.

**Saídas:**
- `config/roteiro.json` — mapa legível por máquina, keyed por código:
  `{ codigo, nome, url_zul, categoria, o_que_faz, tipo, campos:[{label,tipo}], botoes:[], operacoes:[{intencao, passos:[]}], exemplos_intencao:[], status_doc }`
- `docs/apps/<CODIGO>.md` — versão humana ("memória") de cada app: o que faz e como fazer cada operação, em passos.

**Nova tool MCP de roteamento** (`src/index.js`), sempre disponível (read-only):
- `saneago_consultar_roteiro({ intencao?, codigo? })` → retorna as apps/operações que casam com a intenção (busca no `roteiro.json` por `exemplos_intencao`, `o_que_faz`, `nome`), com os passos de como fazer. É isso que permite o LLM achar a app sem o usuário nomear.
- Ajuste `saneago_abrir_e_inspecionar` para aceitar também uma **intenção** (não só código): se vier intenção, consulta o roteiro, escolhe a app e abre.

**Como isso torna o MCP capaz de "falar com todas as apps":** com o roteiro, o LLM não precisa de uma vertical por app — ele lê os passos documentados e dirige a tela pelas tools genéricas (abrir → preencher por rótulo → clicar → inspecionar). As verticais ficam só para os fluxos mais usados/críticos.

Rode em lotes; **prove** abrindo/inspecionando de verdade e cole no PROGRESSO a contagem de apps documentadas e 2 exemplos de entrada de roteiro. Commit(s): `feat: roteiro estruturado das apps + tool de roteamento`.
Se muitas apps não abrirem/derem erro em sequência, **pare e peça ajuda** (não force as 54 no braço).

## FASE 2 — Mapa de intenções
Com o catálogo completo, para cada um dos 3 exemplos do usuário, **identifique qual app/tela** serve a intenção (procure no catálogo por nome; se preciso, abra a tela e inspecione). Escreva em `PROGRESSO.md` uma tabela: intenção → app/código → tela `.zul` → leitura/escrita → campos-chave.
- Se não conseguir identificar com confiança qual app serve uma intenção → **pare e peça ajuda** (não chute).
Commit: `docs: mapa de intencoes -> apps`.

## FASE 3 — Verticais de LEITURA (uma a uma)
Construa, nesta ordem, cada tool provando E2E antes de passar à próxima:
1. `saneago_consultar_consumo(conta)` — volume consumido pela conta. Read-only, sempre disponível.
2. `saneago_asfalto_da_ra(ra | rua, data)` — asfalto lançado. Read-only, sempre disponível.

Para CADA vertical:
- Localize campos por **rótulo/texto** (heurística do `co701_consultar_ra`), nunca por UUID fixo.
- Registre a tool em `src/index.js` **fora** do gate de escrita (leitura é sempre disponível).
- **Prove E2E**: rode com um valor real e cole no `PROGRESSO.md` o comando + saída resumida (mascarando PII — nomes/telefones parciais).
- Commit por vertical: `feat: vertical <nome> (read-only) + prova E2E`.

## FASE 4 — Verticais de ESCRITA (por último, com trava)
1. `saneago_abrir_ra(endereco, servico, ...)` — cria/abre RA no ECO701. **Escrita.**
- Só registrada/executada sob `SANEAGO_ALLOW_WRITE`.
- Antes de submeter, a tool deve montar um **resumo do que vai fazer** e exigir um parâmetro explícito `confirmar: true`; sem ele, apenas descreve e não submete.
- Toda execução passa por `logAudit`.
- **Prova E2E de escrita é delicada:** NÃO crie uma RA real de teste sem o usuário. Para esta fase, valide até o ponto **imediatamente antes** de submeter (preencher + mostrar o resumo) e **pare pedindo ajuda** para o usuário fazer a submissão real supervisionada.
Commit: `feat: vertical abrir_ra (escrita, gated) — validado ate pre-submit`.

## FASE 5 — Fechamento
Atualize `PROGRESSO.md` com: lista de tools entregues, prova E2E de cada uma, e o que ficou pendente. Rode `git log --oneline`. Deixe um resumo em `PROGRESSO.md` sob o título `## PARA REVISAO CLAUDE` listando cada entrega e onde está a prova.

---

## VÁLVULA DE SEGURANÇA (leia com atenção)
**Pare e peça ajuda** — não continue no braço, não fique em loop, não chute, não use replay de `/zkau` — quando bater em qualquer um destes:
- Login/sessão falha 2 vezes seguidas.
- Descoberta (Fase 1) não devolve nada parseável pelas 3 fontes.
- Não consegue identificar com confiança qual app serve uma intenção (Fase 2).
- Um campo/botão necessário não é encontrado por rótulo após heurística razoável.
- Qualquer ação de LEITURA que, para prosseguir, exigiria submeter/alterar/apagar dado.
- Você chegaria a criar uma RA real ou qualquer escrita irreversível sem confirmação explícita do usuário.
- Qualquer decisão que só o usuário pode tomar (ex.: qual conta/RA usar como exemplo real).

**Como pedir ajuda ao parar:** crie/atualize `PEDIDO_AJUDA.md` com:
1. Em que fase/tarefa estava.
2. O que tentou (fontes, seletores, comandos).
3. O bloqueio exato (mensagem de erro / o que não achou).
4. Screenshots/HTML de apoio (só sob `DEBUG=1`, em `data/`).
5. A **pergunta específica** que precisa ser respondida para destravar.
Depois **pare** essa tarefa e siga para a próxima que seja independente, se houver; se não houver, encerre deixando claro o que falta.

## Regras gerais
- Um commit por entrega, mensagem no formato indicado, corpo "o que fez / como testou / pendências".
- **Após cada commit, dê `git push`** (o repo já tem remoto `origin` = https://github.com/engmarcosjr/MCP-Saneago, privado, branch `master`). Se o push falhar, registre no PROGRESSO e siga; não force push.
- `PROGRESSO.md` sempre atualizado; registre desvios (não altere `PLAN.md` em silêncio).
- Nunca commite PII real, credenciais, cookies ou `audit.log`. Debug só sob `DEBUG=1` em `data/` (gitignorado).
- Nunca replay manual de `/zkau`. Sempre UI viva.
- Read-only por padrão; escrita só sob `SANEAGO_ALLOW_WRITE` + confirmação + auditoria.
