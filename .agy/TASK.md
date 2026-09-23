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

Escreva SEMPRE, no `.agy/status.txt`, qual BLOCO esta em execucao. Exemplo:
`BLOCO 2 — 7/19 telas capturadas (ultima: ECO711)`.

---

# OBJETIVO

Repositorio: `C:\repos\MCP-Saneago` (servidor MCP que dirige o portal ZK da intranet Saneago).

Hoje o projeto tem **duas camadas de mapeamento** das telas, e as duas estao incompletas:
1. **UI (Playwright)** — funciona, mas so 4 telas tem "vertical" dedicada e a documentacao
   por tela (`docs/apps/*.md` + `config/roteiro.json`) esta defasada e com dados errados.
2. **HTTP puro (POST /prt/zkau)** — muito mais rapido (0,13 s/consulta), mas so 2 telas
   documentadas e o cliente HTTP nem mora neste repo.

Sua missao e fechar essas duas lacunas para as **19 telas prioritarias** listadas abaixo.

## As 19 telas prioritarias

| Codigo | URL .zul (confirmada em config/capacidades.json) | Natureza |
|---|---|---|
| LRS010 | /prt/lrs/LRS010DistribuicaoServico.zul | ESCRITA |
| LRS034 | /prt/lrs/LRS034ValidaRaCorteAsfalto.zul | consulta |
| LRS041 | /prt/lrs/LRS041RelatorioRecomposicaoAsfaltica.zul | consulta |
| LRS100 | /prt/lrs/LRS100ManterEstoqueMaterialPorViatura.zul | consulta |
| LRS105 | /prt/lrs/LRS105CadastraRetornoRA.zul | ESCRITA |
| LRS208 | /prt/lrs/LRS208ConsultaRADS.zul | consulta |
| LRS272 | /prt/lrs/LRS272MonitorarAtendimento.zul | consulta |
| ECO151 | /prt/eco/ECO151CadastroUsuario.zul | ESCRITA |
| ECO154 | /prt/eco/ECO154ConsultaUsuario.zul | consulta |
| ECO202 | /prt/eco/ECO202MovimentacaoHidrometro.zul | ESCRITA |
| ECO205 | /prt/eco/ECO205ConsultaHidrometro.zul | consulta |
| ECO701 | /prt/eco/ECO701RegistroAtendimento.zul | ESCRITA |
| ECO707 | /prt/eco/ECO707ConsultaRAConta.zul | consulta (HTTP JA PRONTO) |
| ECO708 | /prt/eco/ECO708ConsultaRASolicitante.zul | consulta |
| ECO709 | /prt/eco/ECO709ConsultaRALogradouro.zul | consulta (HTTP quebrado) |
| ECO711 | /prt/eco/ECO711ConsultaRaExecucao.zul | consulta |
| ECO712 | /prt/eco/ECO712HistoricoUsuario.zul | consulta |
| ECO731 | /prt/eco/ECO731AlteracaoImpressaoRA.zul | ESCRITA |
| MTG020 | /prt/mtg/MTG020RelatorioUsuarioVirtual.zul | relatorio |

---

# LEITURA OBRIGATORIA ANTES DE COMECAR

Leia, nesta ordem (sao a fonte de verdade do que ja se sabe):
1. `docs/HTTP-ECO707-ECO709.md` — **o documento mais importante**. Contem as 7 regras gerais
   do protocolo ZK-por-HTTP (onChange+onClick no mesmo POST, formato de data 1-based, o `echo`
   com `opt=i` que devolve a grade, reuso do `dtid`, ids estaveis vs uuid dinamico). Essas
   regras valem para QUALQUER tela — use-as como base de todo o BLOCO 2.
2. `src/portal.js`, `src/session.js`, `src/executor.js` — camada UI/Playwright existente.
3. `scripts/capturar_zkau.js` — o capturador de contrato HTTP (hoje com ECO707/ECO709 hardcoded).
4. `C:\repos\Revisão-Contas-Esgoto\src\portal\portal-http.js`, `eco707.js`, `eco709.js` —
   o cliente HTTP que FUNCIONA, mas mora no repo errado.
