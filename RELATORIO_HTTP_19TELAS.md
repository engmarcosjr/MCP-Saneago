# Relatório de Auditoria e Status HTTP (19 Telas Prioritárias)

Data de Atualização: 2026-08-06  
Repositório: `C:\repos\MCP-Saneago`

---

## 1. Resumo da Auditoria e Correções Aplicadas

Após auditoria interna nos BLOCOS 3 e 4, a documentação manual em `docs/http/` foi descontinuada e substituída por uma abordagem **mecanicamente determinística** (`src/gerar_doc_http.js`).

### Principais correções:
1. **Zero IDs inventados**: 100% dos IDs documentados em `docs/http/` foram extraídos diretamente da árvore ZK capturada em `scratch/zkau_<APP>.txt` e validados pelo script `scripts/validar_docs_http.js`.
2. **Status Auditado**: O status `CONFIRMADO` foi removido de todas as telas que não possuíam prova de replay por HTTP. O status é calculado automaticamente pelo script em:
   - **`REPLICADO`**: Somente quando existe arquivo de evidência de replay técnico em `docs/http/_replay_<APP>.txt`.
   - **`ARVORE CAPTURADA (sem POST)`**: Para telas cuja árvore de widgets foi capturada com fidelidade, mas cuja sequência de POSTs de operação ainda não foi observada.
3. **Resolução de sessão do ECO709**: O cliente `src/http/eco709.js` foi corrigido para tratar sessões já autenticadas, permitindo a execução sequencial sem falha de login e devolvendo 14 registros reais.

---

## 2. Tabela Geral das 19 Telas e Status Atual

| Código | Nome da Aplicação | Natureza | Status HTTP (Calculado) | Prova de Replay | Observações |
|---|---|---|---|---|---|
| **LRS010** | Distribuição de Serviços | ESCRITA | `ARVORE CAPTURADA (sem POST)` | Sem replay | Tela de escrita (preservada por regra). |
| **LRS034** | Validação RA Corte Asfalto | CONSULTA | `ARVORE CAPTURADA (sem POST)` | Sem replay | Árvore e IDs auditados. |
| **LRS041** | Relatório Recomposição Asfáltica | CONSULTA | `ARVORE CAPTURADA (sem POST)` | Sem replay | Árvore e IDs auditados. |
| **LRS100** | Manter Estoque Material por Viatura | CONSULTA | `ARVORE CAPTURADA (sem POST)` | Sem replay | Árvore e IDs auditados. |
| **LRS105** | Cadastra Retorno RA | ESCRITA | `ARVORE CAPTURADA (sem POST)` | Sem replay | Tela de escrita (preservada por regra). |
| **LRS208** | Consulta RA / DS | CONSULTA | `REPLICADO` | `_replay_LRS208.txt` | Replicado via HTTP com retorno de grade. |
| **LRS272** | Monitorar Atendimento | CONSULTA | `ARVORE CAPTURADA (sem POST)` | Sem replay | Árvore e IDs auditados. |
| **ECO151** | Cadastro de Usuário | ESCRITA | `ARVORE CAPTURADA (sem POST)` | Sem replay | Tela de escrita (preservada por regra). |
| **ECO154** | Consulta Usuário | CONSULTA | `REPLICADO` | `_replay_ECO154.txt` | Replicado via HTTP com retorno de grade. |
| **ECO202** | Movimentação de Hidrômetro | ESCRITA | `ARVORE CAPTURADA (sem POST)` | Sem replay | Tela de escrita (preservada por regra). |
| **ECO205** | Consulta Hidrômetro | CONSULTA | `ARVORE CAPTURADA (sem POST)` | Sem replay | Árvore e IDs auditados. |
| **ECO701** | Registro de Atendimento | ESCRITA | `ARVORE CAPTURADA (sem POST)` | Sem replay | Tela de escrita (preservada por regra). |
| **ECO707** | Consulta RA por Número de Conta | CONSULTA | `REPLICADO` | `_replay_ECO707.txt` | Replicado via HTTP (0,13s / consulta). |
| **ECO708** | Consulta RA por Solicitante | CONSULTA | `ARVORE CAPTURADA (sem POST)` | Sem replay | Árvore e IDs auditados. |
| **ECO709** | Consulta RA por Logradouro | CONSULTA | `REPLICADO` | `_replay_ECO709.txt` | Replicado via HTTP (14 RAs reais retornadas). |
| **ECO711** | RA em Execução / Executado | CONSULTA | `ARVORE CAPTURADA (sem POST)` | Sem replay | Árvore e IDs auditados. |
| **ECO712** | História do Usuário | CONSULTA | `ARVORE CAPTURADA (sem POST)` | Sem replay | Árvore e IDs auditados. |
| **ECO731** | Alteração e Impressão de RA | ESCRITA | `ARVORE CAPTURADA (sem POST)` | Sem replay | Tela de escrita (preservada por regra). |
| **MTG020** | Relatório Usuários Virtuais | RELATORIO | `ARVORE CAPTURADA (sem POST)` | Sem replay | Árvore e IDs auditados. |

---

## 3. O Que Ainda Falta

1. **Sequência de POSTs de 15 telas**: Embora os IDs estáveis, classes ZK (`zul.inp.Textbox`, `zul.db.Datebox`, etc.) e colunas de grade das 15 telas em `ARVORE CAPTURADA (sem POST)` estejam 100% corretos e auditados, a sequência exata de eventos POST HTTP (ex: `onChange` + `onBlur` + `onClick`) ainda não foi gravada/observada em tráfego real nessas 15 telas.
2. **Replay HTTP Adicional**: Das 19 telas, 4 estão atestadas e comprovadas por replay HTTP (`ECO707`, `ECO709`, `LRS208`, `ECO154`). Caso seja necessário automatizar via HTTP puro alguma das 15 telas restantes no futuro, deve-se realizar a captura do tráfego POST (`scripts/capturar_zkau.js`), gerar o arquivo `_replay_<APP>.txt` e re-rodar `node src/gerar_doc_http.js`.
3. **Restrição de Escrita em Produção**: As 6 telas de escrita (`LRS010`, `LRS105`, `ECO151`, `ECO202`, `ECO701`, `ECO731`) permanecem mantidas estritamente em modo leitura/árvore capturada, por política de segurança contra alterações acidentais em produção.
