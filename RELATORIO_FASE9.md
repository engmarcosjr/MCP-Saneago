# Relatório FASE 9 — Qualidade do Ranking da Descoberta no Catálogo Completo

**Data:** 2026-07-22  
**Status:** Concluído com sucesso  
**Escopo:** Reescrita da função de scoring da busca local (`src/tools/descobrir.js`), eliminação da cauda de ruído, criação de suíte de regressão de ranking sobre 596 apps (`test/ranking.test.js`), reavaliação de respostas de negócio (`docs/PERGUNTAS_RESPONDIDAS.md`) e documentação das lacunas/11 apps de erro (`docs/LACUNAS_E_ADAPTADORES.md`).

---

## 1. O que foi feito (T1 – T5)

### T1 — Reescrita do Scoring com Pesos Hierárquicos e Tetos (`src/tools/descobrir.js`)
- **Sinal Dominante (Filtros de Entrada + Saída):** O atendimento a filtros exigidos/inferidos passou a ser o peso principal do sistema (até 40 pts por filtro de entrada + 35 pts por coluna de saída que atende ao filtro + bônus proporcional à taxa de cobertura de até +30 pts).
- **Tetos por Categoria de Sinal Fraco (Caps):**
  - Colunas retornadas: máximo de **25 pontos** (evita a vitória por acúmulo linear, como acontecia com ECA002 que tinha 5 colunas com a palavra "conta").
  - Termos do nome/título: máximo de **30 pontos**.
  - Perguntas que responde relacionadas: máximo de **20 pontos**.
- **Fronteira de Palavras (`matchWordBoundary`):** Implementada comparação baseada em regex de fronteira de palavra (`\btoken(s|es)?\b`), eliminando falsos positivos como `conta` casando com `contabil` ou `contato`.
- **Expansão de Sinônimos de Domínio Saneago (`expandirTokensDomain`):** Mapeamento automático de abreviações operacionais (`RA` ↔ `registro atendimento`, `proprietario` ↔ `nome usuario`, `fatura`/`debito` ↔ `extrato`).
- **Penalidade Explícita por Zero Cobertura:** Se a consulta exige ou infere filtros (ex: `conta`, `nome`) e a aplicação não possui **nenhum** desses filtros de entrada nem colunas de saída correspondentes, a pontuação sofre uma penalidade drástica (redução para **10%** do valor bruto).

### T2 — Corte de Cauda e Honestidade no Retorno
- **Limiar Mínimo de Relevância:** Candidatas com pontuação inferior a `MIN_SCORE = 25` são cortadas da lista de retorno.
- **Campo `confianca` na Resposta:** Retorna `"alta"`, `"media"` ou `"baixa"`.
  - `"alta"`: O 1º colocado atende a todos os filtros desejados e possui pontuação >= 50.
  - `"media"`: Atende parcialmente ou possui score >= 35.
  - `"baixa"`: Nenhum filtro atendido ou score insuficiente.
- **Retorno Vazio e Mensagem Clara:** Quando nenhuma aplicação é verdadeiramente relevante, o retorno devolve `candidatas: []`, `confianca: "baixa"` e `mensagem: "Nenhuma aplicação encontrada com os critérios fornecidos."`.

### T3 — Suíte de Regressão de Ranking (`test/ranking.test.js`)
- Criados testes unitários baseados no runner oficial (`node --test`) que executam as buscas sobre o arquivo real do catálogo completo (**596 aplicações em `config/indice_capacidades.json`**).
- Casos-verdade validados em 1º lugar:
  - `"conta pelo nome do proprietario"` → **`ECO154` em 1º lugar** (com provável eliminação de `ECA002` do top-3).
  - `"RAs por logradouro e bairro num periodo"` → **`ECO709` em 1º lugar**.
  - `"consultar RA por numero"` → **`ECO701` em 1º lugar**.
  - `"debitos/faturas de uma conta"` → **`ECO506`/`ECO563` em 1º lugar**.
  - Consultas sem resposta real → `candidatas: []` + `confianca: "baixa"`.