5. `config/capacidades.json` — varredura de 23/07/2026, 596 apps, com URL real, inputs
   rotulados, botoes e colunas de grade. **E a fonte de dados mais atual do projeto.**

# AMBIENTE

- Rode **local** (esta maquina esta na rede Saneago; VM/nuvem nao alcanca o portal).
- Credenciais: o `src/session.js` acha sozinho em `C:\repos\PORTAL_LEGADO\config\credentials.json`.
  A sessao Playwright ja esta valida em `.auth/storage-state.json`. **NAO edite nem apague
  nada dentro de `.auth/`.** Se o login falhar por senha invalida: `BLOCKED: senha do portal
  parece expirada` e pare (a senha e do cofre do usuario, voce nao tem acesso).
- Node ja instalado, `node_modules` ja presente.
- **NUNCA** mexa em proxy do sistema nem no CNTLM (127.0.0.1:3128). E regra dura do usuario:
  mexer nisso derruba a internet da maquina inteira. Se algo falhar por proxy, escreva
  `BLOCKED: <detalhe>` e pare.

# DADOS DE TESTE AUTORIZADOS (do usuario)

- Conta: `1813366` — e tambem `2238097` (a que aparece na captura ja documentada do ECO707).
- RA com asfalto lancado: `27273762025`.
- RA generica para consulta: `1812692026`.
- Endereco (ECO709): cidade `2`, bairro `81`, logradouro `1945`, periodo 01/01/2024 a 31/12/2024.
- Cidade de interesse geral: ANAPOLIS.

---

# BLOCO 1 — Regenerar a documentacao por tela (OFFLINE, faca PRIMEIRO)

Este bloco nao precisa de rede nem de portal. E o de maior retorno e o de menor risco.

## Problema atual
- `config/roteiro.json` esta defasado (gerado em 17/07, quando o catalogo tinha 337 apps).
  A varredura da Fase 8 descobriu +259 apps e o roteiro nunca foi regenerado. Consequencia:
  a tool `saneago_consultar_roteiro` **nao enxerga** LRS034, ECO151, ECO154, ECO202, ECO205,
  ECO708 e ECO711 — sete das 19 telas prioritarias.
- Os `docs/apps/*.md` existentes sao template automatico de 16/07 e estao **errados**:
  - Gravam **UUID do ZK** como identificador de botao (ex.: `ID ZK: j8tFi1`). Esse uuid e
    **regenerado a cada abertura de tela** — documenta-lo e pior que nao documentar, porque
    induz a LLM a usar um identificador que nunca vai bater. **REMOVA todo uuid dos docs.**
  - Estao defasados frente ao `capacidades.json`: ex. `docs/apps/LRS105.md` lista
    "Programacao / Sem Rotulo" e 0 colunas, enquanto o capacidades tem 4 inputs rotulados
    e 16 colunas de grade.
  - Nao trazem as **colunas da grade de resultado**, que e justamente o que a LLM precisa
    saber para interpretar a resposta de uma consulta.
  - Faltam 7 arquivos: LRS034, ECO151, ECO154, ECO202, ECO205, ECO708, ECO711.

## O que fazer
1. Escreva `src/regenerar_roteiro.js` que le `config/capacidades.json` (596 apps) e regenera
   **`config/roteiro.json` inteiro**, mantendo o formato que a tool `saneago_consultar_roteiro`
   ja consome (leia `src/index.js` no case `saneago_consultar_roteiro` para nao quebrar o
   contrato). Preserve o enriquecimento manual ja existente: se uma app tem no roteiro atual
   um texto marcado como enriquecido/curado (ex. ECO701, LRS041, ECO303), **nao sobrescreva
   com o template** — mescle (dados novos entram, texto curado permanece).
