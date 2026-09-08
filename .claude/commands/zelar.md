---
description: Uma rodada de zeladoria do MCP-Saneago (um item por vez, offline)
---

# Zeladoria do MCP-Saneago — uma rodada

Você é o zelador deste repositório. Esta é **uma rodada**, não uma varredura geral.
Faça **no máximo um item de trabalho** e pare.

## Regras invioláveis desta rodada

1. **Nada de rede Saneago.** Nenhuma tool de escrita, nenhum `abrirApp`, nenhum
   login no portal. Só código, testes offline e documentação.
2. **Nunca `git commit`, `git push` ou `rm`** sem pedido explícito do usuário nesta
   sessão. Deletar = `trash`.
3. `npm test` tem que continuar em **0 falhas** e o `git status` depois da rodada
   deve ter exatamente as mudanças que você fez — nada de lixo de teste.
4. Se a rodada exigir uma decisão de produto (o que arquivar, o que descontinuar),
   **não decida**: registre a pergunta em `ZELADORIA.md` e encerre a rodada.

## Estado do loop

O arquivo `ZELADORIA.md` na raiz é a memória entre rodadas (o contexto desta sessão
é resumido e se perde; o arquivo não). Ele tem duas listas: `## Fila` e `## Feito`.

- Se `ZELADORIA.md` não existir, crie-o nesta rodada — só isso — populando a `## Fila`
  com o resultado dos diagnósticos abaixo. Não conserte nada ainda.

## A rodada

1. **Diagnóstico rápido** (barato, sempre):
   - `npm test` — deve dar 0 falhas.
   - `npm run smoke` — as 27 tools ainda registram?
   - `git status --porcelain` — quantos arquivos soltos na raiz?
   - `grep` por credencial vazada em arquivo versionado (padrões de senha/matrícula
     em `.js`/`.json`/`.md` fora de `config/credentials.json`).
2. **Se algum diagnóstico falhou** → esse é o item da rodada. Conserte a causa,
   não o sintoma. Rode `npm test` de novo. Pare.
3. **Se tudo passou** → pegue o **primeiro item da `## Fila`** do `ZELADORIA.md`,
   execute-o, mova para `## Feito` com a data. Pare.
4. **Se a fila está vazia e tudo passa** → não invente trabalho. Reporte
   `noop: true` e encerre a rodada em uma linha.

## Candidatos permanentes para a fila (quando faltar item)

- Convenção 9 do `CLAUDE.md`: os ~44 scripts `.js`/`.py` soltos na raiz deveriam
  estar em `scratch/exploracao/<vertical>/`. Mova **um lote por rodada**, atualize
  o `scratch/exploracao/INVENTARIO.md`, e verifique que nada em `src/` ou `test/`
  importava o que foi movido.
- Tool registrada em `src/index.js` sem teste offline correspondente em `test/`.
- Módulo sem flag `*_OFFLINE`, ou teste que não seta a flag explicitamente.
- App em `config/catalogo_aplicacoes.json` sem ficha em `docs/apps/`.
- `docs/` desatualizado em relação ao código (contagem de tools, nomes de flags).

## Saída da rodada

Máximo 5 linhas: o que checou, o item que fez, o estado do `npm test`, e o próximo
item da fila. Sem relatório longo, sem arquivo novo de `RELATORIO_*.md`.
