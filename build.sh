#!/bin/bash
# Detener la ejecución si algún comando falla
set -e

echo "--- Running Prisma Generate ---"
pnpm prisma generate

echo "--- Prisma Generate Finished. Listing Client Files: ---"
# Listar contenido de node_modules/.prisma/client (si existe)
if [ -d "node_modules/.prisma/client" ]; then
  ls -l node_modules/.prisma/client/
else
  echo "Directory node_modules/.prisma/client not found."
fi

echo "--- Starting Next Build ---"
pnpm next build

echo "--- Next Build Finished ---"