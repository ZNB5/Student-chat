#!/bin/sh
set -e

# Script para inyectar variables de entorno en runtime
# Se ejecuta cuando el contenedor inicia

# Crear archivo de configuración JavaScript
cat > /usr/share/nginx/html/config.js <<EOF
window.ENV = {
  VITE_API_GATEWAY_URL: "${VITE_API_GATEWAY_URL:-http://localhost:8000}"
};
EOF

echo "Variables de entorno inyectadas:"
cat /usr/share/nginx/html/config.js
