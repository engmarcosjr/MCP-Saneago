# PLANO — FASE 9: qualidade do ranking da descoberta

**Status:** proposto (2026-07-22)
**Pré-requisito:** FASE 8 concluída — catálogo de 596 apps, 596/596 capturadas, índice
regenerado (164 alta / 214 média / 218 baixa confiabilidade, 11 erros).

---

## 1. Por que esta fase existe

A tool `saneago_descobrir_aplicacao` é a porta de entrada do MCP: uma LLM pergunta em
linguagem natural e ela responde *em qual tela olhar*. Se o topo do ranking estiver errado,
a LLM responde com a aplicação errada — **com a mesma confiança** com que responderia
certo. Um índice completo com ranking ruim é mais perigoso que um índice declaradamente
incompleto, porque não sinaliza a própria falha.

### O defeito, medido

Reavaliação feita após a varredura completa (registrada em `RELATORIO_FASE8.md`):

| Pergunta | Esperado | Real (índice completo) |
|---|---|---|
| "conta pelo nome do proprietario" | ECO154 em 1º | **ECO154 em 5º**; 1º = ECA002 |
| "RAs por logradouro e bairro num periodo" | ECO709 em 1º | **ECO709 em 3º** |

O 1º colocado `ECA002` ("Rel. de Produtividade do Recadastramento") **não aceita nenhum
dos filtros pedidos** (tem apenas `cidade`, `periodo`). Ele vence porque tem 5 colunas
contendo a palavra "conta" — *Contas em Execução, Contas em Análise, Total Contas,
Contas Analisadas pelo Terceiro, Contas Analisadas pela Saneago*.

### Causa raiz (`src/tools/descobrir.js`)

| Sinal | Peso atual | Problema |
|---|---|---|
| Filtro aceito pela tela (linha 124) | `+15` por filtro | **Sinal mais forte que existe, subvalorizado** |
| Coluna de retorno casada (linha 141) | `+6` × nº de colunas, **sem teto** | Sinal fraco, acumula sem limite |
| Termos do nome (linha 114) | `+4` × nº de tokens | idem, sem teto |
| Perguntas relacionadas (linha 157) | `+5` × contagem | idem |

Três efeitos somados:
1. **Acumulação linear sem teto** — uma tela com 20 colunas ruidosas supera qualquer
   casamento exato de filtro. O ruído escala com o tamanho da tela.
2. **Peso invertido** — que a tela *aceite o filtro* (fato capturado do DOM) vale menos
   que a palavra aparecer num cabeçalho (coincidência léxica).
3. **Substring sem fronteira de palavra** — `"conta"` casa com `"Contas Analisadas"`,
   `"contato"`, `"contabil"`. Só piorou quando o catálogo dobrou.

Nada disso apareceu na FASE 8b porque a validação rodou sobre o índice **parcial** (340
apps). O defeito é proporcional ao tamanho do catálogo — cresceu junto com o acerto.

---

## 2. Objetivo

Que o topo do ranking seja **defensável**: se a app nº 1 não aceita nenhum filtro
pedido, ela não deveria estar em nº 1 — e, quando ninguém atende de verdade, a tool deve
dizer isso em vez de entregar o melhor de um conjunto ruim.

**Não** é objetivo desta fase inventar busca semântica/embeddings. O sinal determinístico
(filtros capturados do DOM) ainda não está sendo usado direito; esgotar isso primeiro.

---

## 3. Escopo

### T1 — Reescrever o scoring com pesos hierárquicos e tetos

- **Filtro exato casado** passa a ser o sinal dominante: peso alto e **proporcional à
  cobertura** (casar 3 de 3 filtros pedidos > casar 1 de 3).
- **Teto por categoria de sinal fraco**: colunas, tokens de nome e perguntas relacionadas
  passam a ter contribuição máxima limitada (ex.: teto que não ultrapasse o valor de
  *um* filtro casado). Elimina a vitória por acumulação.
- **Fronteira de palavra** no casamento de tokens (evita `conta` ⊂ `contabil`).
- **Penalidade explícita** quando a app não casa **nenhum** filtro pedido mas a pergunta
  continha filtros reconhecíveis — hoje ela concorre em pé de igualdade.

### T2 — Corte de cauda e honestidade no retorno