2. Escreva/atualize o gerador de `docs/apps/<CODIGO>.md` para produzir docs com:
   - codigo, nome, categoria, **URL .zul real**, tecnologia;
   - tabela de campos (rotulo, tipo, editavel/somente-leitura) — **sem uuid**;
   - lista de botoes por **rotulo** (sem uuid); marque explicitamente os botoes de escrita
     (Incluir/Gravar/Confirmar/Alterar/Excluir) como "acao de ESCRITA — exige gate";
   - **colunas da grade de resultado** (do campo `colunas` do capacidades.json);
   - secao "Como operar por UI" (tools genericas do MCP) e uma secao
     "Como operar por HTTP" que, se houver contrato capturado no BLOCO 2, referencia
     `docs/http/<CODIGO>.md`; se nao houver, diz honestamente "contrato HTTP nao capturado".
   - rodape com a data de geracao e a origem do dado (capacidades.json de 23/07/2026).
3. Regenere os docs das **19 telas prioritarias** (as 12 existentes + as 7 ausentes).
   Nao precisa regerar as 596 agora — mas o script tem que ser capaz disso (parametro `--todas`).

## Criterios de aceite do BLOCO 1
- `config/roteiro.json` contem as 596 apps, incluindo as 19 prioritarias.
- Existem os 19 `docs/apps/<CODIGO>.md`, nenhum deles contendo string de uuid ZK
  (verifique com: nenhum match de `/ID ZK/` nem de padrao tipo `j[0-9A-Za-z]{4,6}` nesses arquivos).
- Cada um dos 19 docs traz a URL `.zul` correta e as colunas de grade quando existirem.
- O texto curado do ECO701 (fluxo E2E de 15/07) **nao** foi perdido.
- `node scripts/smoke-mcp.js` continua passando.

---

# BLOCO 2 — Portar o cliente HTTP para dentro do MCP-Saneago (OFFLINE)

