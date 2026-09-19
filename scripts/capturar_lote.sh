#!/usr/bin/env bash
# ==============================================================================
# capturar_lote.sh — Captura automática de evidências de telas Saneago
# ==============================================================================
# Executa a inspeção via Playwright diretamente no macOS (fora da sandbox de rede
# do Claude Desktop) para consultar e gravar as evidências em docs/mapeamento/evidencias/.
#
# Uso:
#   ./scripts/capturar_lote.sh              # Pega automaticamente os 3 próximos do backlog
#   ./scripts/capturar_lote.sh ECO112 ECO113 # Passa apps específicas
# ==============================================================================

set -e

DIR_RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR_RAIZ"

# 1. Definir os códigos das aplicações
if [ "$#" -gt 0 ]; then
  APPS=("$@")
  echo ">>> [Captura] Códigos fornecidos: ${APPS[*]}"
else
  echo ">>> [Captura] Consultando os próximos 3 do backlog..."
  APPS_JSON=$(node scripts/backlog-mapeamento.js --proximo 3)
  APPS=($(echo "$APPS_JSON" | node -e '
    const data = JSON.parse(require("fs").readFileSync(0, "utf8"));
    console.log(data.map(d => d.codigo).join(" "));
  '))
  echo ">>> [Captura] Próximo lote identificado: ${APPS[*]}"
fi

if [ ${#APPS[@]} -eq 0 ]; then
  echo ">>> [Aviso] Nenhuma aplicação pendente encontrada."
  exit 0
fi

# 2. Executar o inspetor Playwright com as credenciais locais
echo ">>> [Playwright] Iniciando inspeção na Saneago..."
node scripts/executar_lote_inspecao.js "${APPS[@]}"

echo ""
echo ">>> [Sucesso] Evidências gravadas em docs/mapeamento/evidencias/:"
for cod in "${APPS[@]}"; do
  ls -lh "docs/mapeamento/evidencias/${cod}.inspect.json" 2>/dev/null || true
done
echo ">>> Pronto! Pode pedir ao assistente para processar o lote: ${APPS[*]}"
