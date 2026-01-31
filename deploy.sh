#!/bin/bash
echo "🚀 Iniciando Deploy do EventSpace..."

git pull origin main
docker compose build app-prod

# Roda migrations antes de subir o app. Se falhar, o app antigo continua no ar!
docker compose --profile prod run --rm migrate-prod

# Sobe/Reinicia apenas o necessário
docker compose --profile prod up -d app-prod redis

echo "🧹 Removendo lixo de builds antigos..."
docker image prune -f
echo "✅ EventSpace Online!"