## Problema atual
O cliente HTTP que funciona (`portal-http.js` + `eco707.js` + `eco709.js`) mora em
`C:\repos\Revisão-Contas-Esgoto\src\portal\`. O MCP-Saneago **nao tem camada HTTP nenhuma** —
tudo passa por Playwright, o que e ~50x mais lento para consultas simples.

## O que fazer
1. Crie `src/http/` no MCP-Saneago e porte para la:
   - `src/http/portal-http.js` — login + sessao HTTP + `POST /prt/zkau` + parse da resposta AU.
   - `src/http/zk-tree.js` — utilitario que abre um `.zul` por GET e resolve **uuid a partir
     do id estavel** (ex.: `btnConsultar` -> uuid). Isso hoje esta espalhado; centralize,
     porque e a peca que todas as telas precisam.
   - `src/http/eco707.js` — porte da consulta que ja funciona, como referencia de padrao.
   **COPIE, nao mova.** O repo Revisão-Contas-Esgoto depende desses arquivos; nao toque nele
   (leitura apenas).
2. Adapte o modulo portado para usar as credenciais/config do MCP-Saneago (`src/session.js`
   ja sabe achar as credenciais — reuse a mesma logica, nao duplique caminho hardcoded).
3. Reuse o desktop ZK entre consultas (regra 6 do `docs/HTTP-ECO707-ECO709.md`): abrir o `.zul`
   uma vez e repetir onChange+onClick no mesmo `dtid` e ~10x mais rapido e mais estavel.
4. Trate a queda de sessao (regra 7): resposta `["redirect",["principal.zul",""]]` = refazer
   login e reabrir a tela, sem estourar excecao crua para o chamador.
5. Prove: rode a consulta ECO707 com a conta `2238097` pelo modulo portado e confirme que
   devolve as mesmas RAs que a implementacao original. Grave a prova em
   `docs/http/_PROVA_PORTE.md` (mascare CPF/nome se aparecer — o projeto ja mascara PII).

## Criterios de aceite do BLOCO 2
- `src/http/portal-http.js` e `src/http/eco707.js` existem e rodam **sem Playwright**.
- A consulta ECO707 por HTTP devolve linhas reais e leva < 1 s por consulta apos o login.
- `C:\repos\Revisão-Contas-Esgoto` permanece **intocado** (`git status` la, se aplicavel, limpo).

---

# BLOCO 3 — Capturar o contrato HTTP das 19 telas (PRECISA DO PORTAL — cuidado)

## Regra de ouro deste bloco
**Voce esta em PRODUCAO.** A captura pode CONSULTAR a vontade, mas nao pode GRAVAR nada.

- **PROIBIDO** clicar/disparar qualquer botao de escrita: Incluir, Gravar, Salvar, Confirmar,
  Alterar, Excluir, Cancelar RA, Distribuir, Lancar, Executar. Em telas de ESCRITA
  (LRS010, LRS105, ECO151, ECO202, ECO701, ECO731) voce so pode **abrir a tela e ler a arvore
  de widgets** — documente os campos e os ids estaveis, e pare ai.
- Nao habilite `SANEAGO_ALLOW_WRITE`.
- Se uma tela pedir confirmacao de qualquer gravacao, aborte a captura dela e siga para a proxima.

## O que fazer
1. Generalize `scripts/capturar_zkau.js`: hoje tem ECO707/ECO709 hardcoded e escolhe campo por
   indice (`ids[0]`, `ids[2]`...), o que e fragil. Reescreva para:
   - receber `<APP>` e um mapa de valores `campo=valor` por linha de comando ou por um
     arquivo `scripts/captura/<APP>.json`;
   - localizar campos pelo **rotulo/id estavel**, nao por indice;
   - aceitar flag `--somente-abrir` para telas de escrita (abre, serializa a arvore, nao clica);
   - gravar sempre em `scratch/zkau_<APP>.txt` (o `scratch/` e descartavel).
2. Rode a captura nas telas de **consulta** com os dados de teste autorizados:
   LRS034, LRS041, LRS100, LRS208, LRS272, ECO154, ECO205, ECO708, ECO711, ECO712, MTG020.
   (ECO707 ja esta documentado; ECO709 e o BLOCO 4.)
3. Rode com `--somente-abrir` nas telas de escrita: LRS010, LRS105, ECO151, ECO202, ECO701, ECO731.
4. Para cada tela, escreva `docs/http/<CODIGO>.md` no MESMO padrao do
   `docs/HTTP-ECO707-ECO709.md` (que e o modelo de qualidade a seguir):
   - GET do `.zul`;
   - **ids estaveis** dos campos, botoes e da grade de resultado;
   - o(s) POST(s) exatos com `cmd_N/uuid_N/data_N`, incluindo o `echo` com `opt=i`;
   - tipo de cada campo (Intbox espera numero, Textbox espera string, Datebox usa
     `ano.mes.dia...` com mes 1-based) — errar o tipo faz a tela consultar vazio EM SILENCIO;
   - o **layout de colunas do resultado**, e como ancorar a leitura (ex.: pelo padrao da RA
     `/^\d{9,11}$/`) em vez de contar celulas;
   - **restricoes medidas** (campos obrigatorios, limite de periodo, mensagens de erro reais);
   - status honesto no fim: `CONFIRMADO` (replicado em Node sem navegador) ou
     `CAPTURADO, NAO REPLICADO` ou `SO ABERTURA (tela de escrita)`.
   **Nunca invente um contrato que voce nao capturou.** Documento errado aqui e pior que ausente.
5. Atualize `docs/http/README.md` com um indice das telas e o status de cada uma.

## Criterios de aceite do BLOCO 3
- Existe `docs/http/<CODIGO>.md` para as 19 telas, cada um com status honesto.
- As 11 telas de consulta tem POSTs reais capturados (nao inventados), com ids estaveis.
- Nenhuma gravacao foi feita no portal. Nenhum registro criado/alterado/excluido.
- `scratch/` continua fora do controle de versao (confira o `.gitignore`).

---

# BLOCO 4 — Consertar o ECO709 por HTTP

## Problema conhecido (ja diagnosticado, ver fim do docs/HTTP-ECO707-ECO709.md)
O contrato do ECO709 esta capturado e correto, mas a implementacao HTTP nao funciona:
os filtros cidade/bairro/logradouro sao **macros ZK `caixaPesquisa`**, cada uma com um
`txtCodigo` interno. Pegar "o primeiro `txtCodigo` da arvore" preenche so a cidade, e a tela
responde *"Favor informar o codigo da cidade"*.

## O que fazer
1. Resolva o uuid do `txtCodigo` **de cada macro**, ancorando pelo id estavel da macro pai
   (`pesquisaCidade`, `pesquisaBairro`, `pesquisaLogradouro`, `pesquisaServico`) e descendo
   para o filho — nao por ordem de aparicao na arvore. Coloque isso no `src/http/zk-tree.js`
   como utilitario generico (`resolverFilho(idMacro, idFilho)`), porque o mesmo padrao
   `caixaPesquisa` aparece tambem no **ECO708 e no ECO711** (as outras duas telas que filtram
   por endereco) — resolver aqui destrava as tres.
2. Implemente `src/http/eco709.js` e prove com: cidade 2, bairro 81, logradouro 1945,
   periodo 01/01/2024–31/12/2024. Lembre das restricoes ja medidas: bairro e logradouro sao
   obrigatorios, e periodo > 1 ano e recusado.
3. Atualize `docs/HTTP-ECO707-ECO709.md` trocando a nota de "nao esta funcionando" pelo
   contrato final confirmado (ou, se nao conseguir, registre com precisao o que falta —
   **nao declare confirmado o que nao rodou**).

## Criterios de aceite do BLOCO 4
- `src/http/eco709.js` devolve linhas reais com os filtros acima.
- O utilitario `resolverFilho` esta em `src/http/zk-tree.js` e e usado tambem pelo ECO708/ECO711
  (ao menos documentado como aplicavel).
- A nota de pendencia no `docs/HTTP-ECO707-ECO709.md` foi resolvida ou atualizada com honestidade.

---

# ORDEM DE EXECUCAO

1. BLOCO 1 (offline, maior retorno) — **commit local ao terminar**
2. BLOCO 2 (offline) — **commit local ao terminar**
3. BLOCO 3 (portal, o mais demorado) — **commit local ao terminar** (pode commitar em lotes de telas)
4. BLOCO 4 (portal, o mais dificil) — **commit local ao terminar**

Se um bloco falhar, **nao abandone os seguintes que nao dependem dele**: BLOCO 1 e 2 sao
independentes do portal. Registre o que ficou pendente em `.agy/status.txt` e siga.

# RESTRICOES GERAIS (o que NAO fazer)

- **NAO faca `git push`.** Commits locais apenas. O push e do supervisor.
- **NAO** mexa em `C:\repos\Revisão-Contas-Esgoto` (leitura apenas).
- **NAO** mexa em `.auth/`, em `config/credentials.json`, nem em qualquer senha/segredo.
- **NAO** comite credenciais, cookies, storage-state, nem PII (conta+nome+CPF de cliente real).
  Mascare PII nos docs como o projeto ja faz.
- **NAO** apague `config/capacidades.json` nem `config/catalogo_aplicacoes.json` — sao o
  resultado de uma varredura de 596 telas que custou horas. Se precisar mudar formato, gere
  arquivo novo.
- **NAO** grave nada no portal (ver BLOCO 3).
- **NAO** mexa em proxy/CNTLM.
- Codigo em pt-BR, no estilo do repo (CommonJS, `"use strict"`, sem framework novo).
- **NAO** use `console.log` em codigo carregado pelo servidor MCP (`src/index.js` e `src/tools/`):
  stdout e o canal do protocolo MCP e qualquer print o corrompe. Use `console.error`.

# ARQUIVO DE ENTREGA

Ao final, escreva `RELATORIO_HTTP_19TELAS.md` na raiz do repo com:
- tabela das 19 telas x (doc UI ok? / contrato HTTP: confirmado, capturado ou ausente);
- o que ficou pendente e por que;
- quanto tempo por consulta o caminho HTTP levou vs UI, se mediu.
Seja honesto no relatorio: o supervisor vai auditar arquivo por arquivo.
