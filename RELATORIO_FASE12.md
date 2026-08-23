# RELATÓRIO DA FASE 12 (MCP-Saneago)

## 1. O que foi criado
- **`src/tools/supervisorio.js`**: Novo módulo implementando as 6 ferramentas do Supervisório Web (Telemetria, Histórico, Mínima Noturna, Catálogo de Componentes, DMCs e Horímetro) sobre o `SupervisorioHttpClient`. Foi feita a validação cuidadosa de parâmetros, cálculos de agregações (mínimo, máximo, média e count) para a série temporal e definição de limites default para os endpoints que retornam grandes volumes (ex: limitar lista de componentes a 100 resultados com possibilidade de filtro textual e por grupo). Todas as funções expostas são read-only por natureza. A ferramenta `listar_dmcs` entrou como tool adicional (descoberta útil durante a execução), e a vertical `horimetro` foi entregue neste complemento conforme prometido na FASE 12.
- **Cache de catálogo (T2)**: A ferramenta `saneago_supervisorio_listar_componentes` tenta ler o arquivo `config/supervisorio_componentes_<unidade>.json`. Foi criada uma rotina interna para persistir as respostas caso acesse a API e o arquivo não exista. Como o ambiente de desenvolvimento encontra-se restrito e sem rede (sandbox test), não pudemos gerar o catálogo real completo; portanto, criamos manualmente um pequeno arquivo `config/supervisorio_componentes_6.json` (Mock de Cache) derivado da fixture `scratch_goialandia_leituras.json` para satisfazer os testes. O cache completo para o usuário será gerado em background na primeira execução online.
- **Testes Offline (T3)**: Criado o arquivo `test/supervisorio.test.js` focado em testar a consistência e integridade do módulo. As fixtures disponíveis em `test/fixtures/supervisorio_historico_listar.json` (após conserto de sintaxe JSON do próprio arquivo que possuía vírgula extra no mock anterior) foram utilizadas para assegurar 100% dos testes passando em modo estritamente `offline`.
- **Registro de ferramentas e Documentação (T4)**:
  - Adicionado suporte a 6 ferramentas e suas respectiva lógica em `src/index.js`.
  - Escrito resumo operacional em `docs/apps/SUPERVISORIO.md`.
  - Atualizado o `README.md` incluindo as novas capacidades da suíte MCP.

## 2. Decisões Tomadas
- O script `src/supervisorio_http.js` recebeu o método `consultarHorimetro` de acordo com a documentação do contrato em `docs/MAPEAMENTO_SUPERVISORIO_WEB.md`. Esta modificação foi expressamente autorizada para viabilizar a entrega da vertical Horímetro.
- As configurações `SUPERVISORIO_OFFLINE` de Mocking e os retornos read-only e agregações das API foram concentradas na nova camada `src/tools/supervisorio.js`.
- O cliente de HTTP foi alterado para iniciar a sessão através da abstração interna `await client.login()` da classe caso a rede esteja disponível. Isso previne o acoplamento de chaves ou sessão na inicialização das funções.
- Como foi detectado um erro de sintaxe JSON no registro preexistente `test/fixtures/supervisorio_historico_listar.json`, isso foi corrigido no ambiente local antes da utilização nos testes de validação sem alterar lógicas do Saneago.

## 3. Pendências para o Revisor
- **Catálogo Real por Unidade**: A funcionalidade foi implementada, mas necessitará que o ambiente com rede/login dispare uma primeira pesquisa real (ex: listar_componentes de Anápolis, unid. 6) para gerar dinamicamente o verdadeiro arquivo JSON contendo os +900 componentes no `config/supervisorio_componentes_6.json`. (O arquivo atual é mock).

## 4. Provas (Testes)
Saída REAL do comando `node --test`:

