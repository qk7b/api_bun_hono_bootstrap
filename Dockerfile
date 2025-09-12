# Use the official Bun image as the base
FROM oven/bun:1.2.21

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and bun.lockb (or package-lock.json) first to leverage Docker cache
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile --production

# Copy the rest of the application
COPY . .

# Generate prisma client
RUN bunx prisma generate

# Expose the port your Hono app runs on (default is 3000)
EXPOSE 3000

# Command to run your Hono app
CMD ["bun", "run", "index.ts"]