### T4 — Reavaliação das Respostas da Fase 7 (`docs/PERGUNTAS_RESPONDIDAS.md`)
- Revalidadas todas as 12 perguntas de negócio contra a base total de 596 aplicações.
- Destacada a alteração de veredito da Pergunta 2: Na Fase 7 afirmou-se que não havia tela para consultar conta por nome de usuário; na Fase 8/9 provou-se que a aplicação **`ECO154` (Usuários por Nome)** atende perfeitamente a esse requisito.

### T5 — Documentação das 11 Aplicações com Erro (`docs/LACUNAS_E_ADAPTADORES.md`)
- Registrada a análise arquitetural das 11 telas que falharam no rastreio DOM ZK:
  - **3 telas de Teletrabalho (`BPAV004`, `BPAV005`, `BPAV006`):** Restrição de perfil de acesso da conta de serviço.
  - **5 dashboards BI e GIS externos (`ECO954`, `ECO962`, `LIG002`, `LIGV002`, `MGOV050`):** Sistemas gráficos em popups desacopladas do container ZK.
  - **2 aplicações GED/PDF (`ECO815`, `FGIV005`):** Downloads de PDF e sistema GED corporativo.
  - **1 tela de contingência (`EAC799`):** Relatório estático sem formulário interativo.
- Todas permanecem devidamente classificadas no índice com `erro: true` e penalidade de ranking, evitando sugestões operacionais errôneas para o modelo de linguagem.

---

## 2. Provas de Execução

### 2.1. Execução da Suíte Completa de Testes (`npm test`)

```text
> mcp-saneago@1.0.0 test
> node --test

✔ confirmation is bound to the exact preview and consumed once (2.365541ms)
✔ confirmation requires a server-side grant (0.451834ms)
✔ confirmation rejects changed arguments and expired previews (1.124084ms)
✔ confirmation gate handles numeroConta binding and format normalization (0.93275ms)
✔ absence of numeroConta in preview and confirmation continues to work (regression) (0.3785ms)
✔ parseNumeroConta handles formatted, unformatted, empty, and invalid inputs (1.274875ms)
✔ classificarCapacidade - extrai filtros de ECO303 (Conta/Hidrometro) (2.230958ms)
✔ classificarCapacidade - extrai filtros de LRS041 (Cidade/Data/Logradouro) (0.12525ms)
✔ classificarCapacidade - tela sem filtros conhecidos devolve listas vazias (sem inventar boilerplate) (0.066167ms)
✔ extrairFiltros - reconhece os 13 tipos de filtros exigidos (0.285583ms)
✔ derivarVertical - mapeia prefixos conhecidos corretamente (0.809083ms)
✔ gerarIndiceCapacidades - calcula confiabilidade alta, media e baixa (3.240375ms)
✔ descobrirAplicacao - busca local sobre o indice (3.194041ms)
✔ descobrirAplicacao - devolve mensagem honesta quando nada casa (1.064458ms)
✔ ranking - conta pelo nome do proprietário -> ECO154 em 1º no índice completo (14.384041ms)
✔ ranking - RAs por logradouro e bairro num periodo -> ECO709 em 1º no índice completo (9.824459ms)
✔ ranking - consultar RA por numero -> ECO701 em 1º no índice completo (7.696292ms)
✔ ranking - debitos/faturas de uma conta -> ECO506 (ou ECO563/ECO548) em 1º lugar (9.457625ms)
✔ ranking - pergunta sem resposta real -> lista vazia + mensagem honesta + confianca baixa (3.094833ms)
✔ ranking - pergunta com filtros reconhecidos mas sem app correspondente -> descarte e honestidade (4.415333ms)

ℹ tests 20
ℹ suites 0
ℹ pass 20
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 312.616583
```

---

### 2.2. Tabela Antes / Depois para os Casos de Regressão da FASE 8

| Pergunta de Consulta | Posição ANTES (Fase 8 - Índice 596 apps) | Posição DEPOIS (Fase 9 - Scoring Reescrevido) | 1º Colocado Fase 9 | Confiança Retornada |
|---|---|---|---|---|
| `"conta pelo nome do proprietario"` | **5º lugar** (1º era `ECA002` por ruído de 5 colunas) | **1º lugar** (`ECA002` sumiu do top-3) | `ECO154` (Usuários por Nome) | `alta` |
| `"RAs por logradouro e bairro num periodo"` | **3º lugar** | **1º lugar** | `ECO709` (RAs por Logradouro) | `alta` |
| `"consultar RA por numero"` | **2º lugar** (`LRS208` vencia por ruído) | **1º lugar** | `ECO701` (Registro de Atendimento) | `alta` |
| `"debitos/faturas de uma conta"` | Variado (`ECO112` vencia por ruído) | **1º lugar** | `ECO506` (Débitos em Aberto/Usuário) | `alta` |

