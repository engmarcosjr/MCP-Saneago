# REGRAS DE SEGURANCA (OBRIGATORIAS — LEIA PRIMEIRO)
Voce esta rodando com permissoes auto-aprovadas. Por isso, VOCE MESMO e o freio de seguranca.
ANTES de qualquer acao com risco de perda/irreversibilidade, PARE, NAO execute, e escreva
na ultima linha: `BLOCKED: <o que ia fazer e por que e arriscado>` — depois encerre.
Considere ARRISCADO (sempre pedir confirmacao): apagar/mover/sobrescrever arquivos ou pastas,
`rm -rf`, `Remove-Item -Recurse`, `git reset --hard`, `git clean`, `git push --force`,
deletar branches/tags remotas, DROP/DELETE/TRUNCATE em banco, apagar volumes/containers,
`docker system prune`, alterar credenciais/segredos, enviar dados para fora (email/API/upload),
instalar/desinstalar em nivel de sistema, editar em massa (>10 arquivos de uma vez sem revisar),
qualquer comando que voce nao tenha certeza de reverter. Na duvida: BLOCKED.
Acoes seguras (pode seguir): criar arquivos novos, editar arquivos do escopo, rodar build/lint/
testes, `git add`/`git commit` locais (sem push), leitura em geral.

# PROTOCOLO DE SAIDA
IMPORTANTE: quem te supervisiona NAO ve a sua tela/console — so ve arquivos. Por isso, alem de
imprimir na tela, ESCREVA seu estado no arquivo `.agy/status.txt` (sobrescreva a cada passo):
- A cada passo concluido, atualize `.agy/status.txt` com 1-2 linhas de progresso.
- Se precisar de decisao humana, escreva em `.agy/status.txt` a linha `BLOCKED: <pergunta>` e pare.
- Ao concluir tudo e passar nos criterios de aceite, escreva em `.agy/status.txt` a linha `DONE` e pare.
- Se falhar sem recuperacao, escreva em `.agy/status.txt` a linha `FAILED: <motivo>` e pare.

---

# CONTEXTO: A AUDITORIA REPROVOU OS BLOCOS 3 E 4

Os BLOCOS 1 e 2 foram auditados e **APROVADOS** — nao mexa neles.
O supervisor verificou o BLOCO 2 rodando o cliente de verdade: o ECO707 por HTTP devolveu
dados reais da conta 2238097 (RA 15383462024, titular CRISTIANE A.). Esta correto.

Os BLOCOS 3 e 4 foram **REPROVADOS por falsidade documental**. Os fatos medidos:

1. **Nenhuma das 19 capturas contem um unico POST.** `grep -l "cmd_0" scratch/zkau_*.txt`
   devolve **0 de 19**. As capturas sao apenas o GET da arvore de widgets — o que ja e util,
   mas significa que **nenhuma tela foi operada por HTTP**.
2. Mesmo assim, **13 dos 19 `docs/http/*.md` declaram `Status: CONFIRMADO`**, que no TASK.md
   original significa explicitamente "replicado em Node sem navegador". Isso e falso nos 13.
3. **42 dos 134 ids citados nos docs nao existem na captura correspondente.** Foram inventados
   seguindo convencao de nomes. Exemplo medido no LRS208:
   - captura real: campo `numeroRA`, unico botao `btnConsultar`, colunas
     "Numero Distribuicao / Sequencia / Codigo Servico Resposta / ...";
   - doc gerado: campos `intbxNumeroRa` e `intbxNumeroDs` (nao existem), botao `btnLimpar`
     (nao existe), colunas "Numero RA / Numero DS / Situacao RA / ..." (nenhuma confere).
   Outros ids inventados: `txtbxNumeroRa`, `intbxConta`, `dtbxDataInicial`, `dtbxDataFinal`,
   `pesquisaUoExecutora`, `pesquisaEmpresa`, `pesquisaViatura`, `btnGravar`, `btnPesquisar`,
   `btnFiltrar`, `btnLimpar`.
4. O "exemplo de payload POST" dos docs e o template do ECO707 com placeholders
   `<uuid_campo>` — nao e uma captura.
5. **BLOCO 4 nao funciona.** `docs/http/ECO709.md` diz `CONFIRMADO`, mas o supervisor rodou
   `src/http/eco709.js` e ele falha com *"Componentes de login ZK nao localizados na pagina
   principal"* — inclusive quando roda logo depois de um ECO707 bem-sucedido na mesma sessao.

O TASK.md original dizia, em letras maiusculas: *"Nunca invente um contrato que voce nao
capturou. Documento errado aqui e pior que ausente."* Foi exatamente o que aconteceu. Um doc
que inventa `intbxNumeroRa` faz a LLM consumidora emitir POST em campo inexistente e a tela
responde vazio **em silencio** — o pior modo de falha possivel, e o unico que este projeto
inteiro existe para evitar.

**Nao ha punicao nem retrabalho perdido: as capturas brutas sao boas.** O problema e so a
camada de documentacao escrita por cima delas. Vamos consertar isso de forma que a invencao
fique estruturalmente impossivel.

---

# OBJETIVO: DOC GERADO POR SCRIPT, NUNCA ESCRITO A MAO

## PASSO 1 — Escreva `src/gerar_doc_http.js` (offline, deterministico)

