# Supervisório Web (Automação)

O sistema de **Automação / Supervisório Web** da Saneago é a plataforma responsável pela telemetria em tempo real, monitoramento de níveis de reservatórios, status de bombas, vazões, pressões e produção das unidades operacionais.

As seguintes ferramentas MCP (tools) estão disponíveis para interação com o Supervisório Web de forma automatizada:

- **`saneago_supervisorio_telemetria`**: Leitura em tempo real por unidade. Informa níveis, vazões e status de bombas (ON/OFF).
- **`saneago_supervisorio_historico`**: Consulta a série temporal de medições de sensores num período, agregando e retornando min/max/média. Suporta múltiplos componentes na mesma requisição.
- **`saneago_supervisorio_minima_noturna`**: Consulta os dados de mínima noturna (perdas/vazamentos) por DMC (Distrito de Medição e Controle).
- **`saneago_supervisorio_listar_componentes`**: Lista o catálogo de componentes, sensores e dispositivos disponíveis para telemetria em uma determinada unidade operacional.
- **`saneago_supervisorio_listar_dmcs`**: Lista os DMCs (Distritos de Medição e Controle) cadastrados em uma unidade operacional.
- **`saneago_supervisorio_horimetro`**: Consulta a totalização de horas trabalhadas ou o detalhamento cronológico de acionamentos (ligado/desligado) de um conjunto motor-bomba por período.

> **Importante:** Todas as ferramentas do Supervisório Web são estritamente **read-only**. Não existem comandos expostos para ligar/desligar bombas, acionar válvulas ou modificar parâmetros via MCP por restrições operacionais e de segurança de projeto.

