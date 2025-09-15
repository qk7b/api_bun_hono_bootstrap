#!/bin/sh
set -e

echo "Applying DB migrations..."
# exec bun run db:init

echo "Starting app..."
exec bun run src/index.ts
