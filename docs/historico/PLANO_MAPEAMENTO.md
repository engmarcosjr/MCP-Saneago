# Plano — Mapeamento completo das 596 aplicações

> Status: **piloto executado e auditado**. Loop pronto; aguardando lote 02.
> Executor previsto: OMNICLAUDE (Modo B — read-only com rede).
> Orquestrador/revisor: Claude desta sessão.

## 1. Objetivo

Sair de **3 aplicações completas de 596** para um MCP com cobertura real: cada app com
ficha derivada da tela de verdade, entrada em `config/roteiro.json` (o que o MCP consome
em runtime) e uma classe de segurança aprovada pelo Marcos Jr.

### Linha de base medida em 2026-09-08

| Métrica | Valor |
|---|---|
| Apps no catálogo | 596 |
| Apps completas (ficha real + roteiro + URL) | **3** |
| Fichas `Status: auto` (geradas em lote, tela nunca aberta) | 324 |
| Apps sem entrada em `roteiro.json` | 269 |
| Fichas sem nenhum campo detectado | 162 |
| Fichas stub (< 800 bytes) | 95 |

Classe de segurança **preliminar** (derivada de ficha + vocabulário de botões, não de
inspeção real): `indeterminado` 329 · `possui_escrita` 141 · `candidata_leitura` 115 ·
`sem_acesso` 11. Estes números ordenam a fila; **não** autorizam nada.

## 2. Fases e o gate humano

```
Fase 0 ──► Fase 1 ──► [GATE MARCOS JR] ──► Fase 2
offline    inventário    aprova safelist     validação E2E
FEITA      sem clique                        só nas aprovadas
```

**Fase 0 — inventário offline. Concluída.**
`scripts/backlog-mapeamento.js` classifica as 596 apps a partir do que já está em disco e
gera `docs/BACKLOG_MAPEAMENTO.{json,md}`. Determinístico, sem rede, regenerável. É a fila:
o executor não escolhe o que fazer, ele consome esta lista.

**Fase 1 — inventário do portal, sem clique.** Loop `/mapear`. Abre cada tela, grava a
evidência bruta, deriva ficha + roteiro, propõe uma classe. **Nenhum clique, nenhum campo
preenchido, nenhuma tool de escrita.** Produz `docs/SAFELIST_LEITURA.md` com tudo em
*Aguardando aprovação*.

**GATE.** O Marcos Jr move linhas para *Aprovadas para Fase 2* ou *Recusadas*. Nenhuma app
entra na Fase 2 sem estar nessa seção. Este gate não é delegável.

**Fase 2 — validação E2E.** Só nas aprovadas, só com os botões marcados como seguros.
Consulta real com parâmetro plausível, ficha promovida a `Status: enriquecido` (padrão
`ECO701`). **Especificação a escrever depois do gate** — o que a Fase 1 revelar muda o
desenho, e planejar agora seria adivinhação.

## 3. Trilha de auditoria (o núcleo deste plano)

### O defeito que precisamos impedir

O modo de falha desta tarefa não é o executor errar — é ele **acertar de forma plausível
sem ter aberto a tela**. Uma ficha escrita a partir do nome da aplicação parece correta,
passa em qualquer revisão por leitura, e some do backlog como se estivesse pronta. Foi
assim que nasceram as 324 fichas `Status: auto` atuais.

Revisar lendo as fichas não detecta isso. A auditoria precisa comparar o artefato contra
**evidência que o modelo não produziu**.

### Três camadas, cada uma checável sozinha

**1. Evidência bruta — `docs/mapeamento/evidencias/<CODIGO>.inspect.json`** (versionada)
Retorno **verbatim** de `saneago_abrir_e_inspecionar`, sem edição. Gravado *antes* da
ficha. Carrega o que o modelo não inventa de forma consistente: a URL `.zul` real e os
uuids de componente ZK. É contra este arquivo que tudo é conferido.

**2. Log append-only — `docs/mapeamento/AUDITORIA.jsonl`**
Uma linha JSON por app, nunca reescrita nem reordenada: timestamp, lote, executor, código,
URL real, contagem de campos e botões, rótulos dos botões, classe proposta, motivo,
arquivos tocados, `sha256` da evidência e da ficha, erro. Grep-ável, diff-ável,
reconciliável por contagem.

**3. Diário do lote — `docs/mapeamento/lotes/<data>-lote-<N>.md`**
Prosa curta: o que tentou, o que bloqueou, decisões, dúvidas para o gate. É o contexto que
o JSONL não carrega. Inclui os comandos de verificação e a saída deles.

E o git: **um commit por lote**, feito pelo revisor, nunca pelo executor. O diff é a quarta
camada.

### O verificador — `scripts/auditar-mapeamento.js` (a construir)

Offline, determinístico, sai com código ≠ 0 e a lista de divergências. É o que eu rodo
depois, em vez de reler o trabalho todo. Checagens:

