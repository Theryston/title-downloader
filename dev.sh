#!/bin/sh
docker compose down
rm -rf db
mkdir db
chmod -R 777 db
docker compose up -d
node ./scripts/import-data.mjs
pnpm next dev --port 3149