- Devolver por padrão apenas candidatas acima de um limiar de score, não 215 itens.
- Incluir no retorno um campo de **confiança da resposta** (ex.: `alta` quando o 1º casa
  todos os filtros pedidos; `baixa` quando ninguém casa filtro algum).
- Quando nada casar de verdade: retorno vazio + mensagem honesta, **nunca** o topo de um
  conjunto irrelevante.

### T3 — Suíte de regressão de ranking (o coração da fase)

Criar `test/ranking.test.js` com **casos de verdade conhecidos** — pergunta → app que
*deve* vir em 1º. Semente inicial (expandir):

| Pergunta | Esperado em 1º |
|---|---|
| conta pelo nome do proprietário | ECO154 |
| RAs por logradouro e bairro num período | ECO709 |
| consultar RA por número | ECO701 |
| débitos/faturas de uma conta | (definir na execução, com prova) |

O teste falha se o esperado não estiver em 1º. **É isto que impede a próxima regressão
silenciosa** — o defeito desta fase existiu porque não havia teste de ranking, só
validação manual pontual num índice parcial.

### T4 — Reavaliar as respostas da FASE 7 contra o catálogo completo

O T5 da FASE 7 respondeu 12 perguntas de negócio usando um catálogo que cobria **56%** do
sistema. Toda resposta do tipo *"o sistema não permite consultar X"* dada ali é **não
confiável** e precisa ser reavaliada contra as 596 apps. Produzir
`docs/PERGUNTAS_RESPONDIDAS.md` com a resposta revalidada, citando app + filtros que a
provam, e marcando explicitamente as que mudaram de veredito.

### T5 — Documentar a lacuna remanescente

Os 11 apps com erro não são telas ZK comuns (BI em aba externa, GIS em popup, GED,
download de PDF, menu sem permissão). Decidir e registrar: ficam fora do escopo do MCP
por natureza, ou merecem um adaptador próprio? Registrar a decisão — não deixar como
pendência silenciosa.

---

## 4. Critérios de aceitação

1. `test/ranking.test.js` passa com todos os casos-verdade em 1º lugar.
2. `saneago_descobrir_aplicacao` para "conta pelo nome do proprietário" devolve **ECO154
   em 1º** *no índice completo de 596 apps* (a distinção importa — foi ela que mascarou o
   defeito).
3. Uma pergunta sem resposta real no catálogo devolve lista vazia + mensagem honesta,
   comprovado por teste.
4. Nenhuma app que não case filtro algum aparece no top-3 quando a pergunta contém
   filtros reconhecíveis.
5. `docs/PERGUNTAS_RESPONDIDAS.md` existe, com as respostas revalidadas e as mudanças de
   veredito marcadas.

## 5. Execução

Delegada ao AGY pela skill `delegar-agy` (Claude planeja/revisa/commita; AGY executa),
**modo A — SANDBOX**: esta fase é código puro sobre JSON local, **não precisa de rede**
nem do portal. Isso também evita os dois modos de falha desta sessão (timeout do
`--print-timeout` em tarefas longas de rede e processos filhos órfãos).

Revisão obrigatória em subagente isolado, reproduzindo as provas — com atenção especial a
uma armadilha: *o executor pode ajustar os pesos até os casos-teste passarem sem que o
ranking melhore de fato*. A revisão deve conferir o ranking em perguntas **fora** da
suíte de teste.

---

## 6. Lições registradas desta sessão (para não repetir)

1. **Validar no artefato completo, não no parcial.** "ECO154 em 1º" foi medido em 340
   apps e não se sustentou em 596. Amostra parcial pode inverter a conclusão.
2. **Uma ausência apontada pelo usuário raramente é um caso isolado.** O ECO154 revelou
   259 apps faltando — 44% do sistema.
3. **Cobertura declarada > completude presumida.** Registrar o que falta é o que permitiu
   descobrir o defeito em vez de confiar no índice.
4. **Operacional:** `agy --continue` não funciona em background (exige TTY, sai com exit
   0 sem fazer nada); processos filhos do AGY sobrevivem à morte do CLI; tarefas longas
   não podem depender do timeout da ferramenta que as dispara (usar `nohup`/`disown`);
   matar sempre por PID, nunca `pkill -f` às cegas. Tudo já registrado na skill
   `delegar-agy`.