| # | Checagem | Pega |
|---|---|---|
| 1 | Toda linha do JSONL tem evidência correspondente e o `sha256` bate | evidência apagada ou alterada depois |
| 2 | Todo campo e botão da ficha aparece, com o mesmo rótulo, na evidência bruta | **ficha inventada** |
| 3 | Toda app com `somente_leitura` tem zero verbo de escrita nos botões **da evidência** | classe otimista demais |
| 4 | Toda app processada tem entrada em `roteiro.json`, e o `url_zul` do roteiro é igual ao da evidência | o gap que os commits recentes deixaram |
| 5 | Nenhum código aparece duas vezes com classes diferentes | reprocessamento silencioso |
| 6 | Evidência com 0 campos e 0 botões só pode ser `sem_campos_confirmado` ou `bloqueada` | sessão expirada virando ficha vazia |
| 7 | Toda app processada tem linha na `SAFELIST_LEITURA.md` | app que pula o gate |
| 8 | Reconciliação: linhas do JSONL == fichas tocadas == entradas novas de roteiro | lote parcial reportado como completo |
| 9 | `roteiro.json` e `indice_capacidades.json` são JSON válido | corrupção por escrita concorrente |

**Amostragem independente:** além do script, eu reabro **1 em cada 20** apps do lote e
comparo com a evidência gravada. O script prova consistência interna; a amostragem prova
que a evidência veio da tela. As duas coisas são necessárias.

## 4. Pacote de trabalho para o OMNICLAUDE

**Modo B — read-only com rede** (`delegar-omniclaude`, seção 2). As flags de escrita vão
explicitamente a `0` no ambiente, para não herdar valor ligado do shell:

```bash
\
SANEAGO_ALLOW_WRITE=0 SANEAGO_ALLOW_RA_WRITE=0 SANEAGO_ALLOW_GENERIC_WRITE=0 SANEAGO_ALLOW_LRS105_WRITE=0 \
  zsh -i -c 'omniclaude -p "$(cat <arquivo_prompt>)" --permission-mode acceptEdits --output-format text' \
  > omniclaude_run.log 2>&1
```

Regras do pacote, além das que já estão em `.claude/commands/mapear.md`:

- **Não commitar, não fazer push.** O revisor commita.
- **Não tocar em arquivo fora do repositório.**
- **Não modificar `src/`** — a Fase 1 só escreve em `docs/`, `config/roteiro.json` e
  `docs/mapeamento/evidencias/`. Se achar bug real em `src/`, documenta e não conserta.
- **Working tree limpo antes de lançar** (`git status --short` vazio) — é o que permite
  auditar e reverter por git. Hoje há 44 arquivos soltos na raiz: resolver antes.
- **Um lote de 3 apps por invocação.** Não pedir "faça 50" — lote grande com sessão
  expirando no meio é exatamente o cenário que produz ficha vazia em massa.
- Se um comando for barrado por permissão, **não contornar**: registrar como pendência.

## 5. Ordem de execução

| Passo | O quê | Quem | Bloqueia |
|---|---|---|---|
| 1 | ~~Lote piloto: 3 apps ECO~~ | OMNICLAUDE | **feito** — lote-01 |
| 2 | ~~Auditar o piloto contra a evidência~~ | sessão | **feito** — 5 defeitos achados |
| 3 | ~~Escrever `auditar-mapeamento.js` (9 checagens)~~ | sessão | **feito** |
| 4 | ~~Ajustar `/mapear` (pontos 3, 4, 5)~~ | sessão | **feito** |
| 5 | Decidir sobre `src/session.js` e `src/portal.js` | **Marcos Jr** | working tree limpo |
| 6 | Limpar os 44 arquivos soltos da raiz (convenção 9) | Marcos Jr | working tree limpo |
| 7 | Lote 02: reinspecionar `ECOV413`, `ECO010`, `ECO162` | OMNICLAUDE | resto da Fase 1 |
| 8 | Auditar o lote 02; se zerar, soltar `/loop /mapear` | sessão | — |
| 9 | Marcos Jr aprova a `SAFELIST_LEITURA.md` | **só ele** | Fase 2 |
| 10 | Especificar a Fase 2 com o que a Fase 1 revelou | sessão | — |

O passo 7 existe porque a evidência do piloto foi gravada antes de `saneago_abrir_e_inspecionar`
devolver `url_real`, e sem a URL a origem do inventário é inverificável (checagem C4).

O passo 3 é inegociável: validar o formato em 3 apps custa uma rodada; descobrir o formato
errado na app 200 custa 200.

## 6. Critérios de aceite da Fase 1

1. `node scripts/auditar-mapeamento.js` → 0 divergências.
2. `npm test` → 0 falhas (80/80 na linha de base).
3. `git status` sem lixo: só `docs/`, `config/roteiro.json` e `docs/mapeamento/evidencias/`.
4. Nenhuma app em `Aprovadas para Fase 2` — a Fase 1 não aprova nada, só propõe.
5. Nenhuma escrita em sistema Saneago. Verificável: as flags estavam em `0` e nenhuma tool
   de escrita aparece em `AUDITORIA.jsonl`.
6. Amostragem de 1 em 20 confere com a evidência.

## 7. O que este plano deliberadamente não faz

- **Não planeja a Fase 2.** Depende do gate e do que a Fase 1 achar.
- **Não promete 596 apps mapeadas.** Parte não abre, parte não tem campo, parte é restrita
  ao perfil. `sem_campos_confirmado`, `sem_acesso` e `bloqueada` são desfechos legítimos —
  senão o loop fica batendo na mesma app para sempre.
- **Não delega nenhuma escrita em produção.** Continua gate humano supervisionado, como
  manda o `CLAUDE.md`.
