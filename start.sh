#!/bin/sh
rm -rf db
mkdir db
chmod -R 777 db
sonic -c /etc/sonic.cfg &
node ./scripts/import-data.mjs
pnpm next start --port 3149