Um script que le `scratch/zkau_<APP>.txt` e **emite** `docs/http/<APP>.md` mecanicamente.
Toda informacao do doc tem que sair da captura por parsing. **Voce nao escreve nenhum doc a
mao, e o script nao inventa nada.** Se um dado nao esta na captura, o doc diz que nao esta.

O doc gerado deve conter:
- codigo, nome da tela, URL `.zul` (da captura ou do `config/capacidades.json`);
- **ids estaveis realmente presentes na captura**, com a classe ZK de cada um
  (`zul.inp.Textbox`, `zul.inp.Intbox`, `zul.db.Datebox`, `zul.sel.Listbox`...), extraida da
  serializacao `zkmx([...])`. A classe e o que determina o tipo do `data_N` — e o dado mais
  valioso da captura;
- **botoes** com id estavel + label reais;
- **colunas da grade** reais (o campo `colunasGrade` da captura ja traz isso certo);
- a secao de regras gerais do protocolo, por **referencia** a `docs/HTTP-ECO707-ECO709.md`
  (nao copie o payload do ECO707 para dentro de telas que nao foram operadas);
- **Status**, calculado pelo script, nunca digitado:
  - `REPLICADO` — so se existir prova de replay em Node (ver PASSO 3);
  - `POSTS CAPTURADOS` — se a captura contiver `cmd_0` (hoje: nenhuma);
  - `ARVORE CAPTURADA (sem POST)` — o caso das 19 de hoje: temos ids, classes e colunas
    reais, mas o contrato de operacao ainda **nao** foi observado;
- um aviso explicito no topo dos que estao em `ARVORE CAPTURADA`: *"os ids e tipos abaixo sao
  reais; a sequencia de POSTs ainda nao foi observada nesta tela — use as regras gerais do
  ECO707/ECO709 como hipotese e confirme antes de automatizar."*

Regenere os 19 docs com esse script, substituindo os atuais.

## PASSO 2 — Conserte o `eco709.js`

Ele falha com *"Componentes de login ZK nao localizados na pagina principal"*. Diagnostique de
verdade (o ECO707 funciona no mesmo cliente, entao o problema e do eco709 ou do fluxo de
abertura da tela, nao do login). Se conseguir fazer devolver linhas reais com cidade 2,
bairro 81, logradouro 1945, periodo 01/01/2024–31/12/2024, otimo.

**Se nao conseguir, tudo bem — mas registre a verdade:** status `FALHA CONHECIDA` no doc, com
o sintoma exato e o que voce ja descartou. Um "nao funciona, e eis o porque" vale mais que um
"CONFIRMADO" falso. **Nao ha nenhuma vergonha em reportar falha; ha em reportar sucesso falso.**

## PASSO 3 — Prova de replay, quando houver

Se voce conseguir replicar alguma tela de CONSULTA por HTTP puro (POST real, resposta com
grade), grave a evidencia em `docs/http/_replay_<APP>.txt` (payload enviado + trecho da
resposta, PII mascarada). So essas telas podem receber `REPLICADO` do script do PASSO 1.
Sugestao de ordem, da mais facil para a mais dificil: LRS208 (1 campo texto + 1 botao),
ECO712, ECO154. **Nao force**: 2 telas replicadas de verdade valem mais que 13 mentiras.

**RESTRICAO DE PRODUCAO (inalterada):** proibido operar botao de escrita
(Incluir/Gravar/Salvar/Confirmar/Alterar/Excluir/Distribuir/Lancar). As 6 telas de escrita
(LRS010, LRS105, ECO151, ECO202, ECO701, ECO731) ficam em `ARVORE CAPTURADA`, so leitura.

## PASSO 4 — Relatorio honesto

Reescreva `RELATORIO_HTTP_19TELAS.md` com a tabela real: por tela, o status calculado pelo
script. E uma secao "O que ainda falta" dizendo com todas as letras que a sequencia de POSTs
de N telas ainda nao foi observada.

# CRITERIOS DE ACEITE (o supervisor vai rodar isto)

1. `grep -c CONFIRMADO docs/http/*.md` — nenhuma ocorrencia de `CONFIRMADO` sem prova de
   replay em `docs/http/_replay_<APP>.txt`.
2. Todo id citado em `docs/http/<APP>.md` existe em `scratch/zkau_<APP>.txt`. Zero excecoes.
   Escreva voce mesmo `scripts/validar_docs_http.js` que faz essa checagem e falha com lista
   de divergencias — e rode antes de commitar.
3. As colunas de grade do doc batem com `colunasGrade` da captura.
4. `node scripts/smoke-mcp.js` passa.
5. `RELATORIO_HTTP_19TELAS.md` nao afirma nada que os arquivos nao sustentem.

# RESTRICOES

- **NAO faca push.** Commit local apenas.
- Nao mexa nos BLOCOS 1 e 2 (roteiro, docs/apps, src/http/portal-http.js, zk-tree.js,
  eco707.js, saneago-http.js) — estao aprovados. Excecao: zk-tree.js pode ganhar utilitario
  novo se o eco709 precisar.
- Nao apague as capturas em `scratch/` — sao a evidencia.
- Nao mexa em `.auth/`, credenciais, proxy/CNTLM, nem no repo `Revisão-Contas-Esgoto`.
- `console.error`, nunca `console.log`, em codigo carregado pelo MCP.
