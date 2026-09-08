---
description: Fase 1 do mapeamento — inventaria telas do portal SEM clicar, com trilha de auditoria
---

# Mapeamento — Fase 1 (inventário, sem clique)

Uma rodada = **um lote de 3 aplicações**. Faça o lote e pare.

## O que esta fase é

Abrir a tela, olhar, anotar o que existe, fechar. O objetivo é produzir uma lista de
candidatas a somente-leitura para o **usuário aprovar**. Nada é exercitado nesta fase —
exercitar é a Fase 2, e só depois da aprovação dele.

## Proibições absolutas

1. **Não clique em nenhum botão.** Nem "Consultar", nem "Emitir", nem "Pesquisar".
   A tela inicial já mostra o que precisa ser inventariado, e um "Consultar" sem filtro
   pode disparar relatório pesado no servidor.
2. **Não preencha nenhum campo.** Nem para "testar se aceita".
3. **Nenhuma tool de escrita.** `saneago_preencher_campo`, `saneago_clicar_botao`,
   `saneago_abrir_ra`, `saneago_lrs105_lancar_servico` estão fora desta fase inteira.
   Se alguma flag `SANEAGO_ALLOW_*_WRITE` estiver ligada no ambiente, **pare e avise**.
4. **Não afirme nada que a evidência não mostre.** Vale para a ficha, para o `motivo`
   do JSONL, para a linha da safelist e para o diário. Todo rótulo de campo ou botão que
   você escrever tem de existir, idêntico, no `.inspect.json` daquela app. Em especial:
   **não afirme que existe botão "no DOM ZK" que a inspeção não retornou** — se a tela
   inicial só mostrou `Consultar`, o motivo da classe é a natureza da aplicação, não um
   DOM que ninguém viu. Isto é verificado por script (checagens C2 e C7).
5. **Não decida a classe de segurança final.** Você propõe; o usuário aprova.
6. **Não commite.** O revisor commita depois de auditar.

## A fila

`node scripts/backlog-mapeamento.js --proximo 3` devolve o próximo lote, já ordenado por
vertical de valor (ECO → LRS → PGT → resto). **Não escolha as apps você mesmo.**

## A rodada

1. Rode `node scripts/backlog-mapeamento.js --proximo 3`.
2. Para cada uma das 3 apps, **na ordem**:
   - Abra com `saneago_abrir_e_inspecionar` (código da app).
   - **Grave a evidência bruta ANTES de escrever qualquer outra coisa**:
     `docs/mapeamento/evidencias/<CODIGO>.inspect.json`, com o retorno **verbatim**
     da tool — sem editar, resumir, reordenar ou "limpar". Se a tool devolveu erro,
     grave o erro. Este arquivo é a fonte da verdade da auditoria.
   - A evidência **tem de conter o campo `url_real`** (a URL `.zul` do frame). A tool
     passou a devolvê-lo. Se vier ausente ou vazio, a evidência é inauditável: registre
     `erro` e trate a app como `bloqueada` — não deduza a URL do catálogo nem do código.
   - **Se não abrir** (menu ausente, permissão negada, erro ZK): classe `bloqueada`,
     com a mensagem literal do erro. Siga para a próxima. Não tente rotas alternativas
     nem force URL.
   - **Se abrir:** derive da evidência — a URL `.zul` real, cada campo (rótulo, tipo,
     editável/readonly), cada botão (rótulo literal) e qualquer aviso visível.
   - **Todo botão da evidência tem de ser declarado.** Os que você julgar não-acionáveis
     (abridores de combobox: `label: "Sem Rotulo"`, `tipo: "a"`, id `-btn` pareado a um
     campo `-real`) vão em `botoes_ignorados`, com o rótulo literal. Descartar em silêncio
     é o mecanismo que um dia esconde um botão de ação real.
3. Grave os artefatos por app:
   - `docs/apps/<CODIGO>.md` — ficha no formato de `docs/apps/ECO701.md`, com os dados
     reais. Marque `Status: inventariado`.
   - `config/roteiro.json` — entrada com `codigo`, `nome`, `url_zul`, `categoria`,
     `o_que_faz`, `tipo`, `campos[]`, `botoes[]`. Sem isto o MCP não enxerga a app em
     runtime — é o passo que os commits recentes vinham esquecendo.
   - `docs/SAFELIST_LEITURA.md` — uma linha por app na seção `## Aguardando aprovação`:
     código, nome, botões encontrados, classe proposta, motivo. Se o arquivo não existir,
     crie com as seções `## Aprovadas para Fase 2`, `## Aguardando aprovação`, `## Recusadas`.
4. **Classe proposta** — na dúvida, sempre a opção mais restritiva:
   - `somente_leitura` — todos os botões são de consulta/emissão e nenhum campo grava estado.
   - `possui_escrita` — existe botão de Incluir/Gravar/Alterar/Excluir/Confirmar/Tramitar/
     Enviar, **ou** um botão cujo efeito você não consegue determinar sem clicar.
     Ambiguidade cai aqui, nunca em `somente_leitura`.
   - `sem_campos_confirmado` — a tela abriu e de fato não tem campo nem botão de ação.
     Só use com evidência bruta que comprove; é estado final legítimo.
   - `sem_acesso` — abriu mas nega permissão para o perfil atual.
   - `bloqueada` — não abriu.

## Auditoria (obrigatória — é o que permite revisar sem refazer)

5. Para **cada** app, acrescente **uma linha** em `docs/mapeamento/AUDITORIA.jsonl`
   (append-only: nunca reescreva nem reordene linhas anteriores):

   ```json
   {"ts":"<ISO8601>","lote":"<id>","executor":"omniclaude","codigo":"<COD>","url_zul":"<url real ou null>","n_campos":0,"n_botoes":0,"botoes":[],"botoes_ignorados":[],"classe_proposta":"<classe>","motivo":"<1 linha>","arquivos":["docs/apps/X.md","config/roteiro.json"],"sha256_evidencia":"<hash>","sha256_ficha":"<hash>","erro":null}
   ```

   Hashes com `shasum -a 256 <arquivo>`. `sha256_evidencia` é do `.inspect.json`.

6. Ao fim do lote, escreva o diário em `docs/mapeamento/lotes/<AAAA-MM-DD>-lote-<N>.md`:
   o que tentou, o que bloqueou, decisões tomadas, dúvidas para o gate humano. Prosa
   curta — é o contexto que o JSONL não carrega.

7. Verifique e registre a prova antes de encerrar:
   - `node -e "require('./config/roteiro.json')"` — JSON válido.
   - `npm test` — 0 falhas.
   - `node scripts/auditar-mapeamento.js` — 0 divergências.
   Cole o comando e a saída (ou o tail) no diário do lote. Se qualquer um falhar,
   conserte antes de parar; se não conseguir, registre como pendência e pare.
8. Rode `node scripts/backlog-mapeamento.js` para atualizar o backlog.

## Sessão

Se o login falhar ou a sessão expirar no meio do lote, **pare a rodada imediatamente**
e reporte. Não continue: tela que não carrega vira ficha vazia, e ficha vazia é pior que
ficha ausente — some do backlog como se estivesse pronta.

## Saída da rodada

Máximo 6 linhas: as 3 apps, a classe proposta de cada, quantas entraram no roteiro, o
resultado de `npm test` e de `auditar-mapeamento.js`, e quantas faltam no backlog.
Sem relatório longo.