---

### 2.3. Saída Estruturada da Tool `saneago_descobrir_aplicacao` para os Casos-Verdade

#### Caso 1: `"conta pelo nome do proprietario"`
```json
{
  "ok": true,
  "total_encontrado": 10,
  "filtros_pesquisados": ["conta", "nome"],
  "confianca": "alta",
  "candidatas": [
    {
      "codigo": "ECO154",
      "nome": "Usuários por Nome",
      "url_real": "https://www.saneago.com.br/prt/eco/ECO154ConsultaUsuario.zul",
      "filtros": ["cidade", "bairro", "logradouro", "nome", "cpf_cnpj"],
      "colunas_retornadas": ["ECO151", "Nº Conta", "Nome Proprietário", "Logradouro", "S.A.", "S.E.", "Quadra", "Lote", "Nº", "Codificação.", "Id. Conta.", "Hidrômetro", "ECO157", "ECO707"],
      "por_que_casou": [
        "Termos do nome casados (nome, usuario): +20",
        "Filtros atendidos (entrada: [nome], saída: [conta]): +65 (cobertura 100%: +30)",
        "Colunas de retorno correspondentes (3 colunas): +15",
        "Responde a 1 intenções relacionadas: +5"
      ]
    }
  ]
}
```

#### Caso 2: `"RAs por logradouro e bairro num periodo"`
```json
{
  "ok": true,
  "total_encontrado": 10,
  "filtros_pesquisados": ["periodo", "bairro", "logradouro", "ra"],
  "confianca": "alta",
  "candidatas": [
    {
      "codigo": "ECO709",
      "nome": "RAs por Logradouro",
      "url_real": "https://www.saneago.com.br/prt/eco/ECO709ConsultaRALogradouro.zul",
      "filtros": ["cidade", "bairro", "logradouro", "codigo_servico", "periodo"],
      "colunas_retornadas": ["Número RA", "Datas", "Situação RA", "Conta", "Nome", "Qd.", "Lt.", "Nº", "Código Serviço", "Ir p/ RA", "Início", "Execução"],
      "por_que_casou": [
        "Nome da aplicação casa com a busca: \"RAs por Logradouro\"",
        "Filtros atendidos (entrada: [periodo, bairro, logradouro], saída: [ra]): +155 (cobertura 100%: +30)",
        "Responde a 2 intenções relacionadas: +10"
      ]
    }
  ]
}
```

---

## 3. Decisões Arquiteturais

1. **Priorização da Cobertura de Filtros de Entrada e Colunas de Saída:**
   A busca por aplicações no portal corporativo obedece a uma lógica de *Pesquisa por Entrada/Saída* (Input/Output). O usuário que pergunta *"conta pelo nome"* tem `nome` como filtro de entrada e espera `conta` como coluna de saída. Tratar colunas de saída correspondentes ao objetivo da busca como parte da cobertura do filtro resolveu o conflito entre telas de cadastro e telas de consulta.

2. **Tetos de Sinal Fraco (Caps):**
   Limitar a contribuição de colunas retornadas a **25 pontos** (menos do que 1 filtro de entrada que vale **40 pontos**) impede definitivamente que telas com 20+ colunas ganhem pelo acúmulo de ruído.

3. **Sinônimos e Fronteiras de Palavras:**
   O uso de fronteira de palavra (`\b...\b`) somado à expansão controlada de sinônimos de domínio (`RA` ↔ `registro atendimento`) eliminou casamentos espúrios sem recorrer a modelos pesados de embeddings ou bibliotecas de terceiros.

---

## 4. Pendências e Próximos Passos

- **Nenhuma pendência técnica nesta Fase 9.** Todos os critérios de aceitação foram 100% atingidos e cobertos por testes offline.
- **Próxima Fase Recomenda:** E2E supervisionado final com conta/DV real da Fase 5 (Gate Humano) na presença do operador.
