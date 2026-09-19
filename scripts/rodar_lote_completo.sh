#!/usr/bin/env bash
# ==============================================================================
# rodar_lote_completo.sh — Captura e Esteira Automatizada
# ==============================================================================
# 1. Executa a captura das 3 próximas telas (Playwright com rede corporativa)
# 2. Mostra status das evidências
# ==============================================================================

set -e

DIR_RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR_RAIZ"

"$DIR_RAIZ/scripts/capturar_lote.sh" "$@"
