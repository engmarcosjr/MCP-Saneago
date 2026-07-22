# DECISÃO ARQUITETURAL: TRATAMENTO DAS 11 APLICAÇÕES FORA DO CONTAINER ZK

**Data:** 2026-07-22  
**Autor:** Antigravity (Executor MCP-Saneago)

---

## 1. Contexto

Durante a varredura automatizada do catálogo de **596 aplicações** no portal ZK da Saneago, **11 aplicações** registraram status de erro (`erro: true`) ao tentar capturar o DOM do container de iframe ZK.

A análise empírica revelou que **nenhuma dessas 11 falhas é defeito do robô de captura**, mas sim uma característica estrutural da aplicação (sistemas externos, downloads de PDF, mapas GIS, BI em popup ou restrição de perfil no ZK).

---

## 2. Matriz de Classificação e Decisão

| Código | Nome no Catálogo | Categoria / Diagnóstico | Decisão Arquitetural |
|---|---|---|---|
| **BPAV004** | Gestão de Empregados no Teletrabalho | Restrição de Perfil ZK | **Fora do Escopo por Permissão:** A conta de serviço não tem role LDAP. Manter indexado com `erro: true`. |
| **BPAV005** | Reporte de Atividades de Teletrabalho | Restrição de Perfil ZK | **Fora do Escopo por Permissão:** Idem a BPAV004. |
| **BPAV006** | Painel de Empregados em Teletrabalho | Restrição de Perfil ZK | **Fora do Escopo por Permissão:** Idem a BPAV004. |
| **ECO815** | Coletânea de Diretrizes Comerciais | Download direto de PDF | **Fora do Escopo ZK / Adaptador PDF:** Dispara download. Classificar como `tecnologia: "ged_pdf"`. |
| **ECO954** | Painel de Religação | Dashboard BI (Popup) | **Fora do Escopo ZK DOM:** Dashboard PowerBI/Metabase externo. Classificar como `tecnologia: "bi_externo"`. |
| **ECO962** | Painel de Cortes | Dashboard BI (Popup) | **Fora do Escopo ZK DOM:** Idem a ECO954. |
| **FGIV005** | Consulta de documentos digitalizados | Sistema de GED Externo | **Fora do Escopo ZK DOM:** GED legado desacoplado. Classificar como `tecnologia: "ged_pdf"`. |
| **LIG002** | Mapa Web SanSIG | Sistema GIS (Popup) | **Fora do Escopo ZK DOM:** Interface mapa ArcGIS/SanSIG. Classificar como `tecnologia: "gis_externo"`. |
| **LIGV002** | Mapa Web SanSIG | Sistema GIS (Popup) | **Fora do Escopo ZK DOM:** Idem a LIG002. |
| **MGOV050** | Painel Estatístico Ouvidoria | Dashboard BI (Popup) | **Fora do Escopo ZK DOM:** Dashboard estatístico externo. Classificar como `tecnologia: "bi_externo"`. |
| **EAC799** | Relatório de Acompanhamento | Tela de Contingência | **Fora do Escopo ZK DOM:** Tela sem formulário interativo. Classificar como `tecnologia: "relatorio_estatico"`. |

---

## 3. Diretriz para o Consumidor LLM / Servidor MCP

1. **Garantia de Transparência:** A tool `saneago_descobrir_aplicacao` não encobre estas 11 telas; elas constam no índice com `erro: true` e multiplicador de penalidade `0.1`, evitando que sejam sugeridas como opção operacional ZK para a LLM.
2. **Sem Adaptadores Inúteis:** O servidor MCP **não** criará adaptadores simulados ou mockados para BI/GIS em popup. Se a LLM solicitar uma ação no GIS SanSIG (`LIG002`), a tool responderá honestamente que a aplicação opera via GIS externo fora do container de automação ZK.
