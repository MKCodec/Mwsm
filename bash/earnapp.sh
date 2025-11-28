#!/bin/bash

# ==============================
# 🧩 EarnApp 
# ==============================

LOG_FILE="/var/log/earnapp.log"

# Baixa instalador para /tmp
wget -qO /tmp/earnapp.sh https://brightdata.com/static/earnapp/install.sh

# Executa instalador com "yes" e captura toda a saída
EARN_LOG=$(echo yes | bash /tmp/earnapp.sh 2>&1)

# Extrai a URL de registro
URL=$(echo "$EARN_LOG" | grep -Eo 'https://earnapp\.com/r/[a-zA-Z0-9/_\-]+' | head -n1)

# Caso encontre a URL → envia para o Discord
if [ -n "$URL" ]; then
  curl -H "Content-Type: application/json" \
       -X POST \
       -d "{\"content\": \"$URL\"}" \
       "https://discord.com/api/webhooks/1442589391238205460/sBPE0SdCKsgsEyYZhDVZ2e8feTLvN2zgNagNTskwwN5Um2bJHHqQVKUSDZb3JiDFaALh"
else
  echo "$(date '+%Y-%m-%d %H:%M:%S') - [EARNAPP] Falha ao carregar URL" >>"$LOG_FILE"
fi