```
✔ confirmation is bound to the exact preview and consumed once (9.620291ms)
✔ confirmation requires a server-side grant (2.061416ms)
✔ confirmation rejects changed arguments and expired previews (4.40875ms)
✔ confirmation gate handles numeroConta binding and format normalization (2.928916ms)
✔ absence of numeroConta in preview and confirmation continues to work (regression) (1.51425ms)
✔ docflow tool - consultarProcessoDocflow via cache_local (3.055291ms)
✔ docflow tool - consultarProcessoDocflow quando nao existe (falha online) (0.32675ms)
✔ docflow tool - pesquisarProcessosDocflowLocal (0.5745ms)
✔ docflow parser - parseProcessoData (50.373208ms)
✔ parseNumeroConta handles formatted, unformatted, empty, and invalid inputs (3.14525ms)
✔ classificarCapacidade - extrai filtros de ECO303 (Conta/Hidrometro) (2.326541ms)
✔ classificarCapacidade - extrai filtros de LRS041 (Cidade/Data/Logradouro) (0.130625ms)
✔ classificarCapacidade - tela sem filtros conhecidos devolve listas vazias (sem inventar boilerplate) (0.065791ms)
✔ extrairFiltros - reconhece os 13 tipos de filtros exigidos (0.271791ms)
[Índice] Gerado com sucesso em: /Volumes/Mac_Dados/Repos/MCP-Saneago/test/tmp_indice_test.json
[Índice] Total: 3 apps (Alta: 1, Média: 1, Baixa: 1, Erros: 1)
[Índice] Gerado com sucesso em: /Volumes/Mac_Dados/Repos/MCP-Saneago/test/tmp_indice_test.json
[Índice] Total: 1 apps (Alta: 1, Média: 0, Baixa: 0, Erros: 0)
[Índice] Gerado com sucesso em: /Volumes/Mac_Dados/Repos/MCP-Saneago/test/tmp_indice_test.json
[Índice] Total: 1 apps (Alta: 1, Média: 0, Baixa: 0, Erros: 0)
✔ derivarVertical - mapeia prefixos conhecidos corretamente (2.568917ms)
✔ gerarIndiceCapacidades - calcula confiabilidade alta, media e baixa (4.722334ms)
✔ descobrirAplicacao - busca local sobre o indice (7.17ms)
✔ descobrirAplicacao - devolve mensagem honesta quando nada casa (2.636167ms)
✔ validarParametrosLRS105 aceita RA e código de serviço válidos (3.386042ms)
✔ validarParametrosLRS105 limpa caracteres não numéricos (0.115375ms)
✔ validarParametrosLRS105 rejeita RA ausente ou inválido (0.863625ms)
✔ validarParametrosLRS105 rejeita código de serviço ausente (2.2285ms)
✔ montarResumoLRS105 constrói array de resumo estruturado (0.256208ms)
✔ ranking - conta pelo nome do proprietário -> ECO154 em 1º no índice completo (31.760583ms)
✔ ranking - RAs por logradouro e bairro num periodo -> ECO709 em 1º no índice completo (17.217708ms)
✔ ranking - consultar RA por numero -> ECO701 em 1º no índice completo (13.138916ms)
✔ ranking - asfalto recomposto por RA / recomposição asfáltica por cidade -> LRS041 no top-3 (46.587ms)
✔ ranking - debitos/faturas de uma conta -> ECO506 (ou ECO563/ECO548) em 1º lugar (23.430458ms)
✔ ranking - pergunta sem resposta real -> lista vazia + mensagem honesta + confianca baixa (9.831292ms)
✔ ranking - pergunta com filtros reconhecidos mas sem app correspondente -> descarte e honestidade (7.901084ms)
✔ supervisorio tool - telemetria via mock_offline (1.485833ms)
✔ supervisorio tool - historico via mock_offline parse and aggregate (0.90225ms)
✔ supervisorio tool - historico missing args (0.428375ms)
✔ supervisorio tool - minima noturna via mock_offline (0.099333ms)
✔ supervisorio tool - listar componentes via cache local (1.158417ms)
✔ supervisorio tool - listar componentes filtrados (0.128959ms)
✔ supervisorio tool - listar DMCs via mock_offline (0.073833ms)
✔ supervisorio tool - horimetro historico via mock_offline (0.072292ms)
✔ supervisorio tool - horimetro evento via mock_offline (0.058875ms)
✔ supervisorio tool - horimetro missing args and bad dates (0.140625ms)
ℹ tests 40
ℹ suites 0
ℹ pass 40
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 586.361958

```

---

## Revisão independente (orquestrador Claude)

Provas reproduzidas por revisor em contexto isolado, sem confiar no autorrelato.

### 1ª rodada — APROVADO COM RESSALVA
- **Nenhuma escrita ou comando em sistema Saneago** — as tools são consulta pura.
  Item auditado com prioridade máxima, conforme a doutrina do projeto.
- `npm test` **37 pass / 0 fail**; `git status` idêntico antes e depois (testes não
  sujam o repositório).
- Offline **por design** via `SUPERVISORIO_OFFLINE`, não por acidente de sandbox.
- Matemática das agregações do histórico conferida contra fixture
  (min=5, máx=20, média=12.5, count=4).
- `src/supervisorio_http.js` não modificado nesta rodada; MCP sobe sem crashar.

**Ressalva:** faltava a tool de **horímetro**, prometida no `PLANO_FASES_11_15.md`.
A causa foi um erro do orquestrador ao traduzir o plano para o pacote de trabalho —
`listar_dmcs` entrou no lugar do horímetro. O executor seguiu corretamente a
especificação que recebeu. `listar_dmcs` foi mantida por ser útil.

### 2ª rodada (complemento horímetro) — APROVADO
- `npm test` **40 pass / 0 fail**, incluindo 3 casos de horímetro, todos offline.
- Endpoints conferidos contra `docs/MAPEAMENTO_SUPERVISORIO_WEB.md`:
  `/automacao/horimetro/buscarhistorico` e `/automacao/horimetroevento/buscarevento`.
- 6 tools `saneago_supervisorio_*` registradas; MCP sobe sem erro; docs e README coerentes.
- `consultarHorimetro` é consulta; erros retornam apenas `message`, sem stack trace.

## Pendência para execução com rede (read-only)

`config/supervisorio_componentes_6.json` está derivado das fixtures. O catálogo real da
unidade (900+ componentes) exige uma varredura **com rede e sem escrita**, a ser feita
com as flags `SANEAGO_ALLOW_*_WRITE=0`.
