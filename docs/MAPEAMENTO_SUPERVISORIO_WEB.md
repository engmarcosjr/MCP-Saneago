# Mapeamento do Sistema Supervisório Web (Automação Saneago)

## 1. Visão Geral e Contexto de Acesso

O sistema de **Automação / Supervisório Web** da Saneago é a plataforma responsável pela telemetria em tempo real, monitoramento de níveis de reservatórios (RAP/REL), status de bombas e motores (ligado/desligado), vazões (m³/h e médias), pressões, macromedição, produção e mínima noturna/perdas de água em todas as unidades operacionais de Goiás (com forte cobertura em Anápolis e Goiânia).

### Autenticação e SSO
- **URL Base:** `https://www.saneago.com.br/automacao`
- **Fluxo de Acesso Atual:** Devido à autenticação integrada (SSO por cookies de sessão da Intranet), o acesso direto à rota `/automacao` sem cookie de sessão redireciona para a tela de aviso de login via Intranet (`/automacao/login`).
- **Acesso Programático / Playwright:**
  1. Acessar a Intranet em `https://www.saneago.com.br/prt/mpt/montarMenu.zul` (após autenticação corporativa).
  2. Abrir o menu **Sistemas** e clicar no último item: **"Supervisório Web"**.
  3. A aplicação herda a sessão do usuário autenticado no domínio `saneago.com.br` e libera todos os endpoints HTTP/AJAX.

---

## 2. Módulos do Supervisório Web

| Módulo | URL | Finalidade Operacional |
|---|---|---|
| **Supervisório Espelho** | `/automacao/dashboard` | Painel de telemetria em tempo real (níveis %, status ON/OFF de bombas, vazão, pressão). Atualizado minuto a minuto. |
| **Histórico** | `/automacao/historico` | Consulta de séries temporais históricas de sensores (nível, vazão, pressão, status) com exportação CSV e gráficos interativos (AmCharts / Flot). |
| **Alertas / Eventos** | `/automacao/evento` | Log e relatório de eventos e alarmes operacionais disparados pelos PLCs/RTUs. |
| **Horímetro** | `/automacao/horimetro` | Totalização de horas trabalhadas por bomba/conjunto motor-bomba por dia e período. |
| **Horímetro por Evento**| `/automacao/horimetroevento` | Detalhamento temporal de acionamentos e paradas com duração precisa (hh:mm:ss). |
| **Mínima Noturna** | `/automacao/minima` | Análise de vazão mínima noturna por DMC (Distrito de Medição e Controle) para detecção de vazamentos e perdas. |
| **Mínima Noturna GRS** | `/automacao/minimagrs` | Visão consolidada de vazões mínimas noturnas agrupadas por Gerência Regional / Regional. |
| **Mínima Noturna Ponderada**| `/automacao/minimagrsponderada` | Cálculo estatístico com ponderação e histórico dos 10 dias anteriores (l/s e l/h/lig). |
| **Produção** | `/automacao/producao` | Balanço de volumes produzidos e tratados por unidade/ETA/captação. |

---

## 3. Catálogo de APIs e Endpoints REST/AJAX

Todas as requisições utilizam o protocolo HTTP POST com `Content-Type: application/x-www-form-urlencoded; charset=UTF-8` e retornam payloads JSON estruturados.

### 3.1. Telemetria e Monitoramento em Tempo Real
- **`POST /automacao/dashboard/monitorar-unidade`**
  - **Parâmetros:** `unidade` (ex: `6` para Anápolis), `tipo_componente` (opcional: 1=Nível, 2=Volume m3, 3=Status Bomba ON/OFF, 4=Vazão Média, 5=PH/Qualidade, 8=Válvulas/Limitorque).
  - **Retorno:** Array com centenas de sensores contendo `id_componente`, `ds_componente`, `ds_leitura` (ex: "83,9%"), `dt_leitura`, `ds_grupo_componente` (ex: "São Cristóvão", "Filostro Machado", "ETA Água Bruta").

- **`POST /automacao/dashboard/buscar-grupo-componente`**
  - Lista os grupos de componentes da unidade selecionada.

### 3.2. Histórico e Telemetria Temporal
- **`POST /automacao/componente/listar-por-unidade`**
  - **Parâmetros:** `unidade=6`
  - **Retorno:** Catálogo completo com mais de 920 componentes e sensores de Anápolis com `id_componente`, `cd_componente`, `ds_componente`, `id_grandeza`, `id_unidade_medida`, taxa de `amostragem`.

- **`POST /automacao/historico/listar`**
  - **Parâmetros:** `unidade=6`, `componente[]=243397`, `dInicial=YYYY-MM-DD`, `dFinal=YYYY-MM-DD`, `hInicial=00:00:00`, `hFinal=23:59:59`, `flag_historico_anterior=nao`
  - **Suporte a múltiplos sensores:** Repetir múltiplos `componente[]=<id>` na mesma requisição para correlacionar nível e bombas simultaneamente.
  - **Retorno:** JSON com array de pontos amostrados em 5 minutos (`dt_ref`, `id_componente`, `vl_leitura`, `no_componente`, `amostragem`).

- **`GET /automacao/historico/listar-csv?...`**
  - Exportação direta de dados tabulares em CSV.

### 3.3. DMCs, Mínima Noturna e Perdas
- **`POST /automacao/dmc/buscar`**
  - **Parâmetros:** `unidade=6`
  - **Retorno:** Lista de DMCs da cidade com dados de macromedidores e limites de vazão de referência.

- **`POST /automacao/minima/buscar`**
  - **Parâmetros:** `dataInicial=YYYY-MM-DD`, `dataFinal=YYYY-MM-DD`, `unidade=6`, `dmc=<id>`
  - **Retorno:** Volume noturno, ligações ativas, indicador `l/h/lig` (litros por hora por ligação) e comparação com a referência `REF l/h/lig`.

- **`POST /automacao/minima/salvarcomentario`** / **`POST /automacao/minima/excluircomentario`**
  - Gestão de observações operacionais registradas pela equipe técnica.

### 3.4. Horímetros e Operação Eletromecânica
- **`POST /automacao/horimetro/buscarhistorico`**
  - Histórico de horas diárias de funcionamento de bombas.
- **`POST /automacao/horimetroevento/buscarevento`**
  - Relatório cronológico de partidas e paradas de grupos motor-bomba.

### 3.5. Produção
- **`POST /automacao/producao/buscardados`**
  - Volumes totais produzidos (m³) por período e estação de tratamento.

---

## 4. Estrutura de Componentes de Anápolis (Unidade ID: 6)

Durante a varredura foram identificados mais de **920 sensores ativos**, organizados nos seguintes centros e setores operacionais:

1. **Captação e Tratamento:**
   - ETA Água Bruta (Piancó / Captações)
   - ETA Compacta (Unidade ID: 288)
   - Tanques de Contato, Lavagem de Filtros, Turbidímetros e PH
2. **Sistemas de Reservação e Distribuição (RAP / REL):**
   - **Aeroporto:** RAP 1, RAP 2, REL, Booster e macromedição de saída.
   - **Airton Senna:** Níveis de RAP, macromedição de entrada e saída para Bairro de Lourdes.
   - **Aldeia dos Sonhos:** RAP, REL e Bombas B1/B2.
   - **Filostro Machado:** RAP Belvedere, Limitorques Jd. Itália, macromedição.
   - **São Cristóvão:** Níveis de RAP/REL e Bombas B1/B2.
   - **Santo Expedito / Ipanema / Alphaville / Recanto do Sol / DAIA:** Telemetria completa de níveis e pressões.
