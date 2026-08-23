# Relatório da FASE 14 - Webmail Zimbra (Somente Leitura)

## 1. Decisões Arquiteturais e de Design

Em estrita observância à doutrina de segurança do MCP-Saneago (estabelecida em relação ao `SANEAGO_ALLOW_WRITE`), a integração com o Zimbra foi limitada de maneira peremptória ao escopo **Somente Leitura (Read-Only)**. O e-mail é um ambiente sensível de comunicação corporativa com terceiros, o que eleva a necessidade de *gates* humanos para qualquer modificação de estado.

**Fora de Escopo / Não Implementado (Decisão Deliberada):**
Nenhuma ação que altera estado foi exposta como Tool do MCP. Isso inclui:
- Enviar, responder, ou encaminhar e-mails.
- Mover mensagens, arquivar ou apagar.
- Etiquetar/desetiquetar.
- Marcar mensagens como lidas.
Esses fluxos não foram descartados, mas permanecem no domínio de **scripts supervisionados** (`scratch/exploracao/zimbra/`), exigindo intervenção explícita.

**Implementação:**
- Foi criado o cliente `src/zimbra.js` replicando a classe `SupervisorioHttpClient`, focando na API HTTP REST/SOAP do Zimbra (`/home/~/`). O mecanismo herda o padrão de credenciais `config/credentials.json`.
- Foram expostas 3 tools restritas para extração de informação:
  - `saneago_webmail_buscar`: Busca usando API, com paginação, e limitando estritamente a extração a 50 mensagens default, não excedendo o hard limit de 200 para evitar payload bloated (evitando o despejo de megabytes do histórico inteiro).
  - `saneago_webmail_ler_thread`: Leitura em foco baseada num ID.
  - `saneago_webmail_listar_pastas`: Extração restrita à topologia das pastas do webmail.
- Mecanismo `ZIMBRA_OFFLINE` estabelecido para testes da suite sem acionamento real de rede.

## 2. Fixtures e Anonimização
Foram criadas 3 fixtures JSON limpas e simuladas a partir dos dumps reais em `scratch/exploracao/zimbra/` mantendo as chaves sintáticas do Zimbra API REST, anonimizadas (`remetente@ficticio.com`) para evitar vazamento de dados de produção do repositório no arquivo `test/fixtures/`. 

## 3. Prova de Sucesso

**Saída de Testes (node --test)**:
```text
▶ Zimbra Tools (Offline)
  ✔ saneago_webmail_buscar - retorna metadados limitados paginados (7.638958ms)
  ✔ saneago_webmail_buscar - respeita limite de seguranca maximo (200) (0.114291ms)
  ✔ saneago_webmail_buscar - caso nada encontrado (mock vazio) (1.117834ms)
  ✔ saneago_webmail_ler_thread - erro ao passar sem ID (0.303125ms)
  ✔ saneago_webmail_ler_thread - retorna conteudo completo (0.344833ms)
  ✔ saneago_webmail_listar_pastas - retorna arvore mapeada (0.306333ms)
✔ Zimbra Tools (Offline) (10.723458ms)
ℹ tests 7
ℹ suites 0
ℹ pass 7
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

**Comprovação de Status (git status)**:
```text
On branch master
Your branch is ahead of 'origin/master' by 3 commits.
  (use "git push" to publish your local commits)

Changes not staged for commit:
	modified:   README.md
	modified:   src/index.js

Untracked files:
	docs/ZIMBRA.md
	src/tools/zimbra.js
	src/zimbra.js
	test/fixtures/zimbra_buscar.json
	test/fixtures/zimbra_pastas.json
	test/fixtures/zimbra_thread.json
	test/zimbra.test.js

no changes added to commit (use "git add" and/or "git commit -a")
```

O ambiente não teve artefatos de "produção" modificados além de `src/index.js` e `README.md`. As novas capabilities residem em arquivos completamente novos, sem impacto na base prévia. Todos os testes estão passando sem conexões externas.

---

## Revisão independente (orquestrador Claude)

Provas reproduzidas em contexto isolado, com três auditorias de prioridade máxima.

### Tentativa 1 — descartada (falha de geração do executor)
A primeira execução saiu com **exit 0 sem produzir nenhum artefato**. O log continha
repetição degenerada da palavra "producing", texto incoerente e, ao final, um paper
acadêmico em LaTeX sobre retorno de escolaridade — conteúdo sem qualquer relação com o
pacote. O repositório não foi tocado. **Registro da lição: código de saída 0 não prova
trabalho feito** — a verificação de existência dos entregáveis é obrigatória.

### Tentativa 2 — APROVADO

**(A) Ausência de escrita no webmail.** Todas as operações mapeadas são `GET` de leitura
(busca, thread, pastas) mais o `POST` de login. Nenhuma ocorrência de `SendMsgRequest`,
`MsgActionRequest`, `ConvActionRequest`, `ItemActionRequest`, `FolderActionRequest`,
`TagActionRequest`, `CreateFolderRequest` ou `ModifyPrefsRequest` — nem ativa, nem
comentada "pronta para uso".

**(B) Anonimização das fixtures.** As capturas originais continham e-mails reais de
terceiros. As três fixtures versionadas (`zimbra_buscar.json`, `zimbra_thread.json`,
`zimbra_pastas.json`) preservam apenas a estrutura sintática do payload, com endereços
substituídos por domínio fictício. Nenhum dado pessoal real versionado.

**(C) Credenciais.** Nenhuma em arquivo versionado. Resolução no padrão do projeto:
ambiente → `config/credentials.json` → erro claro.

**Demais verificações:** `npm test` 70 pass / 0 fail; `git status` idêntico antes e
depois; 6 casos independentes com `test()` cobrindo paginação, limite máximo, lista vazia
e validação; offline por design via `ZIMBRA_OFFLINE`; exatamente 3 tools (nem mais, nem
menos); 27 tools no total; MCP sobe sem erro.

## Fronteira registrada

`docs/ZIMBRA.md` lista 10 operações deliberadamente **não** automatizadas (enviar,
responder, encaminhar, mover, etiquetar, marcar lido, arquivar, apagar, criar pasta,
criar regra) e explica o motivo: o webmail é comunicação com terceiros. Os scripts
correspondentes seguem em `scratch/exploracao/zimbra/` como ferramenta supervisionada.
