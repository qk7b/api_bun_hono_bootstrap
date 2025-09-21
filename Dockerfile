FROM oven/bun:1.1.21 AS runtime
WORKDIR /app

# Installer uniquement les dépendances de prod
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile --production

# Copier le code de l'app
COPY src ./src

# Port
EXPOSE 3000

# Entrypoint
CMD ["bun", "run", "prod"]