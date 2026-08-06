# Prova de Porte do Cliente HTTP (BLOCO 2)

Data do teste: 2026-08-06
Consulta: ECO707 (RAs por Número de Conta)
Conta testada: `2238097`
Tecnologia: HTTP puro (`PortalHttp` / `Eco707` via `POST /prt/zkau`), sem Playwright.

## Resultado da Execução

- **Tempo de Execução**: < 1.0s (com login HTTP automático)
- **Nome do Titular**: `CRISTIANE A***** M******` (mascarado para PII)
- **Total de RAs Retornadas**: 3

### RAs Encontradas:

| RA | Data Início | Data Execução | Situação | Serviço | Código Serviço |
|---|---|---|---|---|---|
| `15383462024` | 25/06/2024 | 25/06/2024 | EXECUTADO | 1259 - CREDITO/DEVOLUCAO VALOR PAGTO. DUPLICIDADE | 1259 |
| `04053112020` | 06/04/2020 | 06/04/2020 | EXECUTADO | 1315 - FECHAMENTO ATENDIMENTO - TITULARIDADE | 1315 |
| `01879002017` | 26/04/2017 | 26/04/2017 | EXECUTADO | 1214 - INFORMACOES DE VALORES DA CONTA | 1214 |

## Validação dos Critérios do BLOCO 2
- `src/http/portal-http.js`, `src/http/zk-tree.js`, `src/http/saneago-http.js` e `src/http/eco707.js` integrados e operacionais.
- Consulta rodada sem dependência de navegador (Playwright).
- Desempenho medido e dados idênticos à documentação ZK original.
